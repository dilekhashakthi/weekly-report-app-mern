const { z } = require("zod");

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));
      return res.status(400).json({
        message: "Validation failed.",
        errors,
      });
    }
    req.body = result.data;
    next();
  };
};

// Auth validation schemas
const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("A valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["member", "manager"]).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

// Project validation schemas
const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().optional().default(""),
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name cannot be empty").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Report validation schemas
const taskItemSchema = z.object({
  taskName: z.string().default(""),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  plannedPercent: z.number().min(0).max(100).default(0),
  actualPercent: z.number().min(0).max(100).default(0),
  status: z
    .enum(["not_started", "in_progress", "completed", "blocked"])
    .default("not_started"),
  timePlannedHours: z.number().min(0).default(0),
  timeSpentHours: z.number().min(0).default(0),
  output: z.string().optional().default(""),
});

const flaggedItemSchema = z.object({
  text: z.string().default(""),
  isKey: z.boolean().default(false),
});

const hoursByTypeSchema = z
  .object({
    development: z.number().min(0).default(0),
    testing: z.number().min(0).default(0),
    meetings: z.number().min(0).default(0),
    documentation: z.number().min(0).default(0),
    other: z.number().min(0).default(0),
  })
  .partial();

const createReportSchema = z.object({
  weekStart: z.string().min(1, "weekStart must be a date"),
  weekEnd: z.string().min(1, "weekEnd must be a date"),
  project: z.string().min(1, "project is required"),
  tasksCompleted: z.array(taskItemSchema).optional().default([]),
  tasksPlannedNextWeek: z.array(z.string()).optional().default([]),
  blockers: z.array(flaggedItemSchema).optional().default([]),
  achievements: z.array(flaggedItemSchema).optional().default([]),
  hoursByType: hoursByTypeSchema.optional(),
  notes: z.string().optional().default(""),
});

const updateReportSchema = z.object({
  project: z.string().optional(),
  tasksCompleted: z.array(taskItemSchema).optional(),
  tasksPlannedNextWeek: z.array(z.string()).optional(),
  blockers: z.array(flaggedItemSchema).optional(),
  achievements: z.array(flaggedItemSchema).optional(),
  hoursByType: hoursByTypeSchema.optional(),
  notes: z.string().optional(),
});

const reviewReportSchema = z.object({
  action: z.enum(["approve", "request_changes"], {
    errorMap: () => ({ message: "action must be approve or request_changes" }),
  }),
  comment: z.string().optional().default(""),
});

// User validation schemas
const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("A valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["member", "manager"]).optional().default("member"),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  role: z.enum(["member", "manager"]).optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
  createReportSchema,
  updateReportSchema,
  reviewReportSchema,
  createUserSchema,
  updateUserSchema,
};
