const express = require("express");
const { register, login, me, updateProfile } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");
const {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require("../validations");

const router = express.Router();

// POST /api/v1/auth/register
router.post("/register", validate(registerSchema), register);

// POST /api/v1/auth/login
router.post("/login", validate(loginSchema), login);

// GET  /api/v1/auth/me
router.get("/me", protect, me);

// PATCH /api/v1/auth/profile
router.patch("/profile", protect, validate(updateProfileSchema), updateProfile);

// PUT /api/v1/auth/profile
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);

module.exports = router;

