<template>
  <div
    class="h-screen bg-gradient-to-br from-bg-main to-bg-card flex flex-col px-4 py-4">
    <!-- Logo and Title - Compact -->
    <div class="text-center mb-6">
      <h1 class="text-4xl font-bold text-primary mb-2">SciFind</h1>
      <p class="text-lg text-text-secondary">
        AI-Enhanced Scientific Paper Discovery
      </p>
      <p class="text-sm text-text-muted mt-1">
        Search arXiv papers with natural language
      </p>
    </div>

    <!-- Main Content - Two Column Layout -->
    <div class="flex-1 flex gap-6 max-w-7xl mx-auto w-full">
      <!-- Left Column - Search -->
      <div class="w-1/2 flex flex-col space-y-4">
        <!-- Main Search Section -->
        <div class="bg-white rounded-xl shadow-lg p-6 flex-shrink-0">
          <div class="space-y-4">
            <!-- Search Bar -->
            <div class="relative">
              <div
                class="flex items-center bg-bg-main rounded-lg border-2 border-transparent focus-within:border-primary transition-colors">
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
                  :placeholder="
                    searchType === 'enhanced'
                      ? 'Describe what you\'re looking for (required for AI search)...'
                      : 'Describe what you\'re looking for or select categories below...'
                  "
                  class="flex-1 bg-transparent py-3 pr-3 text-base placeholder-text-muted focus:outline-none" />
                <button
                  @click="performSearch"
                  :disabled="
                    !searchQuery.trim() &&
                    (searchType === 'enhanced' ||
                      selectedCategories.length === 0)
                  "
                  :class="{
                    'bg-primary hover:bg-primary/90 text-white':
                      searchQuery.trim() ||
                      (searchType === 'basic' && selectedCategories.length > 0),
                    'bg-gray-300 text-gray-500 cursor-not-allowed':
                      !searchQuery.trim() &&
                      (searchType === 'enhanced' ||
                        selectedCategories.length === 0),
                  }"
                  class="m-1 px-4 py-2 rounded-md transition-colors text-sm">
                  Search
                </button>
              </div>
            </div>

            <!-- Search Type Toggle - iOS Style -->
            <div class="flex items-center justify-center">
              <div class="relative bg-bg-main rounded-full p-1 w-80">
                <!-- Toggle Background -->
                <div class="flex relative">
                  <!-- Sliding Background -->
                  <div
                    class="absolute top-0 bottom-0 w-1/2 bg-primary rounded-full transition-transform duration-300 ease-out shadow-sm"
                    :style="{
                      transform:
                        searchType === 'basic'
                          ? 'translateX(100%)'
                          : 'translateX(0%)',
                    }"></div>

                  <!-- Enhanced Option -->
                  <button
                    @click="searchType = 'enhanced'"
                    :class="
                      searchType === 'enhanced'
                        ? 'text-white'
                        : 'text-text-secondary'
                    "
                    class="relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full">
                    <span class="flex items-center justify-center">
                      <svg
                        class="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI-Enhanced
                    </span>
                  </button>

                  <!-- Basic Option -->
                  <button
                    @click="searchType = 'basic'"
                    :class="
                      searchType === 'basic'
                        ? 'text-white'
                        : 'text-text-secondary'
                    "
                    class="relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full">
                    <span class="flex items-center justify-center">
                      <svg
                        class="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Basic Search
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Selected Categories Display -->
            <div
              v-if="selectedCategories.length > 0"
              class="border-t border-border pt-3">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-text-main"
                  >Active Filters:</span
                >
                <button
                  @click="clearAllFilters"
                  class="text-xs text-primary hover:text-primary/80">
                  Clear All
                </button>
              </div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="categoryId in selectedCategories"
                  :key="categoryId"
                  class="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  {{ getCategoryDisplayName(categoryId) }}
                  <button
                    @click="toggleCategoryFilter({ id: categoryId })"
                    class="ml-1 hover:text-primary/80">
                    <svg
                      class="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Popular Categories -->
        <div class="bg-white rounded-xl shadow-lg p-4 flex-shrink-0">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-semibold text-text-main">
              Popular Categories
            </h3>
            <div
              v-if="selectedCategories.length > 0"
              class="text-xs text-text-muted">
              {{ selectedCategories.length }} selected
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="category in popularCategories"
              :key="category.id"
              @click="toggleCategoryFilter(category)"
              :class="
                isCategorySelected(category.id)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-bg-main hover:bg-primary hover:text-white border-transparent'
              "
              class="p-2 text-left rounded-md transition-colors group text-sm border-2">
              <div class="font-medium">{{ category.name }}</div>
              <div
                :class="
                  isCategorySelected(category.id)
                    ? 'text-white/80'
                    : 'text-text-muted group-hover:text-white/80'
                "
                class="text-xs mt-0.5 truncate">
                {{ category.description }}
              </div>
            </button>
          </div>
        </div>

        <!-- Recent Searches -->
        <div
          v-if="recentSearches.length > 0"
          class="bg-white rounded-xl shadow-lg p-4 flex-shrink-0">
          <h4 class="text-base font-semibold text-text-main mb-3">
            Recent Searches
          </h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="search in recentSearches"
              :key="search"
              @click="
                searchQuery = search;
                performSearch();
              "
              class="px-2 py-1 bg-bg-highlight text-text-secondary rounded-md hover:bg-primary hover:text-white transition-colors text-xs">
              {{ search }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column - Categories Browser -->
      <div class="w-1/2 bg-white rounded-xl shadow-lg p-4 flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-text-main">
            Browse Categories
          </h3>
          <div class="flex items-center gap-3">
            <div class="text-xs text-text-muted">
              {{ Object.keys(categories).length }} main categories
            </div>
            <button
              v-if="selectedCategories.length > 0"
              @click="clearAllFilters"
              class="text-xs text-primary hover:text-primary/80 underline">
              Clear All ({{ selectedCategories.length }})
            </button>
          </div>
        </div>

        <!-- Categories with Internal Scroll -->
        <div
          class="flex-1 overflow-y-auto pr-2"
          style="max-height: calc(100vh - 240px)">
          <div class="space-y-3">
            <div
              v-for="(categoryGroup, groupName) in categories"
              :key="groupName"
              class="border border-border rounded-lg overflow-hidden">
              <!-- Main Category Header -->
              <button
                @click="toggleCategoryGroup(groupName)"
                class="w-full px-3 py-2 bg-bg-highlight hover:bg-bg-main text-left flex items-center justify-between transition-colors">
                <div class="flex items-center">
                  <div
                    class="w-2 h-2 rounded-full mr-2"
                    :class="getCategoryColor(categoryGroup.id)"></div>
                  <span class="font-medium text-text-main text-sm">{{
                    groupName
                  }}</span>
                  <span class="ml-2 text-xs text-text-muted"
                    >({{ categoryGroup.subcategories.length }})</span
                  >
                </div>
                <svg
                  class="w-4 h-4 text-text-muted transition-transform"
                  :class="
                    expandedCategories.includes(groupName) ? 'rotate-180' : ''
                  "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Subcategories -->
              <div
                v-if="expandedCategories.includes(groupName)"
                class="grid grid-cols-1 gap-1 p-2 bg-white">
                <button
                  v-for="subcategory in categoryGroup.subcategories"
                  :key="subcategory.id"
                  @click="toggleCategoryFilter(subcategory)"
                  :class="
                    isCategorySelected(subcategory.id)
                      ? 'border-primary bg-primary text-white'
                      : 'border-border hover:border-primary hover:bg-primary hover:text-white'
                  "
                  class="p-2 text-left border rounded-md transition-colors group relative">
                  <!-- Selected indicator -->
                  <div
                    v-if="isCategorySelected(subcategory.id)"
                    class="absolute top-1 right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <svg
                      class="w-2 h-2 text-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="flex justify-between items-start pr-4">
                    <div class="flex-1">
                      <div class="font-medium text-xs">
                        {{ subcategory.name }}
                      </div>
                      <div
                        :class="
                          isCategorySelected(subcategory.id)
                            ? 'text-white/80'
                            : 'text-text-muted group-hover:text-white/80'
                        "
                        class="text-xs mt-0.5 line-clamp-1">
                        {{ subcategory.description }}
                      </div>
                    </div>
                    <div
                      :class="
                        isCategorySelected(subcategory.id)
                          ? 'text-white/60'
                          : 'text-primary group-hover:text-white/60'
                      "
                      class="text-xs font-mono ml-2 flex-shrink-0">
                      {{ subcategory.id }}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  categories,
  popularCategories,
  getCategoryColor,
} from "@/data/categories.js";

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

const isCategorySelected = (categoryId) => {
  return selectedCategories.value.includes(categoryId);
};

const clearAllFilters = () => {
  selectedCategories.value = [];
};

const getCategoryDisplayName = (categoryId) => {
  // Look through all categories to find the display name
  for (const categoryGroup of Object.values(categories)) {
    const subcategory = categoryGroup.subcategories.find(
      (sub) => sub.id === categoryId
    );
    if (subcategory) {
      return subcategory.name;
    }
  }
  // Fallback to just the ID if not found
  return categoryId;
};

const toggleCategoryGroup = (groupName) => {
  const index = expandedCategories.value.indexOf(groupName);
  if (index > -1) {
    expandedCategories.value.splice(index, 1);
  } else {
    expandedCategories.value.push(groupName);
  }
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
/* Additional custom styles if needed */
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

.rotate-180 {
  transform: rotate(180deg);
}

.transition-transform {
  transition: transform 0.3s ease;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar for categories */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
