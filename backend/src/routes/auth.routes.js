const express = require("express");
const { register, login, me } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");
const { validate, registerSchema, loginSchema } = require("../validations");

const router = express.Router();

// POST /api/auth/register
router.post("/register", validate(registerSchema), register);

// POST /api/auth/login
router.post("/login", validate(loginSchema), login);

// GET  /api/auth/me
router.get("/me", protect, me);

module.exports = router;
