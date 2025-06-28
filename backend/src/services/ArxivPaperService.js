const ElasticsearchService = require("./ElasticsearchService");
const ModelService = require("./ModelService");

class ArxivPaperService {
  constructor() {
    this.esService = new ElasticsearchService();
    this.modelService = new ModelService();
    this.indexName = "arxiv-paper";
  }

  /**
   * Get all categories
   */
  async getCategories() {
    try {
      const aggregations = {
        categories: {
          terms: { field: "categories", size: 1000 },
        },
      };

      const result = await this.esService.aggregate(
        this.indexName,
        aggregations
      );
      return result.categories.buckets.map((bucket) => bucket.key);
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  /**
   * Get all authors
   */
  async getAuthors() {
    try {
      const aggregations = {
        authors: {
          terms: { field: "authors_parsed.keyword", size: 1000 },
        },
      };

      const result = await this.esService.aggregate(
        this.indexName,
        aggregations
      );
      return result.authors.buckets.map((bucket) => bucket.key);
    } catch (error) {
      throw new Error(`Failed to get authors: ${error.message}`);
    }
  }

  /**
   * Get paper by ID
   */
  async getPaperById(id) {
    try {
      const paper = await this.esService.getById(this.indexName, id);
      if (!paper) {
        return null;
      }
      return paper;
    } catch (error) {
      throw new Error(`Failed to get paper: ${error.message}`);
    }
  }

  /**
   * Basic search
   */
  async basicSearch(searchTerm) {
    try {
      const query = {
        multi_match: {
          query: searchTerm,
          fields: ["title", "abstract", "authors_parsed", "categories"],
        },
      };

      return await this.esService.search(this.indexName, query);
    } catch (error) {
      throw new Error(`Basic search failed: ${error.message}`);
    }
  }

  /**
   * Build Elasticsearch query with filters
   */
  buildFilteredQuery(searchTerm, filters = {}) {
    const query = {
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
      query.bool.filter.push({
        terms: { categories: filters.categories },
      });
    }

    // Apply author filters
    if (filters.authors && filters.authors.length > 0) {
      query.bool.filter.push({
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
      query.bool.filter.push(dateFilter);
    }

    return query;
  }

  /**
   * Enhanced search with model integration
   */
  async enhancedSearch(searchTerm, filters = {}, modelEndpoint = null) {
    try {
      // Step 1: Query the model
      const modelResult = await this.modelService.queryModel(
        searchTerm,
        modelEndpoint
      );

      // Step 2: Build Elasticsearch query
      const esQuery = this.buildFilteredQuery(searchTerm, filters);
      const minScore = filters.minScore || 0;
      const sort = [
        { _score: { order: "desc" } },
        { update_date: { order: "desc" } },
      ];

      // Step 3: Execute Elasticsearch search
      const esResults = await this.esService.advancedSearch({
        index: this.indexName,
        query: esQuery,
        minScore,
        size: 100,
        sort,
      });

      let results = esResults;

      // Step 4: Combine with model results if available
      if (modelResult.success && modelResult.data.length > 0) {
        const { modelIds, modelScores } = this.modelService.processModelResults(
          modelResult.data
        );
        results = this.modelService.combineScores(
          esResults,
          modelIds,
          modelScores
        );
      }

      // Step 5: Apply result limit
      if (filters.maxResults) {
        results = results.slice(0, filters.maxResults);
      }

      // Step 6: Format response
      return {
        total: results.length,
        searchTerm,
        filters,
        modelUsed: modelResult.success && modelResult.data.length > 0,
        modelEndpoint: modelResult.endpoint,
        results: this.formatResults(results),
      };
    } catch (error) {
      throw new Error(`Enhanced search failed: ${error.message}`);
    }
  }

  /**
   * Format search results
   */
  formatResults(results) {
    return results.map((result) => ({
      id: result.id,
      title: result.title,
      authors: result.authors_parsed || result.authors,
      categories: result.categories,
      abstract: result.abstract,
      update_date: result.update_date,
      score: result.score,
      modelScore: result.modelScore || 0,
      combinedScore: result.combinedScore || result.score,
    }));
  }
}

module.exports = ArxivPaperService;
