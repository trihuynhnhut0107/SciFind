<template>
  <!-- Categories Browser -->
  <div class="w-full bg-white rounded-xl shadow-lg p-4 flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-text-main">Browse Categories</h3>
      <div class="flex items-center gap-3">
        <div class="text-xs text-text-muted">
          {{ Object.keys(categories).length }} main categories
        </div>
        <button
          v-if="selectedCategories.length > 0"
          @click="$emit('clearAll')"
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
        <CategoryGroup
          v-for="(categoryGroup, groupName) in categories"
          :key="groupName"
          :group-name="groupName"
          :category-group="categoryGroup"
          :is-expanded="expandedCategories.includes(groupName)"
          :selected-categories="selectedCategories"
          @toggle-expanded="toggleCategoryGroup(groupName)"
          @toggle-category="$emit('toggleCategory', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { categories } from "@/data/categories.js";
import CategoryGroup from "./CategoryGroup.vue";

// Props
const props = defineProps({
  selectedCategories: {
    type: Array,
    required: true,
  },
  expandedCategories: {
    type: Array,
    required: true,
  },
});

// Emits
const emit = defineEmits(["clearAll", "toggleCategory", "toggleCategoryGroup"]);

// Methods
const toggleCategoryGroup = (groupName) => {
  const index = props.expandedCategories.indexOf(groupName);
  if (index > -1) {
    const newExpanded = [...props.expandedCategories];
    newExpanded.splice(index, 1);
    emit("toggleCategoryGroup", newExpanded);
  } else {
    const newExpanded = [...props.expandedCategories, groupName];
    emit("toggleCategoryGroup", newExpanded);
  }
};
</script>

<style scoped>
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
