const express = require("express");
const ArxivPaperController = require("../controllers/ArxivPaperController");

const router = express.Router();
const controller = new ArxivPaperController();

/**
 * @route GET /arxiv-paper/categories
 * @desc Get all categories
 * @access Public
 */
router.get("/categories", controller.getCategories);

/**
 * @route GET /arxiv-paper/authors
 * @desc Get all authors
 * @access Public
 */
router.get("/authors", controller.getAuthors);

/**
 * @route GET /arxiv-paper/suggestions
 * @desc Get search suggestions
 * @access Public
 */
router.get("/suggestions", controller.getSuggestions);

/**
 * @route GET /arxiv-paper/suggestions/authors
 * @desc Get author suggestions
 * @access Public
 */
router.get("/suggestions/authors", controller.getAuthorSuggestions);

/**
 * @route GET /arxiv-paper/suggestions/categories
 * @desc Get category suggestions
 * @access Public
 */
router.get("/suggestions/categories", controller.getCategorySuggestions);

/**
 * @route GET /arxiv-paper/:id
 * @desc Get paper by ID
 * @access Public
 */
router.get("/:id", controller.getPaperById);

/**
 * @route POST /arxiv-paper/search
 * @desc Basic search
 * @access Public
 */
router.post("/search", controller.basicSearch);

/**
 * @route POST /arxiv-paper/enhanced-search
 * @desc Enhanced search with model integration
 * @access Public
 */
router.post("/enhanced-search", controller.enhancedSearch);

module.exports = router;
