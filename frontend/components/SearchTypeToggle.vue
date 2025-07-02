<template>
  <!-- Search Type Toggle - iOS Style -->
  <div class="flex items-center justify-center">
    <div class="relative bg-bg-main rounded-full p-1 w-80">
      <!-- Toggle Background -->
      <div class="flex relative">
        <!-- Sliding Background -->
        <div
          class="absolute top-0 bottom-0 w-1/2 bg-primary rounded-full transition-transform duration-300 ease-out shadow-sm"
          :style="{
            transform:
              searchType === 'basic' ? 'translateX(100%)' : 'translateX(0%)',
          }"></div>

        <!-- Enhanced Option -->
        <button
          @click="$emit('update:searchType', 'enhanced')"
          :class="
            searchType === 'enhanced' ? 'text-white' : 'text-text-secondary'
          "
          class="relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full">
          <span class="flex items-center justify-center">
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI-Enhanced
          </span>
        </button>

        <!-- Basic Option -->
        <button
          @click="$emit('update:searchType', 'basic')"
          :class="searchType === 'basic' ? 'text-white' : 'text-text-secondary'"
          class="relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full">
          <span class="flex items-center justify-center">
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Basic Search
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  searchType: {
    type: String,
    required: true,
    validator: (value) => ["enhanced", "basic"].includes(value),
  },
});

// Emits
defineEmits(["update:searchType"]);
</script>
