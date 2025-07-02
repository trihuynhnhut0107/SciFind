<template>
  <!-- Search Summary -->
  <div class="mb-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-text-main">
          Search Results
          <span v-if="totalResults" class="text-text-muted font-normal">
            ({{ totalResults.toLocaleString() }} papers found)
          </span>
          <span
            v-if="searchType === 'enhanced'"
            class="ml-2 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
            AI Enhanced
          </span>
        </h2>
        <p v-if="currentQuery" class="text-text-secondary mt-1">
          Results for: "{{ currentQuery }}"
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  totalResults: {
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
});
</script>
