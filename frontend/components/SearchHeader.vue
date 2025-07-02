<template>
  <!-- Search Header with inline search -->
  <header class="bg-white border-b border-border px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center space-x-4">
      <NuxtLink
        to="/"
        class="text-2xl font-bold text-primary hover:text-primary/80">
        SciFind
      </NuxtLink>

      <div class="flex-1 max-w-2xl">
        <div
          class="flex items-center bg-bg-main rounded-lg border border-border focus-within:border-primary transition-colors">
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
            placeholder="Search papers..."
            class="flex-1 bg-transparent py-3 pr-3 focus:outline-none" />
          <button
            @click="$emit('search')"
            class="m-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            Search
          </button>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="$emit('toggleSearchType')"
          :class="
            searchType === 'enhanced'
              ? 'bg-primary text-white'
              : 'bg-bg-card text-text-secondary'
          "
          class="px-3 py-2 rounded-md text-sm font-medium transition-colors">
          {{ searchType === "enhanced" ? "AI Enhanced" : "Basic Search" }}
        </button>
      </div>
    </div>
  </header>
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
  },
});

// Emits
defineEmits(["update:searchQuery", "search", "toggleSearchType"]);
</script>
