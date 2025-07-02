<template>
  <div>
    <button
      @click="emit('click')"
      :class="
        customClass ||
        'rounded-2xl px-6 py-1 text-sm bg-button-bg hover:bg-button-bg-hover hover:cursor-pointer'
      "
      :style="customStyle"
      v-bind="$attrs">
      {{ content }}
    </button>
  </div>
</template>

<script setup>
const { content, onButtonClick, customClass, customStyle } = defineProps([
  "content",
  "customClass",
  "customStyle",
]);
const emit = defineEmits(["click"]);
</script>

<style scoped></style>
