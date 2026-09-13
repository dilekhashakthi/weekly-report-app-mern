const Report = require("../models/Report");
const Project = require("../models/Project");

const CONTENT_FIELDS = [
  "weekStart",
  "weekEnd",
  "project",
  "tasksCompleted",
  "tasksPlannedNextWeek",
  "blockers",
  "achievements",
  "hoursByType",
  "notes",
];

const pickContent = (source) => {
  const snapshot = {};
  CONTENT_FIELDS.forEach((field) => {
    snapshot[field] = source[field];
  });
  return snapshot;
};

const canEditContent = (report, user) => {
  if (String(report.owner) !== String(user._id)) return false;
  return ["draft", "needs_correction"].includes(report.status);
};

// GET /api/v1/reports
const listReports = async (req, res, next) => {
  try {
    const {
      member,
      project,
      status,
      dateFrom,
      dateTo,
      week,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};

    if (req.user.role === "member") {
      filter.owner = req.user._id;
    } else if (member) {
      filter.owner = member;
    }

    if (project) filter.project = project;
    if (status) filter.status = status;

    if (week) {
      const start = new Date(week);
      filter.weekStart = { $eq: start };
    } else if (dateFrom || dateTo) {
      filter.weekStart = {};
      if (dateFrom) filter.weekStart.$gte = new Date(dateFrom);
      if (dateTo) filter.weekStart.$lte = new Date(dateTo);
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate("owner", "name email role")
        .populate("project", "name")
        .sort({ weekStart: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Report.countDocuments(filter),
    ]);

    res.json({
      reports,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/reports/:id
const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("owner", "name email role")
      .populate("project", "name")
      .populate("reviewHistory.reviewer", "name role");

    if (!report) return res.status(404).json({ message: "Report not found." });

    if (
      req.user.role === "member" &&
      String(report.owner._id) !== String(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "You can only view your own reports." });
    }

    res.json({ report });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/reports (member only)
const createReport = async (req, res, next) => {
  try {
    const { weekStart, weekEnd, project } = req.body;

    if (project) {
      const proj = await Project.findById(project);
      if (!proj)
        return res
          .status(400)
          .json({ message: "Selected project does not exist." });
    }

    const report = await Report.create({
      owner: req.user._id,
      weekStart,
      weekEnd,
      project,
      tasksCompleted: req.body.tasksCompleted || [],
      tasksPlannedNextWeek: req.body.tasksPlannedNextWeek || [],
      blockers: req.body.blockers || [],
      achievements: req.body.achievements || [],
      hoursByType: req.body.hoursByType || {},
      notes: req.body.notes || "",
      status: "draft",
    });

    res.status(201).json({ report });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({
          message:
            "You already have a report for that week. Edit the existing one instead.",
        });
    }
    next(error);
  }
};

// PATCH /api/v1/reports/:id  (owner only, draft/needs_correction only)
const updateReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found." });

    if (!canEditContent(report, req.user)) {
      return res.status(403).json({
        message:
          "This report cannot be edited right now (wrong owner or wrong status).",
      });
    }

    CONTENT_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        report[field] = req.body[field];
      }
    });

    await report.save();
    res.json({ report });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/reports/:id (owner only, draft only)
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found." });

    if (
      String(report.owner) !== String(req.user._id) ||
      report.status !== "draft"
    ) {
      return res
        .status(403)
        .json({ message: "Only your own draft reports can be deleted." });
    }

    await report.deleteOne();
    res.json({ message: "Draft deleted." });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/reports/:id/submit (owner only)
const submitReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found." });

    if (String(report.owner) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You can only submit your own reports." });
    }
    if (!["draft", "needs_correction"].includes(report.status)) {
      return res
        .status(400)
        .json({
          message: "Only draft or needs-correction reports can be submitted.",
        });
    }
    if (
      !report.tasksCompleted.length &&
      !report.achievements.length &&
      !report.blockers.length
    ) {
      return res
        .status(400)
        .json({
          message: "Add at least some report content before submitting.",
        });
    }

    const nextVersion = report.versionNumber + 1;
    report.versions.push({
      versionNumber: nextVersion,
      submittedAt: new Date(),
      snapshot: pickContent(report),
    });
    report.versionNumber = nextVersion;
    report.status = "submitted";
    report.submittedAt = new Date();
    report.currentReviewComment = "";

    await report.save();
    res.json({ report });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/reports/:id/versions
const getVersions = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate(
      "project",
      "name",
    );
    if (!report) return res.status(404).json({ message: "Report not found." });

    if (
      req.user.role === "member" &&
      String(report.owner) !== String(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "You can only view your own report versions." });
    }

    res.json({
      versions: report.versions,
      currentVersionNumber: report.versionNumber,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/reports/:id/review (manager only)
const reviewReport = async (req, res, next) => {
  try {
    const { action, comment } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found." });

    if (report.status !== "submitted") {
      return res
        .status(400)
        .json({ message: "Only submitted reports can be reviewed." });
    }
    if (action === "request_changes" && !comment?.trim()) {
      return res
        .status(400)
        .json({ message: "A comment is required when requesting changes." });
    }

    report.reviewHistory.push({
      action: action === "approve" ? "approved" : "requested_changes",
      comment: comment || "",
      reviewer: req.user._id,
      reviewedAt: new Date(),
      versionNumber: report.versionNumber,
    });

    if (action === "approve") {
      report.status = "approved";
      report.approvedAt = new Date();
      report.currentReviewComment = "";
    } else {
      report.status = "needs_correction";
      report.currentReviewComment = comment;
    }

    await report.save();
    res.json({ report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  submitReport,
  getVersions,
  reviewReport,
};
