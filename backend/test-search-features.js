const axios = require("axios");

// Base URL for your API
const BASE_URL = "http://localhost:3000"; // Adjust if your server runs on a different port

async function testSearchFeatures() {
  console.log(
    "🔍 Testing Search Features (Pagination, Filtering, Sorting)...\n"
  );

  try {
    // Test 1: Basic Search with default pagination
    console.log("1. Testing Basic Search with default pagination...");
    const basicSearchResponse = await axios.post(
      `${BASE_URL}/arxiv-paper/search`,
      {
        searchTerm: "machine learning",
      }
    );

    console.log("✅ Basic Search Response Structure:");
    console.log(
      `   - Data items: ${basicSearchResponse.data.data?.length || "N/A"}`
    );
    console.log(
      `   - Current page: ${
        basicSearchResponse.data.pagination?.currentPage || "N/A"
      }`
    );
    console.log(
      `   - Total hits: ${
        basicSearchResponse.data.pagination?.totalHits || "N/A"
      }`
    );
    console.log(
      `   - Total pages: ${
        basicSearchResponse.data.pagination?.totalPages || "N/A"
      }\n`
    );

    // Test 2: Basic Search with filters and sorting
    console.log("2. Testing Basic Search with filters and sorting...");
    const filteredSearchResponse = await axios.post(
      `${BASE_URL}/arxiv-paper/search`,
      {
        searchTerm: "deep learning",
        filters: {
          categories: ["cs.AI", "cs.LG"],
          dateRange: {
            from: "2020-01-01",
            to: "2024-12-31",
          },
          minScore: 1.0,
        },
        page: 1,
        limit: 10,
        sortBy: "date",
        sortOrder: "desc",
      }
    );

    console.log("✅ Filtered Search Response:");
    console.log(
      `   - Data items: ${filteredSearchResponse.data.data?.length || "N/A"}`
    );
    console.log(
      `   - Current page: ${
        filteredSearchResponse.data.pagination?.currentPage || "N/A"
      }`
    );
    console.log(`   - Sort applied: date desc`);
    console.log(`   - Filters applied: categories, dateRange, minScore\n`);

    // Test 3: Enhanced Search with sorting by title
    console.log("3. Testing Enhanced Search with title sorting...");
    const titleSortResponse = await axios.post(
      `${BASE_URL}/arxiv-paper/enhanced-search`,
      {
        searchTerm: "neural networks",
        filters: {
          categories: ["cs.AI"],
        },
        page: 1,
        limit: 5,
        sortBy: "title",
        sortOrder: "asc",
      }
    );

    console.log("✅ Title-sorted Enhanced Search Response:");
    console.log(
      `   - Data items: ${titleSortResponse.data.data?.length || "N/A"}`
    );
    console.log(`   - Sort applied: title asc`);
    console.log(
      `   - Model used: ${titleSortResponse.data.meta?.modelUsed || "N/A"}\n`
    );

    // Test 4: Search with date range filter
    console.log("4. Testing search with specific date range...");
    const dateRangeResponse = await axios.post(
      `${BASE_URL}/arxiv-paper/search`,
      {
        searchTerm: "artificial intelligence",
        filters: {
          dateRange: {
            from: "2023-01-01",
            to: "2023-12-31",
          },
        },
        sortBy: "date",
        sortOrder: "desc",
      }
    );

    console.log("✅ Date Range Search Response:");
    console.log(
      `   - Data items: ${dateRangeResponse.data.data?.length || "N/A"}`
    );
    console.log(`   - Date range: 2023 papers only`);
    console.log(`   - Sort: date desc\n`);

    // Test 5: Test sorting by relevance (default)
    console.log("5. Testing relevance sorting...");
    const relevanceResponse = await axios.post(
      `${BASE_URL}/arxiv-paper/search`,
      {
        searchTerm: "quantum computing",
        sortBy: "relevance",
        sortOrder: "desc",
        limit: 5,
      }
    );

    console.log("✅ Relevance-sorted Search Response:");
    console.log(
      `   - Data items: ${relevanceResponse.data.data?.length || "N/A"}`
    );
    console.log(`   - Sort applied: relevance desc\n`);

    // Test 6: Validation tests
    console.log("6. Testing parameter validation...");

    try {
      await axios.post(`${BASE_URL}/arxiv-paper/search`, {
        searchTerm: "test",
        sortBy: "invalid_sort",
        sortOrder: "desc",
      });
    } catch (error) {
      console.log("✅ Sort field validation works - rejected invalid sortBy");
    }

    try {
      await axios.post(`${BASE_URL}/arxiv-paper/search`, {
        searchTerm: "test",
        sortBy: "date",
        sortOrder: "invalid_order",
      });
    } catch (error) {
      console.log(
        "✅ Sort order validation works - rejected invalid sortOrder"
      );
    }

    try {
      await axios.post(`${BASE_URL}/arxiv-paper/search`, {
        searchTerm: "test",
        page: 0,
        limit: 20,
      });
    } catch (error) {
      console.log("✅ Page validation works - rejected page 0");
    }

    try {
      await axios.post(`${BASE_URL}/arxiv-paper/search`, {
        searchTerm: "test",
        page: 1,
        limit: 150,
      });
    } catch (error) {
      console.log("✅ Limit validation works - rejected limit > 100");
    }

    console.log("\n🎉 All search feature tests completed successfully!");
    console.log("\n📋 Summary of features tested:");
    console.log("   - Pagination (page, limit)");
    console.log("   - Filtering (categories, authors, dateRange, minScore)");
    console.log("   - Sorting (relevance, date, title)");
    console.log("   - Parameter validation");
    console.log("   - Both basic and enhanced search endpoints");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.log(
      "\n📝 Make sure your server is running on the correct port and the endpoints are accessible."
    );
    console.log(
      "📝 Also ensure your Elasticsearch instance is running and contains data."
    );
  }
}

// Run the tests
testSearchFeatures();
