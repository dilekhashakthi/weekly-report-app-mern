require('dotenv').config();
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Report = require('../src/models/Report');

function mondayWeeksAgo(n) {
  const d = new Date();
  const day = d.getUTCDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday - 7 * n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

const TASK_POOL = [
  'Implement login page',
  'Fix pagination bug',
  'Write API docs',
  'Design database schema',
  'Refactor auth middleware',
  'Client meeting prep',
  'Code review backlog',
  'Set up CI pipeline',
  'Investigate performance issue',
  'Onboard new hire',
];

function randOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildContent(projectId, weekIdx) {
  const numTasks = randInt(2, 4);
  const tasksCompleted = Array.from({ length: numTasks }).map(() => {
    const planned = randInt(60, 100);
    const actual = Math.min(100, planned + randInt(-20, 15));
    return {
      taskName: randOf(TASK_POOL),
      priority: randOf(['low', 'medium', 'high']),
      plannedPercent: planned,
      actualPercent: actual,
      status: actual >= 100 ? 'completed' : actual > 0 ? 'in_progress' : 'not_started',
      timePlannedHours: randInt(4, 16),
      timeSpentHours: randInt(3, 18),
      output: 'Delivered to staging / shared in PR',
    };
  });

  return {
    project: projectId,
    tasksCompleted,
    tasksPlannedNextWeek: [randOf(TASK_POOL), randOf(TASK_POOL)],
    blockers:
      weekIdx % 3 === 0
        ? [
            { text: 'Waiting on design sign-off', isKey: true },
            { text: 'Staging environment flaky', isKey: false },
          ]
        : [],
    achievements: [
      { text: 'Shipped feature ahead of schedule', isKey: true },
      { text: 'Mentored a teammate on the new module', isKey: false },
    ],
    hoursByType: {
      development: randInt(10, 25),
      testing: randInt(2, 8),
      meetings: randInt(2, 6),
      documentation: randInt(1, 4),
      other: randInt(0, 3),
    },
    notes: 'No blockers on infra this week.',
  };
}

const run = async () => {
  await connectDB();
  const destroy = process.argv.includes('--destroy');

  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Report.deleteMany({})]);
  console.log('[seed] cleared existing collections');

  if (destroy) {
    console.log('[seed] destroy-only run complete');
    process.exit(0);
  }

  const manager = await User.create({
    name: 'Priya Nair',
    email: 'manager@demo.com',
    password: 'password123',
    role: 'manager',
  });

  const memberDefs = [
    { name: 'Arjun Fernando', email: 'arjun@demo.com' },
    { name: 'Sana Perera', email: 'sana@demo.com' },
    { name: 'Dilan Silva', email: 'dilan@demo.com' },
    { name: 'Nethmi Jayawardena', email: 'nethmi@demo.com' },
    { name: 'Kavindu Rathnayake', email: 'kavindu@demo.com' },
  ];

  const createdMembers = [];
  for (const m of memberDefs) {
    // eslint-disable-next-line no-await-in-loop
    const u = await User.create({ ...m, password: 'password123', role: 'member' });
    createdMembers.push(u);
  }

  const projectDefs = [
    { name: 'Client A', description: 'External client engagement' },
    { name: 'Internal Tooling', description: 'Dashboards and dev tooling' },
    { name: 'R&D', description: 'Exploratory / research spikes' },
    { name: 'Marketing Site', description: 'Public marketing website' },
  ];
  const projects = [];
  for (const projectDef of projectDefs) {
    // eslint-disable-next-line no-await-in-loop
    const proj = await Project.create({ ...projectDef, createdBy: manager._id, members: createdMembers.map((member) => member._id) });
    projects.push(proj);
  }

  console.log('[seed] created users and projects');

  for (const member of createdMembers) {
    for (let weekIdx = 3; weekIdx >= 0; weekIdx -= 1) {
      const weekStart = mondayWeeksAgo(weekIdx);
      const weekEnd = addDays(weekStart, 4);
      const project = randOf(projects);
      const content = buildContent(project._id, weekIdx);

      // eslint-disable-next-line no-await-in-loop
      const report = await Report.create({
        owner: member._id,
        weekStart,
        weekEnd,
        status: 'draft',
        ...content,
      });

      if (weekIdx === 3 || weekIdx === 2) {
        report.versionNumber = 1;
        report.versions.push({ versionNumber: 1, submittedAt: addDays(weekStart, 5), snapshot: content });
        report.status = 'submitted';
        report.submittedAt = addDays(weekStart, 5);
        report.reviewHistory.push({
          action: 'approved',
          comment: 'Looks good, thanks!',
          reviewer: manager._id,
          reviewedAt: addDays(weekStart, 6),
          versionNumber: 1,
        });
        report.status = 'approved';
        report.approvedAt = addDays(weekStart, 6);
      } else if (weekIdx === 1) {
        const v1Content = content;
        report.versions.push({ versionNumber: 1, submittedAt: addDays(weekStart, 5), snapshot: v1Content });
        report.versionNumber = 1;
        report.submittedAt = addDays(weekStart, 5);
        report.reviewHistory.push({
          action: 'requested_changes',
          comment: 'Please add planned-vs-actual % for the client tasks and clarify the blocker.',
          reviewer: manager._id,
          reviewedAt: addDays(weekStart, 6),
          versionNumber: 1,
        });

        const v2Content = buildContent(project._id, weekIdx);
        report.project = v2Content.project;
        report.tasksCompleted = v2Content.tasksCompleted;
        report.tasksPlannedNextWeek = v2Content.tasksPlannedNextWeek;
        report.blockers = v2Content.blockers;
        report.achievements = v2Content.achievements;
        report.hoursByType = v2Content.hoursByType;
        report.notes = v2Content.notes;
        report.versions.push({ versionNumber: 2, submittedAt: addDays(weekStart, 7), snapshot: v2Content });
        report.versionNumber = 2;
        report.submittedAt = addDays(weekStart, 7);
        report.reviewHistory.push({
          action: 'approved',
          comment: 'Much clearer now, approved.',
          reviewer: manager._id,
          reviewedAt: addDays(weekStart, 7),
          versionNumber: 2,
        });
        report.status = 'approved';
        report.approvedAt = addDays(weekStart, 7);
        report.currentReviewComment = '';
      } else if (weekIdx === 0) {
        const idx = createdMembers.indexOf(member);
        if (idx === 0) {
          report.status = 'draft';
        } else if (idx === 1) {
          report.versionNumber = 1;
          report.versions.push({ versionNumber: 1, submittedAt: new Date(), snapshot: content });
          report.status = 'submitted';
          report.submittedAt = new Date();
        } else if (idx === 2) {
          report.versionNumber = 1;
          report.versions.push({ versionNumber: 1, submittedAt: new Date(), snapshot: content });
          report.status = 'submitted';
          report.submittedAt = new Date();
          report.reviewHistory.push({
            action: 'requested_changes',
            comment: 'Can you break down the R&D hours by sub-task?',
            reviewer: manager._id,
            reviewedAt: new Date(),
            versionNumber: 1,
          });
          report.status = 'needs_correction';
          report.currentReviewComment = 'Can you break down the R&D hours by sub-task?';
        } else {
          report.versionNumber = 1;
          report.versions.push({ versionNumber: 1, submittedAt: new Date(), snapshot: content });
          report.status = 'submitted';
          report.submittedAt = new Date();
          report.reviewHistory.push({
            action: 'approved',
            comment: 'Great progress this week.',
            reviewer: manager._id,
            reviewedAt: new Date(),
            versionNumber: 1,
          });
          report.status = 'approved';
          report.approvedAt = new Date();
        }
      }

      // eslint-disable-next-line no-await-in-loop
      await report.save();
    }
  }

  console.log('[seed] created 4 weeks of reports per member with mixed statuses');
  console.log('\nDemo logins (password: password123):');
  console.log(`  Manager -> ${manager.email}`);
  createdMembers.forEach((member) => console.log(`  Member  -> ${member.email}`));

  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
