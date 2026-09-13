const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  validate,
  createUserSchema,
  updateUserSchema,
} = require("../validations");
const {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

const router = express.Router();

router.use(protect, authorize("manager"));

// GET /api/v1/users
router.get("/", listUsers);

// POST /api/v1/users
router.post("/", validate(createUserSchema), createUser);

// PATCH /api/v1/users/:id
router.patch("/:id", validate(updateUserSchema), updateUser);

// DELETE /api/v1/users/:id
router.delete("/:id", deleteUser);

module.exports = router;
