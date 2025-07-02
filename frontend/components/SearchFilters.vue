<template>
  <!-- Filters Sidebar -->
  <div class="lg:w-64 space-y-4">
    <div class="bg-white rounded-lg p-4">
      <h3 class="font-semibold text-text-main mb-3">Categories</h3>
      <div class="space-y-2">
        <label
          v-for="category in availableCategories"
          :key="category.id"
          class="flex items-center">
          <input
            :checked="selectedCategories.includes(category.id)"
            @change="$emit('toggleCategory', category.id)"
            type="checkbox"
            class="rounded border-border text-primary focus:ring-primary" />
          <span class="ml-2 text-sm text-text-secondary">{{
            category.name
          }}</span>
        </label>
      </div>
    </div>

    <div class="bg-white rounded-lg p-4">
      <h3 class="font-semibold text-text-main mb-3">Date Range</h3>
      <div class="space-y-2">
        <label class="flex items-center">
          <input
            :checked="dateFilter === 'any'"
            @change="$emit('update:dateFilter', 'any')"
            type="radio"
            name="dateFilter"
            class="text-primary focus:ring-primary" />
          <span class="ml-2 text-sm text-text-secondary">Any time</span>
        </label>
        <label class="flex items-center">
          <input
            :checked="dateFilter === 'year'"
            @change="$emit('update:dateFilter', 'year')"
            type="radio"
            name="dateFilter"
            class="text-primary focus:ring-primary" />
          <span class="ml-2 text-sm text-text-secondary">Past year</span>
        </label>
        <label class="flex items-center">
          <input
            :checked="dateFilter === 'month'"
            @change="$emit('update:dateFilter', 'month')"
            type="radio"
            name="dateFilter"
            class="text-primary focus:ring-primary" />
          <span class="ml-2 text-sm text-text-secondary">Past month</span>
        </label>
      </div>
    </div>

    <div class="bg-white rounded-lg p-4">
      <h3 class="font-semibold text-text-main mb-3">Sort By</h3>
      <select
        :value="sortBy"
        @change="$emit('update:sortBy', $event.target.value)"
        class="w-full border border-border rounded-md px-3 py-2 text-sm">
        <option value="relevance">Relevance</option>
        <option value="date">Date (newest first)</option>
        <option value="citations">Citations</option>
        <option value="title">Title</option>
      </select>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  selectedCategories: {
    type: Array,
    required: true,
  },
  dateFilter: {
    type: String,
    required: true,
  },
  sortBy: {
    type: String,
    required: true,
  },
  availableCategories: {
    type: Array,
    required: true,
  },
});

// Emits
defineEmits(["toggleCategory", "update:dateFilter", "update:sortBy"]);
</script>
