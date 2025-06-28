const axios = require("axios");

const BASE_URL = "http://localhost:3000";

// Test the enhanced search endpoint
async function testEnhancedSearch() {
  console.log("🔍 Testing Enhanced Search Endpoint...\n");

  try {
    // Test 1: Basic search
    console.log("Test 1: Basic search");
    const basicSearch = await axios.post(
      `${BASE_URL}/arxiv-paper/enhanced-search`,
      {
        searchTerm: "machine learning",
      }
    );
    console.log(
      `✅ Basic search successful: ${basicSearch.data.total} results found`
    );
    console.log(`Model used: ${basicSearch.data.modelUsed}`);

    // Test 2: Search with category filter
    console.log("\nTest 2: Search with category filter");
    const categorySearch = await axios.post(
      `${BASE_URL}/arxiv-paper/enhanced-search`,
      {
        searchTerm: "neural networks",
        filters: {
          categories: ["cs.AI", "cs.LG"],
          maxResults: 5,
        },
      }
    );
    console.log(
      `✅ Category filtered search: ${categorySearch.data.total} results found`
    );

    // Test 3: Search with date range
    console.log("\nTest 3: Search with date range");
    const dateSearch = await axios.post(
      `${BASE_URL}/arxiv-paper/enhanced-search`,
      {
        searchTerm: "deep learning",
        filters: {
          dateRange: {
            from: "2020-01-01",
            to: "2024-12-31",
          },
          minScore: 1.0,
        },
      }
    );
    console.log(
      `✅ Date filtered search: ${dateSearch.data.total} results found`
    );

    // Display first result if available
    if (basicSearch.data.results.length > 0) {
      const firstResult = basicSearch.data.results[0];
      console.log("\n📄 Sample result:");
      console.log(`Title: ${firstResult.title}`);
      console.log(`Authors: ${firstResult.authors}`);
      console.log(`Categories: ${firstResult.categories}`);
      console.log(`Score: ${firstResult.score}`);
      console.log(`Combined Score: ${firstResult.combinedScore}`);
    }
  } catch (error) {
    console.error(
      "❌ Enhanced search test failed:",
      error.response?.data || error.message
    );
  }
}

// Test model health check
async function testModelHealth() {
  console.log("\n🏥 Testing Model Health Check...\n");

  try {
    const health = await axios.get(`${BASE_URL}/model/health`);
    console.log(`✅ Model health check: ${health.data.status}`);
    console.log(`Endpoint: ${health.data.endpoint}`);
  } catch (error) {
    console.log(
      `⚠️ Model health check failed: ${
        error.response?.data?.error || error.message
      }`
    );
    console.log("This is expected if the model service is not running");
  }
}

// Test search suggestions
async function testSuggestions() {
  console.log("\n💡 Testing Search Suggestions...\n");

  try {
    const suggestions = await axios.get(
      `${BASE_URL}/arxiv-paper/suggestions?term=machine`
    );
    console.log(
      `✅ Found ${suggestions.data.length} suggestions for "machine"`
    );

    if (suggestions.data.length > 0) {
      console.log("Sample suggestions:");
      suggestions.data.slice(0, 3).forEach((suggestion) => {
        console.log(
          `- ${suggestion.type}: ${suggestion.value} (${suggestion.count} papers)`
        );
      });
    }
  } catch (error) {
    console.error(
      "❌ Suggestions test failed:",
      error.response?.data || error.message
    );
  }
}

// Test existing endpoints
async function testExistingEndpoints() {
  console.log("\n📚 Testing Existing Endpoints...\n");

  try {
    // Test categories endpoint
    const categories = await axios.get(`${BASE_URL}/arxiv-paper/categories`);
    console.log(
      `✅ Categories endpoint: ${categories.data.length} categories found`
    );

    // Test authors endpoint
    const authors = await axios.get(`${BASE_URL}/arxiv-paper/authors`);
    console.log(`✅ Authors endpoint: ${authors.data.length} authors found`);

    // Test basic search
    const basicSearch = await axios.post(`${BASE_URL}/arxiv-paper/search`, {
      searchTerm: "machine learning",
    });
    console.log(
      `✅ Basic search endpoint: ${basicSearch.data.length} results found`
    );
  } catch (error) {
    console.error(
      "❌ Existing endpoints test failed:",
      error.response?.data || error.message
    );
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting API Tests...\n");
  console.log("Make sure the server is running on http://localhost:3000\n");

  await testExistingEndpoints();
  await testEnhancedSearch();
  await testModelHealth();
  await testSuggestions();

  console.log("\n✨ All tests completed!");
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/`);
    console.log("✅ Server is running\n");
    return true;
  } catch (error) {
    console.error(
      "❌ Server is not running. Please start the server with: npm start"
    );
    console.error("Or run: node server.js");
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testEnhancedSearch,
  testModelHealth,
  testSuggestions,
  testExistingEndpoints,
};
