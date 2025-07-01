<template>
  <div class="flex flex-col rounded-4xl bg-bg-main p-4 h-full overflow-y-auto">
    <template v-for="(article, idx) in newsContent" :key="idx">
      <ArticlePreview
        @click="emit('article-click', article.title)"
        :title="article.title"
        :author="article.author"
        :preview-content="article.previewContent"
        :image="article.image" />
      <!-- Gradient Divider: Skip last -->
      <div
        v-if="idx < newsContent.length - 1"
        class="h-[1.5px] w-full bg-gradient-to-r from-transparent via-text-secondary to-transparent my-2">
      </div>
    </template>
  </div>
</template>

<script setup>
const { newsContent } = defineProps(["newsContent"]);
const emit = defineEmits(["article-click"]);
</script>

<style scoped></style>
