<template>
  <div class="relative">
    <div
      class="flex items-center bg-bg-main rounded-xl border-2 border-transparent focus-within:border-primary transition-colors">
      <div class="p-4">
        <svg
          class="w-6 h-6 text-text-muted"
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
        @input="handleInput"
        @keyup.enter="performSearch"
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
        :placeholder="placeholder"
        class="flex-1 bg-transparent py-4 pr-4 text-lg placeholder-text-muted focus:outline-none" />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="p-2 text-text-muted hover:text-text-secondary">
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        @click="performSearch"
        :disabled="!searchQuery.trim()"
        class="m-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        Search
      </button>
    </div>

    <!-- Search Suggestions -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        @mousedown="selectSuggestion(suggestion)"
        class="px-4 py-3 hover:bg-bg-main cursor-pointer border-b border-border last:border-b-0">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="font-medium text-text-main">{{ suggestion.text }}</div>
            <div
              v-if="suggestion.type"
              class="text-sm text-text-muted capitalize">
              {{ suggestion.type }}
            </div>
          </div>
          <div class="text-xs text-text-muted">
            {{ suggestion.count }} papers
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

// Props
const props = defineProps({
  placeholder: {
    type: String,
    default:
      "Search for papers... (e.g., 'machine learning image recognition')",
  },
  value: {
    type: String,
    default: "",
  },
});

// Emits
const emit = defineEmits(["search", "update:value"]);

// State
const searchQuery = ref(props.value);
const suggestions = ref([]);
const showSuggestions = ref(false);
const suggestionsTimeout = ref(null);

// Watch for prop changes
watch(
  () => props.value,
  (newValue) => {
    searchQuery.value = newValue;
  }
);

// Watch search query changes
watch(searchQuery, (newValue) => {
  emit("update:value", newValue);
});

// Methods
const handleInput = () => {
  // Clear previous timeout
  if (suggestionsTimeout.value) {
    clearTimeout(suggestionsTimeout.value);
  }

  // Debounce suggestions
  suggestionsTimeout.value = setTimeout(() => {
    if (searchQuery.value.length >= 2) {
      fetchSuggestions();
    } else {
      suggestions.value = [];
    }
  }, 300);
};

const fetchSuggestions = async () => {
  try {
    const response = await $fetch("/api/arxiv-paper/suggestions", {
      query: {
        term: searchQuery.value,
        types: "title,category,author",
      },
    });

    suggestions.value = response.data || [];
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    suggestions.value = [];
  }
};

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.text;
  suggestions.value = [];
  showSuggestions.value = false;
  performSearch();
};

const hideSuggestions = () => {
  // Delay hiding to allow for click events
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const clearSearch = () => {
  searchQuery.value = "";
  suggestions.value = [];
  showSuggestions.value = false;
};

const performSearch = () => {
  if (!searchQuery.value.trim()) return;

  suggestions.value = [];
  showSuggestions.value = false;

  emit("search", searchQuery.value);
};

// Expose search function for parent components
defineExpose({
  performSearch,
  clearSearch,
});
</script>

<style scoped>
/* Additional styles if needed */
</style>
