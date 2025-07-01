<template>
  <div class="min-h-screen bg-bg-main">
    <!-- Header with Search Bar -->
    <header class="bg-white border-b border-border px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center space-x-4">
        <NuxtLink
          to="/"
          class="text-2xl font-bold text-primary hover:text-primary/80">
          SciFind
        </NuxtLink>

        <div class="flex-1 max-w-2xl">
          <div
            class="flex items-center bg-bg-main rounded-lg border border-border focus-within:border-primary transition-colors">
            <div class="p-3">
              <svg
                class="w-5 h-5 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              @keyup.enter="performSearch"
              placeholder="Search papers..."
              class="flex-1 bg-transparent py-3 pr-3 focus:outline-none" />
            <button
              @click="performSearch"
              class="m-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              Search
            </button>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="
              searchType = searchType === 'enhanced' ? 'basic' : 'enhanced'
            "
            :class="
              searchType === 'enhanced'
                ? 'bg-primary text-white'
                : 'bg-bg-card text-text-secondary'
            "
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors">
            {{ searchType === "enhanced" ? "AI Enhanced" : "Basic Search" }}
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 py-6">
      <!-- Search Info and Filters -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Filters Sidebar -->
        <div class="lg:w-64 space-y-4">
          <div class="bg-white rounded-lg p-4">
            <h3 class="font-semibold text-text-main mb-3">Categories</h3>
            <div class="space-y-2">
              <label
                v-for="category in availableCategories"
                :key="category.id"
                class="flex items-center">
                <input
                  v-model="selectedCategories"
                  :value="category.id"
                  type="checkbox"
                  class="rounded border-border text-primary focus:ring-primary" />
                <span class="ml-2 text-sm text-text-secondary">{{
                  category.name
                }}</span>
              </label>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4">
            <h3 class="font-semibold text-text-main mb-3">Date Range</h3>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="dateFilter"
                  value="any"
                  type="radio"
                  class="text-primary focus:ring-primary" />
                <span class="ml-2 text-sm text-text-secondary">Any time</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="dateFilter"
                  value="year"
                  type="radio"
                  class="text-primary focus:ring-primary" />
                <span class="ml-2 text-sm text-text-secondary">Past year</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="dateFilter"
                  value="month"
                  type="radio"
                  class="text-primary focus:ring-primary" />
                <span class="ml-2 text-sm text-text-secondary">Past month</span>
              </label>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4">
            <h3 class="font-semibold text-text-main mb-3">Sort By</h3>
            <select
              v-model="sortBy"
              class="w-full border border-border rounded-md px-3 py-2 text-sm">
              <option value="relevance">Relevance</option>
              <option value="date">Date (newest first)</option>
              <option value="citations">Citations</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        <!-- Results Area -->
        <div class="flex-1">
          <!-- Search Summary -->
          <div class="mb-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-text-main">
                  Search Results
                  <span v-if="totalResults" class="text-text-muted font-normal">
                    ({{ totalResults.toLocaleString() }} papers found)
                  </span>
                </h2>
                <p v-if="currentQuery" class="text-text-secondary mt-1">
                  Results for: "{{ currentQuery }}"
                </p>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p class="text-text-muted">
                {{
                  searchType === "enhanced"
                    ? "AI is analyzing your query..."
                    : "Searching papers..."
                }}
              </p>
            </div>
          </div>

          <!-- Error State -->
          <div
            v-else-if="error"
            class="bg-red-50 border border-red-200 rounded-lg p-6">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 text-red-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 class="text-red-800 font-medium">Search Error</h3>
                <p class="text-red-600 mt-1">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Results List -->
          <div v-else-if="papers.length > 0" class="space-y-4">
            <div
              v-for="paper in papers"
              :key="paper.id"
              class="bg-white rounded-lg border border-border hover:border-primary transition-colors p-6 cursor-pointer"
              @click="navigateToPaper(paper.id)">
              <div class="flex justify-between items-start mb-3">
                <h3
                  class="text-lg font-semibold text-text-main hover:text-primary transition-colors line-clamp-2">
                  {{ paper.title }}
                </h3>
                <div class="text-sm text-text-muted ml-4 flex-shrink-0">
                  {{ formatDate(paper.published) }}
                </div>
              </div>

              <div class="text-text-secondary mb-3">
                <span
                  v-for="(author, index) in paper.authors?.slice(0, 3)"
                  :key="index">
                  {{ author
                  }}{{
                    index < Math.min(paper.authors.length - 1, 2) ? ", " : ""
                  }}
                </span>
                <span v-if="paper.authors?.length > 3" class="text-text-muted">
                  and {{ paper.authors.length - 3 }} others
                </span>
              </div>

              <p class="text-text-secondary mb-4 line-clamp-3">
                {{ paper.abstract }}
              </p>

              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <span
                    v-if="paper.category"
                    class="px-2 py-1 bg-bg-highlight text-primary text-sm rounded-full">
                    {{ paper.category }}
                  </span>
                  <span v-if="paper.arxiv_id" class="text-sm text-text-muted">
                    arXiv: {{ paper.arxiv_id }}
                  </span>
                </div>

                <div class="flex items-center space-x-2">
                  <button
                    @click.stop="openArxivLink(paper.arxiv_id)"
                    class="text-sm text-primary hover:text-primary/80">
                    View on arXiv →
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1"
              class="flex items-center justify-center space-x-2 mt-8">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 rounded-md bg-white border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-main">
                Previous
              </button>

              <span class="px-4 py-2 text-text-muted">
                Page {{ currentPage }} of {{ totalPages }}
              </span>

              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 rounded-md bg-white border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-main">
                Next
              </button>
            </div>
          </div>

          <!-- No Results -->
          <div v-else class="text-center py-12">
            <svg
              class="w-16 h-16 text-text-muted mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.073-2.327C5.99 12.224 6 12.112 6 12c0-3.314 2.686-6 6-6s6 2.686 6 6c0 .113.01.224.073.673z" />
            </svg>
            <h3 class="text-xl font-medium text-text-main mb-2">
              No papers found
            </h3>
            <p class="text-text-muted mb-4">
              Try adjusting your search terms or filters
            </p>
            <NuxtLink
              to="/"
              class="text-primary hover:text-primary/80 font-medium">
              ← Back to search
            </NuxtLink>
          </div>
        </div>
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
        ? "/api/arxiv-paper/enhanced-search"
        : "/api/arxiv-paper/search";

    const response = await $fetch(endpoint, {
      method: "POST",
      body: {
        searchTerm: searchQuery.value,
        filters: {
          categories: selectedCategories.value,
          dateFilter: dateFilter.value,
          sortBy: sortBy.value,
          page: currentPage.value,
        },
      },
    });

    papers.value = response.data?.papers || response.data || [];
    totalResults.value = response.data?.total || papers.value.length;
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
    error.value = err.message || "Failed to search papers";
    papers.value = [];
  } finally {
    loading.value = false;
  }
};

const navigateToPaper = (paperId) => {
  navigateTo(`/paper/${paperId}`);
};

const openArxivLink = (arxivId) => {
  window.open(`https://arxiv.org/abs/${arxivId}`, "_blank");
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
