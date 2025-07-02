<template>
  <!-- Popular Categories -->
  <div class="bg-white rounded-xl shadow-lg p-4 flex-shrink-0">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-base font-semibold text-text-main">Popular Categories</h3>
      <div v-if="selectedCategories.length > 0" class="text-xs text-text-muted">
        {{ selectedCategories.length }} selected
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="category in popularCategories"
        :key="category.id"
        @click="$emit('toggleCategory', category)"
        :class="
          selectedCategories.includes(category.id)
            ? 'bg-primary text-white border-primary'
            : 'bg-bg-main hover:bg-primary hover:text-white border-transparent'
        "
        class="p-2 text-left rounded-md transition-colors group text-sm border-2">
        <div class="font-medium">{{ category.name }}</div>
        <div
          :class="
            selectedCategories.includes(category.id)
              ? 'text-white/80'
              : 'text-text-muted group-hover:text-white/80'
          "
          class="text-xs mt-0.5 truncate">
          {{ category.description }}
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { popularCategories } from "@/data/categories.js";

// Props
const props = defineProps({
  selectedCategories: {
    type: Array,
    required: true,
  },
});

// Emits
defineEmits(["toggleCategory"]);
</script>
