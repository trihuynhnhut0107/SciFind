<template>
  <!-- Search Results List -->
  <div class="flex-1">
    <!-- Search Summary -->
    <SearchSummary
      :total-results="totalResults"
      :search-type="searchType"
      :current-query="currentQuery" />

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
      <PaperCard
        v-for="paper in papers"
        :key="paper.id"
        :paper="paper"
        :search-type="searchType"
        @abstract-click="$emit('abstractClick', $event)"
        @pdf-click="$emit('pdfClick', $event)"
        @source-click="$emit('sourceClick', $event)" />

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-center space-x-2 mt-8">
        <button
          @click="$emit('changePage', currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-md bg-white border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-main">
          Previous
        </button>

        <span class="px-4 py-2 text-text-muted">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          @click="$emit('changePage', currentPage + 1)"
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
      <h3 class="text-xl font-medium text-text-main mb-2">No papers found</h3>
      <p class="text-text-muted mb-4">
        Try adjusting your search terms or filters
      </p>
      <NuxtLink to="/" class="text-primary hover:text-primary/80 font-medium">
        ← Back to search
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import SearchSummary from "./SearchSummary.vue";
import PaperCard from "./PaperCard.vue";

// Props
const props = defineProps({
  papers: {
    type: Array,
    required: true,
  },
  totalResults: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  searchType: {
    type: String,
    required: true,
  },
  currentQuery: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
});

// Emits
defineEmits(["abstractClick", "pdfClick", "sourceClick", "changePage"]);
</script>
