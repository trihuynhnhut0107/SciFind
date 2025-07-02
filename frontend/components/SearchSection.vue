<template>
  <!-- Main Search Section -->
  <div class="bg-white rounded-xl shadow-lg p-6 flex-shrink-0">
    <div class="space-y-4">
      <!-- Search Bar -->
      <MainSearchInput
        :search-query="searchQuery"
        :search-type="searchType"
        :selected-categories="selectedCategories"
        @update:search-query="$emit('update:searchQuery', $event)"
        @search="$emit('search')" />

      <!-- Search Type Toggle -->
      <SearchTypeToggle
        :search-type="searchType"
        @update:search-type="$emit('update:searchType', $event)" />

      <!-- Selected Categories Display -->
      <CategoryFilter
        :selected-categories="selectedCategories"
        @clear-all="$emit('clearCategories')"
        @remove-category="$emit('removeCategory', $event)" />
    </div>
  </div>
</template>

<script setup>
import MainSearchInput from "./MainSearchInput.vue";
import SearchTypeToggle from "./SearchTypeToggle.vue";
import CategoryFilter from "./CategoryFilter.vue";

// Props
const props = defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
  searchType: {
    type: String,
    required: true,
  },
  selectedCategories: {
    type: Array,
    required: true,
  },
});

// Emits
defineEmits([
  "update:searchQuery",
  "update:searchType",
  "search",
  "clearCategories",
  "removeCategory",
]);
</script>
