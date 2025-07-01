const axios = require("axios");

class ModelService {
  constructor() {
    this.defaultEndpoint =
      process.env.MODEL_ENDPOINT || "https://mmlab.uit.edu.vn/quocanh2/search";
    this.timeout = parseInt(process.env.MODEL_TIMEOUT) || 30000;
  }

  /**
   * Make a request to the trained model
   */
  async queryModel(searchTerm, endpoint = null) {
    const modelEndpoint = endpoint || this.defaultEndpoint;

    try {
      const response = await axios.post(
        modelEndpoint,
        { query: searchTerm },
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data || [],
        endpoint: modelEndpoint,
        responseTime: response.headers["x-response-time"] || "unknown",
      };
    } catch (error) {
      console.warn(
        `Model request failed for endpoint ${modelEndpoint}:`,
        error.message
      );
      return {
        success: false,
        error: error.message,
        endpoint: modelEndpoint,
        data: [],
      };
    }
  }

  /**
   * Check model health
   */
  async checkHealth(endpoint = null) {
    const modelEndpoint = endpoint || this.defaultEndpoint;

    try {
      const response = await axios.post(
        modelEndpoint,
        { query: "test query" },
        {
          timeout: 5000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        status: "healthy",
        endpoint: modelEndpoint,
        responseTime: response.headers["x-response-time"] || "unknown",
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        endpoint: modelEndpoint,
      };
    }
  }

  /**
   * Process model results and extract identifiers
   */
  processModelResults(modelResults) {
    console.log(`Processing ${modelResults.length} model results`);
    console.log(`Sample model result:`, modelResults[0]);

    const modelIds = new Set();
    const modelScores = new Map();

    modelResults.forEach((result, index) => {
      // Try to extract ID from file_path or use direct id
      let resultId = result.id || result.file_path;

      if (result.file_path && typeof result.file_path === "string") {
        // Extract filename without extension as potential ID
        const fileName = result.file_path
          .split("/")
          .pop()
          .replace(/\.[^/.]+$/, "");
        resultId = fileName;
      }

      console.log(`Result ${index}: resultId=${resultId}, original:`, result);

      if (resultId) {
        modelIds.add(resultId);
        // Use inverse of index as model score (first result gets highest score)
        const score = (modelResults.length - index) / modelResults.length;
        modelScores.set(resultId, score);
      }
    });

    console.log(`Final modelIds:`, Array.from(modelIds));
    console.log(`Final modelScores:`, modelScores);

    return { modelIds, modelScores };
  }

  /**
   * Combine Elasticsearch and model scores
   */
  combineScores(
    esResults,
    modelIds,
    modelScores,
    weightES = 0.7,
    weightModel = 0.3
  ) {
    return esResults
      .filter((result) => {
        // Check if this result was recommended by the model
        return modelIds.has(result.id) || modelIds.has(result.title);
      })
      .map((result) => {
        // Add model score if available
        const modelScore =
          modelScores.get(result.id) || modelScores.get(result.title) || 0;
        return {
          ...result,
          modelScore,
          combinedScore: result.score * weightES + modelScore * weightModel,
        };
      })
      .sort((a, b) => b.combinedScore - a.combinedScore);
  }
}

module.exports = ModelService;
