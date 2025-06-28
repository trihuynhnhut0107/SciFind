const express = require("express");
const ModelController = require("../controllers/ModelController");

const router = express.Router();
const controller = new ModelController();

/**
 * @route GET /model/health
 * @desc Check model health
 * @access Public
 */
router.get("/health", controller.checkHealth);

/**
 * @route POST /model/query
 * @desc Query model directly
 * @access Public
 */
router.post("/query", controller.queryModel);

/**
 * @route GET /model/config
 * @desc Get model configuration
 * @access Public
 */
router.get("/config", controller.getConfiguration);

module.exports = router;
