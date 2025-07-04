<template>
  <div class="min-h-screen bg-bg-main">
    <!-- Search Header -->
    <SearchHeader
      :search-query="searchQuery"
      :search-type="searchType"
      @update:search-query="searchQuery = $event"
      @search="performSearch"
      @toggle-search-type="toggleSearchType" />

    <div class="max-w-7xl mx-auto px-6 py-6">
      <!-- Search Info and Filters -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Category Browser -->
        <div class="lg:w-1/3">
          <CategoryBrowser
            :selected-categories="selectedCategories"
            :expanded-categories="expandedCategories"
            @toggle-category="toggleCategory"
            @clear-all="clearAllCategories"
            @toggle-category-group="expandedCategories = $event" />
        </div>

        <!-- Results Area -->
        <SearchResults
          :papers="papers"
          :total-results="totalResults"
          :total-pages="totalPages"
          :current-page="currentPage"
          :search-type="searchType"
          :current-query="currentQuery"
          :loading="loading"
          :error="error"
          @abstract-click="handleAbstractClick"
          @pdf-click="handlePDFClick"
          @source-click="handleSourceClick"
          @change-page="changePage" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import CategoryBrowser from "~/components/CategoryBrowser.vue";

// Use no layout since we have our own header
definePageMeta({
  layout: false,
});

// Get route and router
const route = useRoute();
const router = useRouter();

// Search state
const searchQuery = ref("");
const searchType = ref("enhanced");
const currentQuery = ref("");
const loading = ref(false);
const error = ref("");

// Results state
const papers = ref([]);
const totalResults = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);

// Filters
const selectedCategories = ref([]);
const expandedCategories = ref([]);
const sortBy = ref("relevance");

// Computed property for debugging
const debugState = computed(() => ({
  searchQuery: searchQuery.value,
  searchType: searchType.value,
  selectedCategories: selectedCategories.value,
  currentPage: currentPage.value,
  routeQuery: route.query,
}));

// Utility function to update URL with current state
const updateURL = async (replaceHistory = true) => {
  const queryParams = {
    q: searchQuery.value,
    type: searchType.value,
    page: currentPage.value,
  };

  if (selectedCategories.value.length > 0) {
    queryParams.categories = selectedCategories.value.join(",");
  }

  const routerMethod = replaceHistory ? router.replace : router.push;

  await routerMethod({
    path: "/search",
    query: queryParams,
  });
};

// Methods
const performSearch = async () => {
  if (!searchQuery.value.trim()) return;

  console.log("🔍 Performing search with:", debugState.value);

  loading.value = true;
  error.value = "";
  currentQuery.value = searchQuery.value;

  try {
    const endpoint =
      searchType.value === "enhanced"
        ? "http://localhost:8000/arxiv-paper/enhanced-search"
        : "http://localhost:8000/arxiv-paper/search";

    const requestBody =
      searchType.value === "enhanced"
        ? {
            searchTerm: searchQuery.value,
            filters: { categories: selectedCategories.value },
          }
        : {
            searchTerm: searchQuery.value,
            filters: { categories: selectedCategories.value },
          };

    console.log("Search request body:", requestBody);
    console.log("Selected categories being sent:", selectedCategories.value);

    const response = await $fetch(endpoint, {
      method: "POST",
      body: requestBody,
    });

    console.log("API Response:", response);

    if (response.success && response.data) {
      papers.value = response.data.results || [];
      totalResults.value = response.data.total || papers.value.length;
    } else {
      papers.value = response.data?.papers || response.data || [];
      totalResults.value = response.data?.total || papers.value.length;
    }

    console.log("Parsed papers:", papers.value);
    totalPages.value = Math.ceil(totalResults.value / 10); // Assuming 10 per page

    // Update URL
    await updateURL();
  } catch (err) {
    console.error("Search error:", err);
    error.value = err.data?.message || err.message || "Failed to search papers";
    papers.value = [];
    totalResults.value = 0;
  } finally {
    loading.value = false;
  }
};

const toggleSearchType = () => {
  searchType.value = searchType.value === "enhanced" ? "basic" : "enhanced";
};

const toggleCategory = async (category) => {
  // Handle both category object and category ID
  const categoryId = typeof category === "string" ? category : category.id;
  console.log("Toggling category:", categoryId);
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  } else {
    selectedCategories.value.push(categoryId);
  }
  console.log("Selected categories:", selectedCategories.value);

  // Reset to first page when filters change
  currentPage.value = 1;

  // Update URL with new categories
  await updateURL();

  // Trigger search if we have a query
  if (currentQuery.value) {
    performSearch();
  }
};

const clearAllCategories = async () => {
  selectedCategories.value = [];

  // Reset to first page when filters change
  currentPage.value = 1;

  // Update URL to remove categories
  await updateURL();

  // Trigger search if we have a query
  if (currentQuery.value) {
    performSearch();
  }
};

const openArxivAbstract = (arxivId) => {
  const url = `https://arxiv.org/abs/${arxivId}`;
  window.open(url, "_blank");
};

const openArxivPDF = (arxivId) => {
  const url = `https://arxiv.org/pdf/${arxivId}.pdf`;
  window.open(url, "_blank");
};

const openArxivSource = (arxivId) => {
  const url = `https://arxiv.org/e-print/${arxivId}`;
  // Open in new tab, if source doesn't exist, arXiv will show a 404 page
  window.open(url, "_blank");
};

// Handler functions for arXiv material buttons
const handleAbstractClick = (arxivId) => {
  openArxivAbstract(arxivId);
};

const handlePDFClick = (arxivId) => {
  openArxivPDF(arxivId);
};

const handleSourceClick = (arxivId) => {
  openArxivSource(arxivId);
};

const changePage = (page) => {
  currentPage.value = page;
  performSearch();
};

// Watch for sortBy changes only
watch(
  [sortBy],
  () => {
    if (currentQuery.value) {
      currentPage.value = 1;
      performSearch();
    }
  },
  { deep: true }
);

// Watch for route changes to handle direct URL navigation
watch(
  () => route.query,
  (newQuery) => {
    console.log("Route query changed:", newQuery);

    // Update search query
    if (newQuery.q && newQuery.q !== searchQuery.value) {
      searchQuery.value = newQuery.q;
      currentQuery.value = newQuery.q;
    }

    // Update search type
    if (newQuery.type && newQuery.type !== searchType.value) {
      searchType.value = newQuery.type;
    }

    // Update categories
    const urlCategories = newQuery.categories
      ? newQuery.categories.split(",").filter((cat) => cat.trim())
      : newQuery.category
      ? [newQuery.category]
      : [];

    if (
      JSON.stringify(urlCategories) !== JSON.stringify(selectedCategories.value)
    ) {
      selectedCategories.value = urlCategories;
    }

    // Update page
    if (newQuery.page) {
      const newPage = parseInt(newQuery.page);
      if (newPage !== currentPage.value) {
        currentPage.value = newPage;
      }
    }

    // Perform search if we have a query
    if (searchQuery.value) {
      performSearch();
    }
  },
  { deep: true }
);

// Initialize from URL params
onMounted(() => {
  const query = route.query;

  if (query.q) {
    searchQuery.value = query.q;
    currentQuery.value = query.q;
  }

  if (query.type) {
    searchType.value = query.type;
  }

  // Handle both single category and multiple categories
  if (query.category) {
    selectedCategories.value = [query.category];
  }

  if (query.categories) {
    selectedCategories.value = query.categories
      .split(",")
      .filter((cat) => cat.trim());
  }

  if (query.page) {
    currentPage.value = parseInt(query.page);
  }

  // Log the initialized state
  console.log("Initialized from URL:", {
    searchQuery: searchQuery.value,
    searchType: searchType.value,
    selectedCategories: selectedCategories.value,
    currentPage: currentPage.value,
  });

  // Perform search if we have a query
  if (searchQuery.value) {
    performSearch();
  }
});
</script>

<style scoped>
/* Search page specific styles */
</style>
