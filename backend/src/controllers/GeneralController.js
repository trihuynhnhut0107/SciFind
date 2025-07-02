const BaseController = require("./BaseController");
const ElasticsearchService = require("../services/ElasticsearchService");

class GeneralController extends BaseController {
  constructor() {
    super();
    this.esService = new ElasticsearchService();
  }

  /**
   * Health check endpoint
   */
  healthCheck = this.asyncHandler(async (req, res) => {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        elasticsearch: "checking...",
      },
    };

    // Check Elasticsearch connectivity
    try {
      await this.esService.getClient().ping();
      health.services.elasticsearch = "healthy";
    } catch (error) {
      health.services.elasticsearch = "unhealthy";
      health.status = "degraded";
    }

    const statusCode = health.status === "healthy" ? 200 : 503;
    this.success(res, health, "Health check completed", statusCode);
  });

  /**
   * Insert document into Elasticsearch
   */
  insertDocument = this.asyncHandler(async (req, res) => {
    const { index, document } = req.body;

    const missing = this.validateRequired(req.body, ["index", "document"]);
    if (missing.length > 0) {
      return this.validationError(res, "Missing required fields", { missing });
    }

    const sanitizedData = this.sanitizeInput({ index, document });

    const result = await this.esService.indexDocument(
      sanitizedData.index,
      sanitizedData.document
    );

    this.success(res, result, "Document inserted successfully", 201);
  });

  /**
   * General search endpoint
   */
  search = this.asyncHandler(async (req, res) => {
    const { index, query } = req.query;

    const sanitizedIndex = this.sanitizeInput(index) || "arxiv-paper";
    const sanitizedQuery = query
      ? JSON.parse(this.sanitizeInput(query))
      : { match_all: {} };

    const results = await this.esService.search(sanitizedIndex, sanitizedQuery);

    this.success(res, results, "Search completed successfully");
  });

  /**
   * Get API information
   */
  getApiInfo = this.asyncHandler(async (req, res) => {
    const apiInfo = {
      name: "SciFind Backend API",
      version: process.env.npm_package_version || "1.0.0",
      description: "ArXiv paper search API with ML model integration",
      endpoints: {
        health: "GET /health",
        papers: {
          categories: "GET /arxiv-paper/categories",
          authors: "GET /arxiv-paper/authors",
          getById: "GET /arxiv-paper/:id",
          basicSearch: "POST /arxiv-paper/search",
          enhancedSearch: "POST /arxiv-paper/enhanced-search",
          suggestions: "GET /arxiv-paper/suggestions",
        },
        model: {
          health: "GET /model/health",
          query: "POST /model/query",
          config: "GET /model/config",
        },
        general: {
          insert: "POST /es/insert",
          search: "GET /es/search",
        },
      },
      documentation: "/docs",
    };

    this.success(res, apiInfo, "API information retrieved successfully");
  });
}

module.exports = GeneralController;
