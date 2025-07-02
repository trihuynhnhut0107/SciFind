class BaseController {
  /**
   * Handle successful response
   */
  success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle error response
   */
  error(res, error, message = "An error occurred", statusCode = 500) {
    console.error(`[${new Date().toISOString()}] Error:`, error);

    return res.status(statusCode).json({
      success: false,
      message,
      error: error.message || error,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle validation error
   */
  validationError(res, message = "Validation failed", details = null) {
    return res.status(400).json({
      success: false,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle not found error
   */
  notFound(res, message = "Resource not found") {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle service unavailable error
   */
  serviceUnavailable(
    res,
    message = "Service temporarily unavailable",
    details = null
  ) {
    return res.status(503).json({
      success: false,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validate required fields
   */
  validateRequired(data, requiredFields) {
    const missing = [];

    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        missing.push(field);
      }
    }

    return missing;
  }

  /**
   * Sanitize input data
   */
  sanitizeInput(data) {
    if (typeof data === "string") {
      return data.trim();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeInput(item));
    }

    if (typeof data === "object" && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Wrap async controller methods with error handling
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch((error) => {
        this.error(res, error);
      });
    };
  }

  /**
   * Extract pagination parameters
   */
  getPaginationParams(req) {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 items
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Format paginated response
   */
  paginatedResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

module.exports = BaseController;
