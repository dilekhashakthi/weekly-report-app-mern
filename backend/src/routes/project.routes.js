const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  validate,
  createProjectSchema,
  updateProjectSchema,
} = require("../validations");
const {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const router = express.Router();

router.use(protect);

// GET /api/v1/projects
router.get("/", listProjects);

// POST /api/v1/projects
router.post(
  "/",
  authorize("manager"),
  validate(createProjectSchema),
  createProject,
);

// PATCH /api/v1/projects/:id
router.patch(
  "/:id",
  authorize("manager"),
  validate(updateProjectSchema),
  updateProject,
);

// DELETE /api/v1/projects/:id
router.delete("/:id", authorize("manager"), deleteProject);

module.exports = router;
