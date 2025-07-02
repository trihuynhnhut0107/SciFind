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
        <!-- Filters Sidebar -->
        <SearchFilters
          :selected-categories="selectedCategories"
          :date-filter="dateFilter"
          :sort-by="sortBy"
          :available-categories="availableCategories"
          @toggle-category="toggleCategory"
          @update:date-filter="dateFilter = $event"
          @update:sort-by="sortBy = $event" />

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
const dateFilter = ref("any");
const sortBy = ref("relevance");

// Available categories (this would come from API)
const availableCategories = ref([
  { id: "cs.AI", name: "Artificial Intelligence" },
  { id: "cs.CV", name: "Computer Vision" },
  { id: "cs.LG", name: "Machine Learning" },
  { id: "cs.CL", name: "Computational Linguistics" },
  { id: "physics.optics", name: "Optics" },
  { id: "math.NA", name: "Numerical Analysis" },
]);

// Methods
const performSearch = async () => {
  if (!searchQuery.value.trim()) return;

  loading.value = true;
  error.value = "";
  currentQuery.value = searchQuery.value;

  try {
    const endpoint =
      searchType.value === "enhanced"
        ? "http://localhost:8000/arxiv-paper/enhanced-search"
        : "http://localhost:8000/arxiv-paper/search";

    const response = await $fetch(endpoint, {
      method: "POST",
      body:
        searchType.value === "enhanced"
          ? { searchTerm: searchQuery.value }
          : {
              searchTerm: searchQuery.value,
              filters: {
                categories: selectedCategories.value,
                dateFilter: dateFilter.value,
                sortBy: sortBy.value,
                page: currentPage.value,
              },
            },
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
    await router.push({
      path: "/search",
      query: {
        q: searchQuery.value,
        type: searchType.value,
        page: currentPage.value,
      },
    });
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

const toggleCategory = (categoryId) => {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  } else {
    selectedCategories.value.push(categoryId);
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

// Watch for filter changes
watch(
  [selectedCategories, dateFilter, sortBy],
  () => {
    if (currentQuery.value) {
      currentPage.value = 1;
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

  if (query.category) {
    selectedCategories.value = [query.category];
  }

  if (query.page) {
    currentPage.value = parseInt(query.page);
  }

  // Perform search if we have a query
  if (searchQuery.value) {
    performSearch();
  }
});
</script>

<style scoped>
/* Search page specific styles */
</style>
