const Report = require("../models/Report");
const Project = require("../models/Project");
const User = require("../models/User");

const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start of week
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// GET /api/dashboard/summary?week=YYYY-MM-DD  (manager only)
const getSummary = async (req, res, next) => {
  try {
    const week = req.query.week ? new Date(req.query.week) : startOfWeek();

    const [members, weekReports, needsCorrectionCount] = await Promise.all([
      User.find({ role: "member", isActive: true }),
      Report.find({ weekStart: week }),
      Report.countDocuments({ status: "needs_correction" }),
    ]);

    const reportedOwnerIds = new Set(
      weekReports.map((report) => String(report.owner)),
    );
    const submittedCount = weekReports.filter(
      (report) => report.status !== "draft",
    ).length;
    const draftCount = weekReports.filter(
      (report) => report.status === "draft",
    ).length;
    const notStartedCount = members.filter(
      (member) => !reportedOwnerIds.has(String(member._id)),
    ).length;

    const complianceRate = members.length
      ? Math.round((submittedCount / members.length) * 100)
      : 0;

    const openBlockers = weekReports.reduce(
      (sum, report) => sum + (report.blockers?.length || 0),
      0,
    );

    res.json({
      week,
      totalTeamMembers: members.length,
      submittedThisWeek: submittedCount,
      draftThisWeek: draftCount,
      notStartedThisWeek: notStartedCount,
      complianceRate,
      needsCorrectionCount,
      openBlockersThisWeek: openBlockers,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/status-by-member?week=YYYY-MM-DD (manager only)
const getStatusByMember = async (req, res, next) => {
  try {
    const week = req.query.week ? new Date(req.query.week) : startOfWeek();
    const [members, weekReports] = await Promise.all([
      User.find({ role: "member", isActive: true }).sort({ name: 1 }),
      Report.find({ weekStart: week }).populate("project", "name"),
    ]);

    const byOwner = new Map(
      weekReports.map((report) => [String(report.owner), report]),
    );

    const data = members.map((member) => {
      const report = byOwner.get(String(member._id));
      return {
        memberId: member._id,
        memberName: member.name,
        status: report ? report.status : "not_started",
        reportId: report ? report._id : null,
        project: report?.project?.name || null,
      };
    });

    res.json({ week, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/tasks-trend?weeks=8&member=<id> (manager only)
const getTasksTrend = async (req, res, next) => {
  try {
    const numWeeks = Math.min(parseInt(req.query.weeks, 10) || 8, 26);
    const earliestWeek = new Date(startOfWeek());
    earliestWeek.setUTCDate(earliestWeek.getUTCDate() - 7 * (numWeeks - 1));

    const filter = { weekStart: { $gte: earliestWeek } };
    if (req.query.member) filter.owner = req.query.member;

    const reports = await Report.find(filter).select(
      "weekStart tasksCompleted",
    );

    const byWeek = new Map();
    reports.forEach((report) => {
      const key = report.weekStart.toISOString().slice(0, 10);
      const completed = report.tasksCompleted.filter(
        (task) => task.status === "completed",
      ).length;
      byWeek.set(key, (byWeek.get(key) || 0) + completed);
    });

    const data = Array.from(byWeek.entries())
      .map(([week, completedTasks]) => ({ week, completedTasks }))
      .sort((itemA, itemB) => (itemA.week > itemB.week ? 1 : -1));

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/workload-by-project?week=YYYY-MM-DD (manager only)
const getWorkloadByProject = async (req, res, next) => {
  try {
    const week = req.query.week ? new Date(req.query.week) : startOfWeek();
    const reports = await Report.find({ weekStart: week }).populate(
      "project",
      "name",
    );

    const byProject = new Map();
    reports.forEach((report) => {
      const key = report.project?.name || "Unassigned";
      const hours = report.tasksCompleted.reduce(
        (totalHours, task) => totalHours + (task.timeSpentHours || 0),
        0,
      );
      const existing = byProject.get(key) || {
        project: key,
        taskCount: 0,
        hoursSpent: 0,
      };
      existing.taskCount += report.tasksCompleted.length;
      existing.hoursSpent += hours;
      byProject.set(key, existing);
    });

    res.json({ week, data: Array.from(byProject.values()) });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/time-by-type?week=YYYY-MM-DD (manager only)
const getTimeByType = async (req, res, next) => {
  try {
    const week = req.query.week ? new Date(req.query.week) : startOfWeek();
    const reports = await Report.find({ weekStart: week }).select(
      "hoursByType",
    );

    const totals = {
      development: 0,
      testing: 0,
      meetings: 0,
      documentation: 0,
      other: 0,
    };
    reports.forEach((report) => {
      Object.keys(totals).forEach((typeKey) => {
        totals[typeKey] += report.hoursByType?.[typeKey] || 0;
      });
    });

    res.json({
      week,
      data: Object.entries(totals).map(([type, hours]) => ({ type, hours })),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/activity?limit=15 (manager only)
const getActivityFeed = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 50);
    const reports = await Report.find({ "reviewHistory.0": { $exists: true } })
      .populate("owner", "name")
      .populate("reviewHistory.reviewer", "name")
      .select("owner reviewHistory weekStart");

    const events = [];
    reports.forEach((report) => {
      report.reviewHistory.forEach((entry) => {
        events.push({
          reportId: report._id,
          memberName: report.owner?.name,
          weekStart: report.weekStart,
          reviewerName: entry.reviewer?.name,
          action: entry.action,
          comment: entry.comment,
          at: entry.reviewedAt,
        });
      });
    });

    events.sort((eventA, eventB) => new Date(eventB.at) - new Date(eventA.at));
    res.json({ data: events.slice(0, limit) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getStatusByMember,
  getTasksTrend,
  getWorkloadByProject,
  getTimeByType,
  getActivityFeed,
};
