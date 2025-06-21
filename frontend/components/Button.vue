<template>
  <div>
    <button
      @click="emit('click')"
      class="rounded-2xl px-6 py-1 text-sm bg-button-bg hover:bg-button-bg-hover hover:cursor-pointer">
      {{ content }}
    </button>
  </div>
</template>

<script setup>
const { content, onButtonClick } = defineProps(["content"]);
const emit = defineEmits(["click"]);
</script>

<style scoped></style>
