<template>
  <!-- Selected Categories Display -->
  <div v-if="selectedCategories.length > 0" class="border-t border-border pt-3">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-medium text-text-main">Active Filters:</span>
      <button
        @click="$emit('clearAll')"
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
          @click="$emit('removeCategory', categoryId)"
          class="ml-1 hover:text-primary/80">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </span>
    </div>
  </div>
</template>

<script setup>
import { categories } from "@/data/categories.js";

// Props
const props = defineProps({
  selectedCategories: {
    type: Array,
    required: true,
  },
});

// Emits
defineEmits(["clearAll", "removeCategory"]);

// Methods
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
</script>
