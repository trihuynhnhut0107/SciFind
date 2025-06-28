const ElasticsearchService = require("./ElasticsearchService");

class SuggestionService {
  constructor() {
    this.esService = new ElasticsearchService();
    this.indexName = "arxiv-paper";
  }

  /**
   * Get search suggestions based on existing data
   */
  async getSearchSuggestions(term) {
    try {
      if (term.length < 2) {
        return [];
      }

      const aggregations = {
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
      };

      const result = await this.esService.aggregate(
        this.indexName,
        aggregations
      );

      const suggestions = [
        ...result.title_suggestions.buckets.map((bucket) => ({
          type: "title",
          value: bucket.key,
          count: bucket.doc_count,
        })),
        ...result.category_suggestions.buckets.map((bucket) => ({
          type: "category",
          value: bucket.key,
          count: bucket.doc_count,
        })),
      ];

      return suggestions;
    } catch (error) {
      throw new Error(`Failed to get suggestions: ${error.message}`);
    }
  }

  /**
   * Get author suggestions
   */
  async getAuthorSuggestions(term) {
    try {
      if (term.length < 2) {
        return [];
      }

      const aggregations = {
        author_suggestions: {
          terms: {
            field: "authors_parsed.keyword",
            include: `.*${term}.*`,
            size: 10,
          },
        },
      };

      const result = await this.esService.aggregate(
        this.indexName,
        aggregations
      );

      return result.author_suggestions.buckets.map((bucket) => ({
        type: "author",
        value: bucket.key,
        count: bucket.doc_count,
      }));
    } catch (error) {
      throw new Error(`Failed to get author suggestions: ${error.message}`);
    }
  }

  /**
   * Get category suggestions
   */
  async getCategorySuggestions(term) {
    try {
      if (term.length < 1) {
        return [];
      }

      const aggregations = {
        category_suggestions: {
          terms: {
            field: "categories",
            include: `.*${term}.*`,
            size: 20,
          },
        },
      };

      const result = await this.esService.aggregate(
        this.indexName,
        aggregations
      );

      return result.category_suggestions.buckets.map((bucket) => ({
        type: "category",
        value: bucket.key,
        count: bucket.doc_count,
      }));
    } catch (error) {
      throw new Error(`Failed to get category suggestions: ${error.message}`);
    }
  }

  /**
   * Get combined suggestions for different types
   */
  async getCombinedSuggestions(term, types = ["title", "category", "author"]) {
    try {
      const suggestions = [];

      if (types.includes("title") || types.includes("category")) {
        const generalSuggestions = await this.getSearchSuggestions(term);
        suggestions.push(...generalSuggestions);
      }

      if (types.includes("author")) {
        const authorSuggestions = await this.getAuthorSuggestions(term);
        suggestions.push(...authorSuggestions);
      }

      // Remove duplicates and sort by count
      const uniqueSuggestions = suggestions.reduce((acc, current) => {
        const existing = acc.find(
          (item) => item.value === current.value && item.type === current.type
        );
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, []);

      return uniqueSuggestions.sort((a, b) => b.count - a.count);
    } catch (error) {
      throw new Error(`Failed to get combined suggestions: ${error.message}`);
    }
  }
}

module.exports = SuggestionService;
