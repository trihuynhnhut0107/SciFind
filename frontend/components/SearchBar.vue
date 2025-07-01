<template>
  <div class="relative w-full">
    <input
      v-model="query"
      @keyup.enter="onSearch"
      type="text"
      placeholder="Article name, tag, category..."
      class="w-full py-3 pl-4 pr-10 bg-white placeholder-gray-400 text-sm rounded-2xl shadow-sm border-none focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" />
    <button
      @click="onSearch"
      class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M12.9 14.32a8 8 0 111.414-1.414l5.387 5.388-1.414 1.414-5.387-5.388z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const query = ref('')
const emit = defineEmits(['search'])
function onSearch() {
  if (!query.value) return
  emit('search', query.value)
}
</script>
