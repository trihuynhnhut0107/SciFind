const express = require("express");
const { Client } = require("@elastic/elasticsearch");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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
