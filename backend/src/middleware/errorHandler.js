const notFound = (req, res, next) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res
      .status(409)
      .json({ message: "A record with that value already exists." });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier supplied." });
  }

  const status = err.status || 500;
  res
    .status(status)
    .json({ message: err.message || "Something went wrong on the server." });
};

module.exports = { notFound, errorHandler };
