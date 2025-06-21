<template>
  <div
    @click="emit('click')"
    class="bg-bg-main flex p-4 hover:bg-button-bg-hover duration-100 hover:cursor-pointer">
    <div class="flex flex-col grow justify-around pr-4 min-w-0">
      <div>
        <div class="text-text-secondary text-xs md:text-sm">{{ author }}</div>
        <div class="font-bold text-base md:text-lg">{{ title }}</div>
      </div>
      <div class="text-text-secondary text-xs md:text-sm line-clamp-2">
        {{ previewContent }}
      </div>
    </div>
    <div class="justify-center flex">
      <img
        :src="image"
        alt="Article image"
        class="object-cover max-w-[6rem] max-h-[6rem] aspect-square rounded-xl" />
    </div>
  </div>
</template>

<script setup>
const { title, previewContent, author, image } = defineProps([
  "title",
  "previewContent",
  "author",
  "image",
]);
const emit = defineEmits(["click"]);
</script>

<style lang="scss" scoped></style>
