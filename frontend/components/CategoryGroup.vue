<template>
  <!-- Category Group -->
  <div class="border border-border rounded-lg overflow-hidden">
    <!-- Main Category Header -->
    <button
      @click="$emit('toggleExpanded')"
      class="w-full px-3 py-2 bg-bg-highlight hover:bg-bg-main text-left flex items-center justify-between transition-colors">
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="categoryColor"></div>
        <span class="font-medium text-text-main text-sm">{{ groupName }}</span>
        <span class="ml-2 text-xs text-text-muted"
          >({{ categoryGroup.subcategories.length }})</span
        >
      </div>
      <svg
        class="w-4 h-4 text-text-muted transition-transform"
        :class="isExpanded ? 'rotate-180' : ''"
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
    <div v-if="isExpanded" class="grid grid-cols-1 gap-1 p-2 bg-white">
      <button
        v-for="subcategory in categoryGroup.subcategories"
        :key="subcategory.id"
        @click="$emit('toggleCategory', subcategory)"
        :class="
          selectedCategories.includes(subcategory.id)
            ? 'border-primary bg-primary text-white'
            : 'border-border hover:border-primary hover:bg-primary hover:text-white'
        "
        class="p-2 text-left border rounded-md transition-colors group relative">
        <!-- Selected indicator -->
        <div
          v-if="selectedCategories.includes(subcategory.id)"
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
                selectedCategories.includes(subcategory.id)
                  ? 'text-white/80'
                  : 'text-text-muted group-hover:text-white/80'
              "
              class="text-xs mt-0.5 line-clamp-1">
              {{ subcategory.description }}
            </div>
          </div>
          <div
            :class="
              selectedCategories.includes(subcategory.id)
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
</template>

<script setup>
import { getCategoryColor } from "@/data/categories.js";

// Props
const props = defineProps({
  groupName: {
    type: String,
    required: true,
  },
  categoryGroup: {
    type: Object,
    required: true,
  },
  isExpanded: {
    type: Boolean,
    required: true,
  },
  selectedCategories: {
    type: Array,
    required: true,
  },
});

// Emits
defineEmits(["toggleExpanded", "toggleCategory"]);

// Computed
const categoryColor = computed(() => {
  return getCategoryColor(props.categoryGroup.id);
});
</script>

<style scoped>
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
</style>
