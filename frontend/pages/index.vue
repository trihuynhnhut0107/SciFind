<template>
  <div
    class="h-screen bg-gradient-to-br from-bg-main to-bg-card flex flex-col px-4 py-4">
    <!-- Logo and Title - Compact -->
    <Header />

    <!-- Main Content - Two Column Layout -->
    <div class="flex-1 flex gap-6 max-w-7xl mx-auto w-full">
      <!-- Left Column - Search -->
      <div class="w-1/2 flex flex-col space-y-4">
        <!-- Main Search Section -->
        <SearchSection
          :search-query="searchQuery"
          :search-type="searchType"
          :selected-categories="selectedCategories"
          @update:search-query="searchQuery = $event"
          @update:search-type="searchType = $event"
          @search="performSearch"
          @clear-categories="clearAllFilters"
          @remove-category="removeCategoryFilter" />

        <!-- Popular Categories -->
        <PopularCategories
          :selected-categories="selectedCategories"
          @toggle-category="toggleCategoryFilter" />

        <!-- Recent Searches -->
        <RecentSearches
          :recent-searches="recentSearches"
          @select-search="selectRecentSearch" />
      </div>

      <!-- Right Column - Categories Browser -->
      <div class="h-full w-1/2">
        <CategoryBrowser
          :selected-categories="selectedCategories"
          :expanded-categories="expandedCategories"
          @clear-all="clearAllFilters"
          @toggle-category="toggleCategoryFilter"
          @toggle-category-group="expandedCategories = $event" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Use the default layout without header
definePageMeta({
  layout: false,
});

// Search state
const searchQuery = ref("");
const searchType = ref("enhanced");
const recentSearches = ref([]);
const expandedCategories = ref([]);
const selectedCategories = ref([]); // Track selected category filters

// Methods
const performSearch = async () => {
  // Validation based on search type
  if (searchType.value === "enhanced" && !searchQuery.value.trim()) {
    // AI-Enhanced search requires a search term
    return;
  }

  if (
    searchType.value === "basic" &&
    !searchQuery.value.trim() &&
    selectedCategories.value.length === 0
  ) {
    // Basic search needs either a search term or categories
    return;
  }

  // Add to recent searches (only if there's a search query)
  if (
    searchQuery.value.trim() &&
    !recentSearches.value.includes(searchQuery.value)
  ) {
    recentSearches.value.unshift(searchQuery.value);
    recentSearches.value = recentSearches.value.slice(0, 5); // Keep only 5 recent
    localStorage.setItem(
      "recentSearches",
      JSON.stringify(recentSearches.value)
    );
  }

  // Build query parameters
  const queryParams = {
    type: searchType.value,
  };

  // Add search query if present
  if (searchQuery.value.trim()) {
    queryParams.q = searchQuery.value;
  }

  // Add selected categories if any
  if (selectedCategories.value.length > 0) {
    queryParams.categories = selectedCategories.value.join(",");
  }

  // Navigate to search results
  await navigateTo({
    path: "/search",
    query: queryParams,
  });
};

const toggleCategoryFilter = (category) => {
  const index = selectedCategories.value.indexOf(category.id);
  if (index > -1) {
    // Remove category if already selected
    selectedCategories.value.splice(index, 1);
  } else {
    // Add category if not selected
    selectedCategories.value.push(category.id);
  }
};

const removeCategoryFilter = (categoryId) => {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  }
};

const clearAllFilters = () => {
  selectedCategories.value = [];
};

const selectRecentSearch = (search) => {
  searchQuery.value = search;
  performSearch();
};

// Load recent searches on mount
onMounted(() => {
  const saved = localStorage.getItem("recentSearches");
  if (saved) {
    recentSearches.value = JSON.parse(saved);
  }
});
</script>

<style scoped>
/* Page-level styles only */
.gradient-text {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
