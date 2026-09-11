const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  validate,
  createReportSchema,
  updateReportSchema,
  reviewReportSchema,
} = require("../validations");
const {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  submitReport,
  getVersions,
  reviewReport,
} = require("../controllers/report.controller");

const router = express.Router();

router.use(protect);

// GET /api/reports
router.get("/", listReports);

// GET /api/reports/:id
router.get("/:id", getReport);

// GET /api/reports/:id/versions
router.get("/:id/versions", getVersions);

// POST /api/reports
router.post(
  "/",
  authorize("member"),
  validate(createReportSchema),
  createReport,
);

// PATCH /api/reports/:id
router.patch(
  "/:id",
  authorize("member"),
  validate(updateReportSchema),
  updateReport,
);

// DELETE /api/reports/:id
router.delete("/:id", authorize("member"), deleteReport);

// POST /api/reports/:id/submit
router.post("/:id/submit", authorize("member"), submitReport);

// POST /api/reports/:id/review
router.post(
  "/:id/review",
  authorize("manager"),
  validate(reviewReportSchema),
  reviewReport,
);

module.exports = router;
