const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskName: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    plannedPercent: { type: Number, min: 0, max: 100, default: 0 },
    actualPercent: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "blocked"],
      default: "not_started",
    },
    timePlannedHours: { type: Number, min: 0, default: 0 },
    timeSpentHours: { type: Number, min: 0, default: 0 },
    output: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const flaggedItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    isKey: { type: Boolean, default: false },
  },
  { _id: false },
);

const contentFields = {
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  tasksCompleted: { type: [taskSchema], default: [] },
  tasksPlannedNextWeek: { type: [String], default: [] },
  blockers: { type: [flaggedItemSchema], default: [] },
  achievements: { type: [flaggedItemSchema], default: [] },
  hoursByType: {
    development: { type: Number, min: 0, default: 0 },
    testing: { type: Number, min: 0, default: 0 },
    meetings: { type: Number, min: 0, default: 0 },
    documentation: { type: Number, min: 0, default: 0 },
    other: { type: Number, min: 0, default: 0 },
  },
  notes: { type: String, trim: true, default: "" },
};

const versionSchema = new mongoose.Schema(
  {
    versionNumber: { type: Number, required: true },
    submittedAt: { type: Date, required: true },
    snapshot: new mongoose.Schema(contentFields, { _id: false }),
  },
  { _id: false },
);

const reviewEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["requested_changes", "approved"],
      required: true,
    },
    comment: { type: String, trim: true, default: "" },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedAt: { type: Date, default: Date.now },
    versionNumber: { type: Number, required: true },
  },
  { _id: false },
);

const reportSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ...contentFields,
    status: {
      type: String,
      enum: ["draft", "submitted", "needs_correction", "approved"],
      default: "draft",
      index: true,
    },
    versionNumber: { type: Number, default: 0 }, // 0 = never submitted yet
    versions: { type: [versionSchema], default: [] },
    reviewHistory: { type: [reviewEntrySchema], default: [] },
    currentReviewComment: { type: String, trim: true, default: "" },
    submittedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

reportSchema.index({ owner: 1, weekStart: 1 }, { unique: true });
reportSchema.index({ project: 1 });

module.exports = mongoose.model("Report", reportSchema);
