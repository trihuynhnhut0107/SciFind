<template>
  <div class="best-of-week bg-bg-card p-4 rounded-4xl">
    <h2
      class="text-lg w-fit font-bold mb-2 border-l-primary border-l-2 px-2 bg-gradient-to-r from-accent via-bg-card to-bg-card">
      BEST OF THE WEEK
    </h2>
    <div
      class="news-item flex flex-row-reverse justify-between items-center space-x-4 space-x-reverse flex-grow transition-opacity duration-500"
      :class="{ 'opacity-0': isTransitioning, 'opacity-100': !isTransitioning }"
      style="min-height: 300px">
      <div class="w-172 h-86 bg-bg-card flex items-center justify-center">
        <img
          class="max-w-full max-h-full rounded-lg object-contain"
          :src="currentNews.image"
          alt="Best of the Week Image" />
      </div>
      <div>
        <h3 class="text-xl font-semibold">{{ currentNews.title }}</h3>
        <p class="text-sm text-gray-500">
          By {{ currentNews.author }} - {{ currentNews.publishedDate }}
        </p>
        <p class="text-sm mt-2 line-clamp-3">{{ currentNews.content }}</p>
        <button
          class="mt-4 px-4 py-2 rounded-4xl bg-button-bg text-button-text hover:bg-button-bg-hover"
          @click="navigateToArticle(currentNews.title)">
          Read article ->
        </button>
      </div>
    </div>
    <div
      class="remaining-news mt-6 flex-shrink-0 transition-all duration-500"
      style="min-height: 200px">
      <h3 class="text-lg font-bold mb-4">Recommended</h3>
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="(news, index) in remainingNews"
          :key="index"
          class="flex items-center space-x-4">
          <img
            class="w-16 h-16 rounded-lg object-cover"
            :src="news.image"
            alt="News Image" />
          <div>
            <h4 class="text-sm font-semibold">{{ news.title }}</h4>
            <p class="text-xs text-gray-500">By {{ news.author }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const { newsList } = defineProps({
  newsList: {
    type: Array,
    required: true,
  },
});

const currentNewsIndex = ref(0);
const currentNews = ref(newsList[currentNewsIndex.value]);
const remainingNews = ref(
  newsList.filter((_, index) => index !== currentNewsIndex.value)
);
const isTransitioning = ref(false);

const navigateToArticle = (title) => {
  console.log("Navigating to", title);
};

onMounted(() => {
  setInterval(() => {
    isTransitioning.value = true;
    setTimeout(() => {
      currentNewsIndex.value = (currentNewsIndex.value + 1) % newsList.length;
      currentNews.value = newsList[currentNewsIndex.value];
      remainingNews.value = newsList.filter(
        (_, index) => index !== currentNewsIndex.value
      );
      isTransitioning.value = false;
    }, 500);
  }, 5000);
});
</script>

<style scoped>
.news-item h3 {
  color: var(--color-text-primary);
}
.news-item p {
  color: var(--color-text-secondary);
}
button {
  transition: background-color 0.3s ease;
}
button:hover {
  background-color: var(--color-button-bg-hover);
}
.remaining-news h3 {
  color: var(--color-text-primary);
}
.remaining-news h4 {
  color: var(--color-text-primary);
}
.remaining-news p {
  color: var(--color-text-secondary);
}
</style>
