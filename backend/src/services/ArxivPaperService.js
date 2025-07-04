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
   * Basic search with full feature support
   */
  async basicSearch(
    searchTerm,
    filters = {},
    page = 1,
    limit = 10,
    sortBy = "relevance",
    sortOrder = "desc"
  ) {
    try {
      // Use the same query building logic as enhanced search
      const query = this.buildFilteredQuery(searchTerm, filters);
      const minScore = filters.minScore || 0;

      // Build sort configuration
      let sort = [];
      switch (sortBy) {
        case "date":
          sort = [{ update_date: { order: sortOrder } }];
          break;
        case "title":
          sort = [{ "title.keyword": { order: sortOrder } }];
          break;
        case "relevance":
        default:
          sort = [{ _score: { order: "desc" } }];
          break;
      }

      // If relevance sort, add date as secondary sort
      if (sortBy === "relevance") {
        sort.push({ update_date: { order: "desc" } });
      }

      // Calculate pagination
      const from = (page - 1) * limit;

      // Perform search with pagination
      const searchResults = await this.esService.advancedSearch({
        index: this.indexName,
        query,
        minScore,
        size: limit,
        from,
        sort,
      });

      // Get total count for pagination
      const totalResults = await this.esService.count(this.indexName, query);
      const total = totalResults.count || 0;

      // Return the same structure as enhancedSearch
      return {
        total,
        searchTerm,
        filters,
        modelUsed: false,
        modelEndpoint: null,
        results: this.formatResults(searchResults),
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        sort: {
          sortBy,
          sortOrder,
        },
      };
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
      // Use bool query with should clause to handle multiple categories per paper
      const categoryQuery = {
        bool: {
          should: filters.categories.map((category) => ({
            wildcard: {
              categories: `*${category}*`,
            },
          })),
          minimum_should_match: 1,
        },
      };
      query.bool.filter.push(categoryQuery);
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
  async enhancedSearch(
    searchTerm,
    filters = {},
    modelEndpoint = null,
    page = 1,
    limit = 10,
    sortBy = "relevance",
    sortOrder = "desc"
  ) {
    try {
      // Step 1: Query the model
      const modelResult = await this.modelService.queryModel(
        searchTerm,
        modelEndpoint
      );

      // Step 2: Build Elasticsearch query
      const esQuery = this.buildFilteredQuery(searchTerm, filters);
      const minScore = filters.minScore || 0;

      // Build sort configuration
      let sort = [];
      switch (sortBy) {
        case "date":
          sort = [{ update_date: { order: sortOrder } }];
          break;
        case "title":
          sort = [{ "title.keyword": { order: sortOrder } }];
          break;
        case "relevance":
        default:
          sort = [{ _score: { order: "desc" } }];
          break;
      }

      // If relevance sort, add date as secondary sort
      if (sortBy === "relevance") {
        sort.push({ update_date: { order: "desc" } });
      }

      // Calculate pagination
      const from = (page - 1) * limit;

      let results;
      let total = 0;

      // Step 3: Use model results if available, otherwise fall back to Elasticsearch
      if (modelResult.success && modelResult.data.length > 0) {
        // Extract paper IDs from model results
        const modelPaperIds = new Set();
        modelResult.data.forEach((result) => {
          if (result.file_path) {
            // Extract filename without extension as paper ID
            let fileName = result.file_path
              .split("/")
              .pop()
              .replace(/\.[^/.]+$/, "");

            // Remove version suffix (v1, v2, v3, etc.)
            fileName = fileName.replace(/v\d+$/, "");

            modelPaperIds.add(fileName);
          }
        });

        // Check if any filters are applied
        const hasFilters =
          (Array.isArray(filters.categories) &&
            filters.categories.length > 0) ||
          (Array.isArray(filters.authors) && filters.authors.length > 0) ||
          filters.dateRange ||
          filters.minScore;

        let filteredResults = [];

        if (hasFilters) {
          // First, get all papers by model IDs
          const allModelPapers = await this.findPapersByModelIds(modelPaperIds);

          // Then apply all filters to the results
          filteredResults = this.applyFiltersToResults(allModelPapers, filters);
        } else {
          // No filters, just find papers by model IDs
          filteredResults = await this.findPapersByModelIds(modelPaperIds);
        }

        // Add model scores to the filtered results (maintain model ranking order)
        const modelPapers = filteredResults.map((paper, index) => {
          const modelScore =
            (filteredResults.length - index) / filteredResults.length;
          return {
            ...paper,
            modelScore,
            combinedScore: modelScore,
            score: modelScore,
          };
        });

        // Apply pagination to model results
        total = modelPapers.length;
        results = modelPapers.slice(from, from + limit);
      } else {
        // Fall back to Elasticsearch search when model is not available
        const esResults = await this.esService.advancedSearch({
          index: this.indexName,
          query: esQuery,
          minScore,
          size: limit,
          from,
          sort,
        });

        // Get total count for pagination
        const totalResults = await this.esService.count(
          this.indexName,
          esQuery
        );
        total = totalResults.count || 0;

        results = esResults;
      }

      // Step 4: Format response
      return {
        total,
        searchTerm,
        filters,
        modelUsed: modelResult.success && modelResult.data.length > 0,
        modelEndpoint: modelResult.endpoint,
        results: this.formatResults(results),
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        sort: {
          sortBy,
          sortOrder,
        },
      };
    } catch (error) {
      throw new Error(`Enhanced search failed: ${error.message}`);
    }
  }

  /**
   * Find papers by model IDs using wildcard queries
   */
  async findPapersByModelIds(modelPaperIds) {
    const filteredResults = [];
    const modelPaperIdsArray = Array.from(modelPaperIds);

    for (let modelId of modelPaperIdsArray) {
      const wildcardQuery = {
        wildcard: {
          id: {
            value: `*${modelId}*`,
          },
        },
      };

      try {
        const matchingPapers = await this.esService.advancedSearch({
          index: this.indexName,
          query: wildcardQuery,
          size: 1000,
        });

        matchingPapers.forEach((paper) => {
          // Avoid duplicates
          if (
            !filteredResults.some(
              (existing) =>
                (existing.id || existing._id) === (paper.id || paper._id)
            )
          ) {
            filteredResults.push(paper);
          }
        });
      } catch (error) {
        console.warn(
          `Failed to search for papers with ID pattern ${modelId}: ${error.message}`
        );
      }
    }

    return filteredResults;
  }

  /**
   * Apply category filters to papers found by model IDs
   */
  async applyCategoryFilters(modelPaperIds, categoryFilters) {
    const filteredResults = [];
    const getId = (doc) => doc.id || doc._id;

    for (const modelId of modelPaperIds) {
      const wildcardQuery = {
        wildcard: {
          id: {
            value: `*${modelId}*`,
          },
        },
      };

      const matchingPapers = await this.esService.advancedSearch({
        index: this.indexName,
        query: wildcardQuery,
        size: 1000,
      });

      for (const paper of matchingPapers) {
        // Handle categories - can be string, array, or comma-separated string
        let paperCategories = paper.categories;

        // Convert to array if it's a string
        if (typeof paperCategories === "string") {
          // Split by comma and space, then trim each category
          paperCategories = paperCategories
            .split(/[,\s]+/)
            .map((cat) => cat.trim())
            .filter((cat) => cat);
        } else if (!Array.isArray(paperCategories)) {
          paperCategories = [];
        }

        // Check if any of the paper's categories match any of the filter categories
        const matchesCategory = paperCategories.some((paperCat) =>
          categoryFilters.includes(paperCat)
        );

        if (
          matchesCategory &&
          !filteredResults.some((existing) => getId(existing) === getId(paper))
        ) {
          filteredResults.push(paper);
        }
      }
    }

    return filteredResults;
  }

  /**
   * Apply filters to results (used for model results)
   */
  applyFiltersToResults(results, filters = {}) {
    let filteredResults = results;

    // Apply category filters
    if (filters.categories && filters.categories.length > 0) {
      filteredResults = filteredResults.filter((result) => {
        // Handle categories - can be string, array, or comma-separated string
        let paperCategories = result.categories;

        // Convert to array if it's a string
        if (typeof paperCategories === "string") {
          // Split by comma and space, then trim each category
          paperCategories = paperCategories
            .split(/[,\s]+/)
            .map((cat) => cat.trim())
            .filter((cat) => cat);
        } else if (!Array.isArray(paperCategories)) {
          paperCategories = [];
        }

        // Check if any of the paper's categories match any of the filter categories
        const matches = paperCategories.some((paperCat) =>
          filters.categories.includes(paperCat)
        );

        return matches;
      });
    }

    // Apply author filters
    if (filters.authors && filters.authors.length > 0) {
      filteredResults = filteredResults.filter((result) => {
        // Handle authors_parsed format: [[lastName, firstName, middle], ...]
        const authors = result.authors_parsed || [];
        const authorNames = authors.map((author) => {
          if (Array.isArray(author)) {
            // Format: [lastName, firstName, middle]
            return `${author[1]} ${author[0]}`.trim(); // "FirstName LastName"
          }
          return author;
        });

        return authorNames.some((author) =>
          filters.authors.some(
            (filterAuthor) =>
              author.toLowerCase().includes(filterAuthor.toLowerCase()) ||
              filterAuthor.toLowerCase().includes(author.toLowerCase())
          )
        );
      });
    }

    // Apply date range filter
    if (filters.dateRange) {
      filteredResults = filteredResults.filter((result) => {
        const updateDate = result.update_date;
        if (!updateDate) return false;

        const date = new Date(updateDate);
        let passes = true;

        if (filters.dateRange.from) {
          passes = passes && date >= new Date(filters.dateRange.from);
        }
        if (filters.dateRange.to) {
          passes = passes && date <= new Date(filters.dateRange.to);
        }

        return passes;
      });
    }

    // Apply minimum score filter
    if (filters.minScore) {
      filteredResults = filteredResults.filter(
        (result) => (result.score || 0) >= filters.minScore
      );
    }

    return filteredResults;
  }

  /**
   * Format search results
   */
  formatResults(results) {
    return results.map((result) => {
      // Format authors from parsed format
      let formattedAuthors = result.authors_parsed || [];
      if (Array.isArray(formattedAuthors) && formattedAuthors.length > 0) {
        formattedAuthors = formattedAuthors.map((author) => {
          if (Array.isArray(author)) {
            // Format: [lastName, firstName, middle]
            return `${author[1]} ${author[0]}`.trim();
          }
          return author;
        });
      } else {
        // Fallback to original authors string
        formattedAuthors = result.authors ? [result.authors] : [];
      }

      // Format categories
      let formattedCategories = result.categories;
      if (typeof formattedCategories === "string") {
        // Split by comma and space, then trim each category
        formattedCategories = formattedCategories
          .split(/[,\s]+/)
          .map((cat) => cat.trim())
          .filter((cat) => cat);
      } else if (!Array.isArray(formattedCategories)) {
        formattedCategories = [];
      }

      return {
        id: result.id,
        title: result.title,
        authors: formattedAuthors,
        categories: formattedCategories,
        abstract: result.abstract,
        update_date: result.update_date,
        score: result.score,
        modelScore: result.modelScore || 0,
        combinedScore: result.combinedScore || result.score,
      };
    });
  }
}

module.exports = ArxivPaperService;
