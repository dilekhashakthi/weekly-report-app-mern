const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "member",
    });
    const token = generateToken(user);

    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user || !user.isActive || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/auth/me
const me = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

// PATCH /api/v1/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (existing) {
        return res
          .status(409)
          .json({ message: "An account with this email already exists." });
      }
      user.email = email.toLowerCase();
    }

    if (name) {
      user.name = name;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to set a new password.",
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect." });
      }
      user.password = newPassword;
    }

    await user.save();
    const token = generateToken(user);

    res.json({
      message: "Profile updated successfully.",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me, updateProfile };

