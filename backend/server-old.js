const express = require("express");
const { Client } = require("@elastic/elasticsearch");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Basic route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const esClient = new Client({
  node: "http://localhost:9200",
});

// Example route to insert data
app.post("/es/insert", async (req, res) => {
  try {
    const { index, document } = req.body;
    const response = await esClient.index({
      index,
      document,
    });
    res.json({ result: response.result, id: response._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example route to query data
app.get("/es/search", async (req, res) => {
  try {
    const { index, query } = req.query;
    const response = await esClient.search({
      index: "arxiv-paper",
      query: query ? JSON.parse(query) : { match_all: {} },
    });
    res.json(response.hits.hits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all categories from "arxiv-paper" index
 * Uses the "categories" field, which is of type "keyword"
 */
app.get("/arxiv-paper/categories", async (req, res) => {
  try {
    const response = await esClient.search({
      index: "arxiv-paper",
      size: 0,
      aggs: {
        categories: {
          terms: { field: "categories", size: 1000 },
        },
      },
    });
    const categories = response.aggregations.categories.buckets.map(
      (b) => b.key
    );
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all authors from "arxiv-paper" index
 * Uses the "authors_parsed.keyword" field, which is a keyword subfield for exact matching
 */
app.get("/arxiv-paper/authors", async (req, res) => {
  try {
    const response = await esClient.search({
      index: "arxiv-paper",
      size: 0,
      aggs: {
        authors: {
          terms: { field: "authors_parsed.keyword", size: 1000 },
        },
      },
    });
    const authors = response.aggregations.authors.buckets.map((b) => b.key);
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get a data row by id from "arxiv-paper" index
 * Uses the "id" field, which is of type "keyword"
 */
app.get("/arxiv-paper/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await esClient.get({
      index: "arxiv-paper",
      id,
    });
    res.json(response._source);
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      res.status(404).json({ error: "Not found" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * Search arxiv-paper index with a search term in the request body
 * Expects: { searchTerm: "..." }
 */
app.post("/arxiv-paper/search", async (req, res) => {
  try {
    const { searchTerm } = req.body;
    const response = await esClient.search({
      index: "arxiv-paper",
      query: {
        multi_match: {
          query: searchTerm,
          fields: ["title", "abstract", "authors_parsed", "categories"],
        },
      },
    });
    res.json(response.hits.hits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Enhanced search endpoint that integrates with trained model and applies filters
 * Expects: {
 *   searchTerm: "...",
 *   filters?: {
 *     categories?: string[],
 *     authors?: string[],
 *     dateRange?: { from: string, to: string },
 *     minScore?: number
 *   },
 *   modelEndpoint?: string
 * }
 */
app.post("/arxiv-paper/enhanced-search", async (req, res) => {
  try {
    const {
      searchTerm,
      filters = {},
      modelEndpoint = "http://localhost:8000/search", // Default FastAPI endpoint
    } = req.body;

    if (!searchTerm) {
      return res.status(400).json({ error: "searchTerm is required" });
    }

    // Step 1: Make request to the trained model
    let modelResults = [];
    try {
      const modelResponse = await axios.post(
        modelEndpoint,
        {
          query: searchTerm,
        },
        {
          timeout: 30000, // 30 second timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Extract file paths or IDs from model response
      // Assuming model returns array of objects with file_path or similar identifier
      modelResults = modelResponse.data || [];
    } catch (modelError) {
      console.warn(
        "Model request failed, falling back to Elasticsearch search:",
        modelError.message
      );
      // Fallback to regular Elasticsearch search if model is unavailable
    }

    // Step 2: Build Elasticsearch query with filters
    let esQuery = {
      bool: {
        must: [
          {
            multi_match: {
              query: searchTerm,
              fields: [
                "title^2",
                "abstract^1.5",
                "authors_parsed",
                "categories",
              ],
              fuzziness: "AUTO",
            },
          },
        ],
        filter: [],
      },
    };

    // Apply category filters
    if (filters.categories && filters.categories.length > 0) {
      esQuery.bool.filter.push({
        terms: { categories: filters.categories },
      });
    }

    // Apply author filters
    if (filters.authors && filters.authors.length > 0) {
      esQuery.bool.filter.push({
        terms: { "authors_parsed.keyword": filters.authors },
      });
    }

    // Apply date range filter
    if (filters.dateRange) {
      const dateFilter = { range: { update_date: {} } };
      if (filters.dateRange.from) {
        dateFilter.range.update_date.gte = filters.dateRange.from;
      }
      if (filters.dateRange.to) {
        dateFilter.range.update_date.lte = filters.dateRange.to;
      }
      esQuery.bool.filter.push(dateFilter);
    }

    // Apply minimum score filter if specified
    let minScore = filters.minScore || 0;

    // Step 3: Execute Elasticsearch search
    const esResponse = await esClient.search({
      index: "arxiv-paper",
      query: esQuery,
      min_score: minScore,
      size: 100, // Get more results for filtering
      sort: [{ _score: { order: "desc" } }, { update_date: { order: "desc" } }],
    });

    let results = esResponse.hits.hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source,
    }));

    // Step 4: If model results are available, prioritize and filter based on model predictions
    if (modelResults.length > 0) {
      // Extract identifiers from model results (assuming they contain file_path or id)
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

        if (resultId) {
          modelIds.add(resultId);
          // Use inverse of index as model score (first result gets highest score)
          modelScores.set(
            resultId,
            (modelResults.length - index) / modelResults.length
          );
        }
      });

      // Filter and enhance results based on model predictions
      results = results
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
            combinedScore: result.score * 0.7 + modelScore * 0.3, // Weighted combination
          };
        });

      // Re-sort by combined score
      results.sort((a, b) => b.combinedScore - a.combinedScore);
    }

    // Step 5: Apply additional post-processing filters
    if (filters.maxResults) {
      results = results.slice(0, filters.maxResults);
    }

    // Step 6: Format response
    const response = {
      total: results.length,
      searchTerm,
      filters: filters,
      modelUsed: modelResults.length > 0,
      results: results.map((result) => ({
        id: result.id,
        title: result.title,
        authors: result.authors_parsed || result.authors,
        categories: result.categories,
        abstract: result.abstract,
        update_date: result.update_date,
        score: result.score,
        modelScore: result.modelScore || 0,
        combinedScore: result.combinedScore || result.score,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("Enhanced search error:", error);
    res.status(500).json({
      error: "Search failed",
      details: error.message,
      searchTerm: req.body.searchTerm || "unknown",
    });
  }
});

/**
 * Test model connectivity
 */
app.get("/model/health", async (req, res) => {
  try {
    const modelEndpoint = req.query.endpoint || "http://localhost:8000/search";

    const response = await axios.post(
      modelEndpoint,
      {
        query: "test query",
      },
      {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      status: "healthy",
      endpoint: modelEndpoint,
      responseTime: response.headers["x-response-time"] || "unknown",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      endpoint: req.query.endpoint || "http://localhost:8000/search",
    });
  }
});

/**
 * Get search suggestions based on existing data
 */
app.get("/arxiv-paper/suggestions", async (req, res) => {
  try {
    const { term = "" } = req.query;

    if (term.length < 2) {
      return res.json([]);
    }

    const response = await esClient.search({
      index: "arxiv-paper",
      size: 0,
      aggs: {
        title_suggestions: {
          terms: {
            field: "title.keyword",
            include: `.*${term}.*`,
            size: 5,
          },
        },
        category_suggestions: {
          terms: {
            field: "categories",
            include: `.*${term}.*`,
            size: 5,
          },
        },
      },
    });

    const suggestions = [
      ...response.aggregations.title_suggestions.buckets.map((b) => ({
        type: "title",
        value: b.key,
        count: b.doc_count,
      })),
      ...response.aggregations.category_suggestions.buckets.map((b) => ({
        type: "category",
        value: b.key,
        count: b.doc_count,
      })),
    ];

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
