const express = require("express");
const GeneralController = require("../controllers/GeneralController");

const router = express.Router();
const controller = new GeneralController();

/**
 * @route GET /health
 * @desc System health check
 * @access Public
 */
router.get("/health", controller.healthCheck);

/**
 * @route GET /
 * @desc API information
 * @access Public
 */
router.get("/", controller.getApiInfo);

/**
 * @route POST /es/insert
 * @desc Insert document into Elasticsearch
 * @access Public
 */
router.post("/es/insert", controller.insertDocument);

/**
 * @route GET /es/search
 * @desc General Elasticsearch search
 * @access Public
 */
router.get("/es/search", controller.search);

module.exports = router;
