const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getSummary,
  getStatusByMember,
  getTasksTrend,
  getWorkloadByProject,
  getTimeByType,
  getActivityFeed,
} = require("../controllers/dashboard.controller");

const router = express.Router();

router.use(protect, authorize("manager"));

// GET /api/v1/dashboard/summary
router.get("/summary", getSummary);

// GET /api/v1/dashboard/status-by-member
router.get("/status-by-member", getStatusByMember);

// GET /api/v1/dashboard/tasks-trend
router.get("/tasks-trend", getTasksTrend);

// GET /api/v1/dashboard/workload-by-project
router.get("/workload-by-project", getWorkloadByProject);

// GET /api/v1/dashboard/time-by-type
router.get("/time-by-type", getTimeByType);

// GET /api/v1/dashboard/activity
router.get("/activity", getActivityFeed);

module.exports = router;
