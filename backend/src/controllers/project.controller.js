const Project = require("../models/Project");

// GET /api/v1/projects
const listProjects = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const filter = activeOnly === "true" ? { isActive: true } : {};
    const projects = await Project.find(filter).sort({ name: 1 });
    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/projects (manager only)
const createProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.create({
      name,
      description,
      members: members || [],
      createdBy: req.user._id,
    });
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/projects/:id (manager only)
const updateProject = async (req, res, next) => {
  try {
    const { name, description, isActive, members } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ message: "Project not found." });

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (isActive !== undefined) project.isActive = isActive;
    if (members !== undefined) project.members = members;

    await project.save();
    res.json({ project });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/projects/:id (manager only)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project)
      return res.status(404).json({ message: "Project not found." });
    res.json({ message: "Project removed." });
  } catch (error) {
    next(error);
  }
};

module.exports = { listProjects, createProject, updateProject, deleteProject };
