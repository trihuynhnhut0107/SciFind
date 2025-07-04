const { Client } = require("@elastic/elasticsearch");

class ElasticsearchService {
  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
    });
  }

  /**
   * Get the Elasticsearch client instance
   */
  getClient() {
    return this.client;
  }

  /**
   * Index a document
   */
  async indexDocument(index, document) {
    try {
      const response = await this.client.index({
        index,
        document,
      });
      return { result: response.result, id: response._id };
    } catch (error) {
      throw new Error(`Failed to index document: ${error.message}`);
    }
  }

  /**
   * Search documents with query
   */
  async search(index, query) {
    try {
      const response = await this.client.search({
        index,
        query: query || { match_all: {} },
      });
      return response.hits.hits;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Get document by ID
   */
  async getById(index, id) {
    try {
      const response = await this.client.get({
        index,
        id,
      });
      return response._source;
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        return null;
      }
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  /**
   * Execute aggregation query
   */
  async aggregate(index, aggregations, size = 0) {
    try {
      const response = await this.client.search({
        index,
        size,
        aggs: aggregations,
      });
      return response.aggregations;
    } catch (error) {
      throw new Error(`Aggregation failed: ${error.message}`);
    }
  }

  /**
   * Advanced search with filters, sorting, and scoring
   */
  async advancedSearch({ index, query, minScore, size = 100, from = 0, sort }) {
    try {
      const searchParams = {
        index,
        query,
        size,
        from,
      };

      if (minScore) {
        searchParams.min_score = minScore;
      }

      if (sort) {
        searchParams.sort = sort;
      }

      const response = await this.client.search(searchParams);
      return response.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      }));
    } catch (error) {
      throw new Error(`Advanced search failed: ${error.message}`);
    }
  }

  /**
   * Count documents matching query
   */
  async count(index, query) {
    try {
      const response = await this.client.count({
        index,
        query: query || { match_all: {} },
      });
      return { count: response.count };
    } catch (error) {
      throw new Error(`Count failed: ${error.message}`);
    }
  }

  /**
   * Check if index exists
   */
  async indexExists(index) {
    try {
      return await this.client.indices.exists({ index });
    } catch (error) {
      throw new Error(`Failed to check index existence: ${error.message}`);
    }
  }

  /**
   * Create index with mapping
   */
  async createIndex(index, mapping) {
    try {
      const response = await this.client.indices.create({
        index,
        body: mapping,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to create index: ${error.message}`);
    }
  }
}

module.exports = ElasticsearchService;
