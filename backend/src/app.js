const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const reportRoutes = require("./routes/report.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const createApp = () => {
  const app = express();

  app.use(
    cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/api/v1/health", (req, res) => res.json({ status: "ok" }));

  // API v1 routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/projects", projectRoutes);
  app.use("/api/v1/reports", reportRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
