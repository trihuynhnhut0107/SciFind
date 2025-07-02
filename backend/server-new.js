const express = require("express");
const cors = require("cors");
const config = require("./src/config/config");
const routes = require("./src/routes");
const {
  requestLogger,
  errorHandler,
  notFoundHandler,
  securityHeaders,
} = require("./src/middleware");

const app = express();
const PORT = config.server.port;

// Security headers
app.use(securityHeaders);

// CORS
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
if (config.server.environment !== "test") {
  app.use(requestLogger);
}

// Routes
app.use("/", routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 SciFind Backend Server started successfully!`);
    console.log(`📍 Server listening on port ${PORT}`);
    console.log(`🌍 Environment: ${config.server.environment}`);
    console.log(`🔍 Elasticsearch: ${config.elasticsearch.url}`);
    console.log(`🤖 Model endpoint: ${config.model.endpoint}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
