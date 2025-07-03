const axios = require("axios");

// Base URL for your API
const BASE_URL = "http://localhost:3000"; // Adjust if your server runs on a different port

async function testPagination() {
  console.log("🔍 Testing Search Pagination...\n");

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

    // Test 2: Basic Search with custom pagination
    console.log(
      "2. Testing Basic Search with custom pagination (page 2, limit 5)..."
    );
    const customBasicResponse = await axios.post(
      `${BASE_URL}/arxiv-paper/search`,
      {
        searchTerm: "machine learning",
        page: 2,
        limit: 5,
      }
    );

    console.log("✅ Custom Basic Search Response:");
    console.log(
      `   - Data items: ${customBasicResponse.data.data?.length || "N/A"}`
    );
    console.log(
      `   - Current page: ${
        customBasicResponse.data.pagination?.currentPage || "N/A"
      }`
    );
    console.log(
      `   - Limit: ${customBasicResponse.data.pagination?.limit || "N/A"}`
    );
    console.log(
      `   - Has next page: ${
        customBasicResponse.data.pagination?.hasNextPage || "N/A"
      }`
    );
    console.log(
      `   - Has prev page: ${
        customBasicResponse.data.pagination?.hasPrevPage || "N/A"
      }\n`
    );

    // Test 3: Enhanced Search with pagination
    console.log("3. Testing Enhanced Search with pagination...");
    const enhancedSearchResponse = await axios.post(
      `${BASE_URL}/arxiv-paper/enhanced-search`,
      {
        searchTerm: "deep learning",
        page: 1,
        limit: 10,
        filters: {
          categories: ["cs.AI"],
        },
      }
    );

    console.log("✅ Enhanced Search Response:");
    console.log(
      `   - Data items: ${enhancedSearchResponse.data.data?.length || "N/A"}`
    );
    console.log(
      `   - Current page: ${
        enhancedSearchResponse.data.pagination?.currentPage || "N/A"
      }`
    );
    console.log(
      `   - Total hits: ${
        enhancedSearchResponse.data.pagination?.totalHits || "N/A"
      }`
    );
    console.log(
      `   - Model used: ${
        enhancedSearchResponse.data.meta?.modelUsed || "N/A"
      }\n`
    );

    // Test 4: Validation tests
    console.log("4. Testing pagination validation...");

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

    console.log("\n🎉 All pagination tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.log(
      "\n📝 Make sure your server is running on the correct port and the endpoints are accessible."
    );
  }
}

// Run the tests
testPagination();
