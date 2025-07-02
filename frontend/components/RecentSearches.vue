<template>
  <!-- Recent Searches -->
  <div
    v-if="recentSearches.length > 0"
    class="bg-white rounded-xl shadow-lg p-4 flex-shrink-0">
    <h4 class="text-base font-semibold text-text-main mb-3">Recent Searches</h4>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="search in recentSearches"
        :key="search"
        @click="$emit('selectSearch', search)"
        class="px-2 py-1 bg-bg-highlight text-text-secondary rounded-md hover:bg-primary hover:text-white transition-colors text-xs">
        {{ search }}
      </button>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  recentSearches: {
    type: Array,
    required: true,
  },
});

// Emits
defineEmits(["selectSearch"]);
</script>
