<template>
  <!-- Main Search Input -->
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
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        @keyup.enter="$emit('search')"
        :placeholder="placeholder"
        class="flex-1 bg-transparent py-3 pr-3 text-base placeholder-text-muted focus:outline-none" />
      <button
        @click="$emit('search')"
        :disabled="isDisabled"
        :class="{
          'bg-primary hover:bg-primary/90 text-white': !isDisabled,
          'bg-gray-300 text-gray-500 cursor-not-allowed': isDisabled,
        }"
        class="m-1 px-4 py-2 rounded-md transition-colors text-sm">
        Search
      </button>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
  searchType: {
    type: String,
    required: true,
    validator: (value) => ["enhanced", "basic"].includes(value),
  },
  selectedCategories: {
    type: Array,
    required: true,
  },
});

// Emits
defineEmits(["update:searchQuery", "search"]);

// Computed
const placeholder = computed(() => {
  return props.searchType === "enhanced"
    ? "Describe what you're looking for (required for AI search)..."
    : "Describe what you're looking for or select categories below...";
});

const isDisabled = computed(() => {
  return (
    !props.searchQuery.trim() &&
    (props.searchType === "enhanced" || props.selectedCategories.length === 0)
  );
});
</script>
