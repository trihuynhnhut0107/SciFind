const config = require("../config/config");

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;

  // Log request

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;
    const { statusCode } = res;

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  // Default error response
  let statusCode = 500;
  let message = "Internal Server Error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    message = "Not Found";
  }

  res.status(statusCode).json({
    success: false,
    message,
    error:
      config.server.environment === "development" ? err.message : undefined,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 404 handler middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Validation middleware for search requests
 */
const validateSearchRequest = (req, res, next) => {
  const { searchTerm } = req.body;

  if (searchTerm && searchTerm.length > config.validation.maxSearchTermLength) {
    return res.status(400).json({
      success: false,
      message: `Search term too long. Maximum length is ${config.validation.maxSearchTermLength} characters`,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};

module.exports = {
  requestLogger,
  errorHandler,
  notFoundHandler,
  validateSearchRequest,
  securityHeaders,
};
