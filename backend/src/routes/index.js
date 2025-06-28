const express = require("express");
const generalRoutes = require("./generalRoutes");
const arxivPaperRoutes = require("./arxivPaperRoutes");
const modelRoutes = require("./modelRoutes");

const router = express.Router();

// General routes (health, API info, ES operations)
router.use("/", generalRoutes);

// ArXiv paper specific routes
router.use("/arxiv-paper", arxivPaperRoutes);

// Model related routes
router.use("/model", modelRoutes);

module.exports = router;
