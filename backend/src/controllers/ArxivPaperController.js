const BaseController = require("./BaseController");
const ArxivPaperService = require("../services/ArxivPaperService");
const SuggestionService = require("../services/SuggestionService");

class ArxivPaperController extends BaseController {
  constructor() {
    super();
    this.arxivService = new ArxivPaperService();
    this.suggestionService = new SuggestionService();
  }

  /**
   * Get all categories
   */
  getCategories = this.asyncHandler(async (req, res) => {
    const categories = await this.arxivService.getCategories();
    this.success(res, categories, "Categories retrieved successfully");
  });

  /**
   * Get all authors
   */
  getAuthors = this.asyncHandler(async (req, res) => {
    const authors = await this.arxivService.getAuthors();
    this.success(res, authors, "Authors retrieved successfully");
  });

  /**
   * Get paper by ID
   */
  getPaperById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return this.validationError(res, "Paper ID is required");
    }

    const paper = await this.arxivService.getPaperById(id);

    if (!paper) {
      return this.notFound(res, "Paper not found");
    }

    this.success(res, paper, "Paper retrieved successfully");
  });

  /**
   * Basic search with full feature support
   */
  basicSearch = this.asyncHandler(async (req, res) => {
    const {
      searchTerm,
      filters = {},
      page = 1,
      limit = 10,
      sortBy = "relevance",
      sortOrder = "desc",
    } = req.body;

    const missing = this.validateRequired(req.body, ["searchTerm"]);
    if (missing.length > 0) {
      return this.validationError(res, "Missing required fields", { missing });
    }

    // Validate pagination parameters
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(Math.max(1, parseInt(limit)), 100);

    // Validate sort parameters
    const validSortFields = ["relevance", "date", "title"];
    const validSortOrders = ["asc", "desc"];
    const validatedSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : "relevance";
    const validatedSortOrder = validSortOrders.includes(sortOrder)
      ? sortOrder
      : "desc";

    const sanitizedSearchTerm = this.sanitizeInput(searchTerm);
    const sanitizedFilters = this.sanitizeInput(filters);

    const results = await this.arxivService.basicSearch(
      sanitizedSearchTerm,
      sanitizedFilters,
      validatedPage,
      validatedLimit,
      validatedSortBy,
      validatedSortOrder
    );

    this.success(res, results, "Search completed successfully");
  });

  /**
   * Enhanced search with model integration
   */
  enhancedSearch = this.asyncHandler(async (req, res) => {
    const {
      searchTerm,
      filters = {},
      modelEndpoint,
      page = 1,
      limit = 10,
      sortBy = "relevance",
      sortOrder = "desc",
    } = req.body;

    const missing = this.validateRequired(req.body, ["searchTerm"]);
    if (missing.length > 0) {
      return this.validationError(res, "Missing required fields", { missing });
    }

    // Validate pagination parameters
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(Math.max(1, parseInt(limit)), 100);

    // Validate sort parameters
    const validSortFields = ["relevance", "date", "title"];
    const validSortOrders = ["asc", "desc"];
    const validatedSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : "relevance";
    const validatedSortOrder = validSortOrders.includes(sortOrder)
      ? sortOrder
      : "desc";

    // Sanitize input
    const sanitizedData = this.sanitizeInput({
      searchTerm,
      filters,
      modelEndpoint,
    });

    const results = await this.arxivService.enhancedSearch(
      sanitizedData.searchTerm,
      sanitizedData.filters,
      sanitizedData.modelEndpoint,
      validatedPage,
      validatedLimit,
      validatedSortBy,
      validatedSortOrder
    );

    this.success(res, results, "Enhanced search completed successfully");
  });

  /**
   * Get search suggestions
   */
  getSuggestions = this.asyncHandler(async (req, res) => {
    const { term = "", types } = req.query;

    if (term.length < 2) {
      return this.success(res, [], "Term too short for suggestions");
    }

    const sanitizedTerm = this.sanitizeInput(term);
    const suggestionTypes = types
      ? types.split(",")
      : ["title", "category", "author"];

    const suggestions = await this.suggestionService.getCombinedSuggestions(
      sanitizedTerm,
      suggestionTypes
    );

    this.success(res, suggestions, "Suggestions retrieved successfully");
  });

  /**
   * Get author suggestions specifically
   */
  getAuthorSuggestions = this.asyncHandler(async (req, res) => {
    const { term = "" } = req.query;

    if (term.length < 2) {
      return this.success(res, [], "Term too short for suggestions");
    }

    const sanitizedTerm = this.sanitizeInput(term);
    const suggestions = await this.suggestionService.getAuthorSuggestions(
      sanitizedTerm
    );

    this.success(res, suggestions, "Author suggestions retrieved successfully");
  });

  /**
   * Get category suggestions specifically
   */
  getCategorySuggestions = this.asyncHandler(async (req, res) => {
    const { term = "" } = req.query;

    if (term.length < 1) {
      return this.success(res, [], "Term too short for suggestions");
    }

    const sanitizedTerm = this.sanitizeInput(term);
    const suggestions = await this.suggestionService.getCategorySuggestions(
      sanitizedTerm
    );

    this.success(
      res,
      suggestions,
      "Category suggestions retrieved successfully"
    );
  });
}

module.exports = ArxivPaperController;
