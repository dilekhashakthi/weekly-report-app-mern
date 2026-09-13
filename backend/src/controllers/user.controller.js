const User = require("../models/User");

// GET /api/v1/users (manager only)
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map((user) => user.toSafeObject()) });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/users (manager only)
const createUser = async (req, res, next) => {
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
      role: role === "manager" ? "manager" : "member",
    });
    res.status(201).json({ user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/users/:id (manager only)
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, name } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (name) user.name = name;

    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/users/:id (manager only)
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You cannot remove your own account." });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User removed." });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, createUser, updateUser, deleteUser };
