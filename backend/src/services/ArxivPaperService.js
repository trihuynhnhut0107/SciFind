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

      console.log("Raw model result:", JSON.stringify(modelResult, null, 2));

      // Step 2: Build Elasticsearch query
      const esQuery = this.buildFilteredQuery(searchTerm, filters);
      const minScore = filters.minScore || 0;
      const sort = [
        { _score: { order: "desc" } },
        { update_date: { order: "desc" } },
      ];

      let results;

      // Step 3: Use model results if available, otherwise fall back to Elasticsearch
      if (modelResult.success && modelResult.data.length > 0) {
        console.log(`Model returned ${modelResult.data.length} results`);

        // Extract paper IDs from model results
        const modelPaperIds = new Set();
        modelResult.data.forEach((result) => {
          if (result.file_path) {
            // Extract filename without extension as paper ID
            // let fileName = result.file_path
            //   .split("/")
            //   .pop()
            //   .replace(/\.[^/.]+$/, "");

            // // Remove version suffix (v1, v2, v3, etc.)
            // fileName = fileName.replace(/v\d+$/, "");

            modelPaperIds.add(result.file_path);
          }
        });

        console.log(
          `Extracted paper IDs from model:`,
          Array.from(modelPaperIds)
        );

        // Check if any filters are applied
        const hasFilters =
          (filters.categories && filters.categories.length > 0) ||
          (filters.authors && filters.authors.length > 0) ||
          filters.dateRange ||
          filters.minScore;

        let filteredResults = [];

        if (hasFilters) {
          console.log(
            "Filters detected, applying Elasticsearch query with filters"
          );

          // Get Elasticsearch results with filters applied
          const esResults = await this.esService.advancedSearch({
            index: this.indexName,
            query: esQuery,
            minScore,
            size: 1000, // Get more results to have a larger pool to filter from
            sort,
          });

          console.log(`Elasticsearch returned ${esResults.length} results`);

          // Filter ES results to only include papers that were returned by the model
          filteredResults = esResults.filter((paper) => {
            const paperId = paper.id || paper._id;
            const isInModelResults = modelPaperIds.has(paperId);
            if (isInModelResults) {
              console.log(
                `Paper ${paperId} found in both model and ES results`
              );
            }
            return isInModelResults;
          });
        } else {
          console.log(
            "No filters applied, getting all model papers from Elasticsearch"
          );

          // No filters, just get all papers by ID from the model results
          const modelPaperIdsArray = Array.from(modelPaperIds);
          for (let paperId of modelPaperIdsArray) {
            try {
              const paper = await this.esService.getById(
                this.indexName,
                paperId
              );
              if (paper) {
                filteredResults.push(paper);
                console.log(`Found paper: ${paperId}`);
              } else {
                console.warn(`Paper not found in Elasticsearch: ${paperId}`);
              }
            } catch (error) {
              console.warn(`Failed to get paper ${paperId}: ${error.message}`);
            }
          }
        }

        console.log(
          `Found ${filteredResults.length} papers that match criteria`
        );

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

        results = modelPapers;
      } else {
        // Fall back to Elasticsearch search when model is not available
        results = await this.esService.advancedSearch({
          index: this.indexName,
          query: esQuery,
          minScore,
          size: 100,
          sort,
        });
      }

      // Step 4: Apply result limit
      if (filters.maxResults) {
        results = results.slice(0, filters.maxResults);
      }

      // Step 5: Format response
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
   * Apply filters to results (used for model results)
   */
  applyFiltersToResults(results, filters = {}) {
    let filteredResults = results;

    // Apply category filters
    if (filters.categories && filters.categories.length > 0) {
      filteredResults = filteredResults.filter((result) => {
        return (
          result.categories &&
          result.categories.some((category) =>
            filters.categories.includes(category)
          )
        );
      });
    }

    // Apply author filters
    if (filters.authors && filters.authors.length > 0) {
      filteredResults = filteredResults.filter((result) => {
        const authors = result.authors_parsed || result.authors || [];
        return authors.some((author) => filters.authors.includes(author));
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
