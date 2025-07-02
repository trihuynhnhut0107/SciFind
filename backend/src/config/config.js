require("dotenv").config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 8000,
    environment: process.env.NODE_ENV || "development",
  },

  // Elasticsearch configuration
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
    indexName: process.env.ES_INDEX_NAME || "arxiv-paper",
  },

  // Model service configuration
  model: {
    endpoint: process.env.MODEL_ENDPOINT || "http://localhost:8000/search",
    timeout: parseInt(process.env.MODEL_TIMEOUT) || 30000,
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined",
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  },

  // Validation
  validation: {
    maxSearchTermLength: parseInt(process.env.MAX_SEARCH_TERM_LENGTH) || 500,
    maxResultsPerPage: parseInt(process.env.MAX_RESULTS_PER_PAGE) || 100,
  },
};

module.exports = config;
