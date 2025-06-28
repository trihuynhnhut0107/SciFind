const BaseController = require("./BaseController");
const ModelService = require("../services/ModelService");

class ModelController extends BaseController {
  constructor() {
    super();
    this.modelService = new ModelService();
  }

  /**
   * Check model health
   */
  checkHealth = this.asyncHandler(async (req, res) => {
    const { endpoint } = req.query;
    const sanitizedEndpoint = endpoint ? this.sanitizeInput(endpoint) : null;

    const healthStatus = await this.modelService.checkHealth(sanitizedEndpoint);

    if (healthStatus.status === "healthy") {
      this.success(res, healthStatus, "Model is healthy");
    } else {
      this.serviceUnavailable(res, "Model is not healthy", healthStatus);
    }
  });

  /**
   * Query model directly (for testing)
   */
  queryModel = this.asyncHandler(async (req, res) => {
    const { query, endpoint } = req.body;

    const missing = this.validateRequired(req.body, ["query"]);
    if (missing.length > 0) {
      return this.validationError(res, "Missing required fields", { missing });
    }

    const sanitizedData = this.sanitizeInput({ query, endpoint });

    const result = await this.modelService.queryModel(
      sanitizedData.query,
      sanitizedData.endpoint
    );

    if (result.success) {
      this.success(res, result, "Model query completed successfully");
    } else {
      this.serviceUnavailable(res, "Model query failed", result);
    }
  });

  /**
   * Get model configuration
   */
  getConfiguration = this.asyncHandler(async (req, res) => {
    const config = {
      defaultEndpoint: this.modelService.defaultEndpoint,
      timeout: this.modelService.timeout,
      supportedOperations: ["query", "health-check"],
      expectedQueryFormat: {
        query: "string - search term",
      },
      expectedResponse: {
        data: "array - list of results",
        file_path: "string - optional file path",
        id: "string - optional document id",
      },
    };

    this.success(res, config, "Model configuration retrieved successfully");
  });
}

module.exports = ModelController;
