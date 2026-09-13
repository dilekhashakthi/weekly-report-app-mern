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

// GET /api/v1/reports
router.get("/", listReports);

// GET /api/v1/reports/:id
router.get("/:id", getReport);

// GET /api/v1/reports/:id/versions
router.get("/:id/versions", getVersions);

// POST /api/v1/reports
router.post(
  "/",
  authorize("member"),
  validate(createReportSchema),
  createReport,
);

// PATCH /api/v1/reports/:id
router.patch(
  "/:id",
  authorize("member"),
  validate(updateReportSchema),
  updateReport,
);

// DELETE /api/v1/reports/:id
router.delete("/:id", authorize("member"), deleteReport);

// POST /api/v1/reports/:id/submit
router.post("/:id/submit", authorize("member"), submitReport);

// POST /api/v1/reports/:id/review
router.post(
  "/:id/review",
  authorize("manager"),
  validate(reviewReportSchema),
  reviewReport,
);

module.exports = router;
