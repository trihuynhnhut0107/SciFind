<template>
  <div class="min-h-screen bg-bg-main">
    <!-- Header -->
    <header class="bg-white border-b border-border px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <NuxtLink
            to="/"
            class="text-2xl font-bold text-primary hover:text-primary/80">
            SciFind
          </NuxtLink>
          <span class="text-text-muted">|</span>
          <button
            @click="$router.back()"
            class="text-text-secondary hover:text-primary flex items-center">
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7" />
            </svg>
            Back to results
          </button>
        </div>

        <div class="flex items-center space-x-3">
          <button
            v-if="paper?.arxiv_id"
            @click="openArxivLink(paper.arxiv_id)"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center">
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on arXiv
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p class="text-text-muted">Loading paper details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center">
          <svg
            class="w-6 h-6 text-red-600 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-red-800 font-medium">Error Loading Paper</h3>
            <p class="text-red-600 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Paper Content -->
      <div v-else-if="paper" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Title and Basic Info -->
          <div class="bg-white rounded-lg p-6">
            <h1 class="text-3xl font-bold text-text-main mb-4 leading-tight">
              {{ paper.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-4 mb-6">
              <div class="flex items-center text-text-secondary">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Published: {{ formatDate(paper.published) }}
              </div>

              <div
                v-if="paper.updated && paper.updated !== paper.published"
                class="flex items-center text-text-secondary">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Updated: {{ formatDate(paper.updated) }}
              </div>

              <div
                v-if="paper.category"
                class="px-3 py-1 bg-bg-highlight text-primary rounded-full text-sm font-medium">
                {{ paper.category }}
              </div>

              <div
                v-if="paper.arxiv_id"
                class="flex items-center text-text-secondary">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.073-2.327C5.99 12.224 6 12.112 6 12c0-3.314 2.686-6 6-6s6 2.686 6 6c0 .113.01.224.073.673z" />
                </svg>
                arXiv: {{ paper.arxiv_id }}
              </div>
            </div>

            <!-- Authors -->
            <div class="mb-6">
              <h3 class="font-semibold text-text-main mb-2">Authors</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(author, index) in paper.authors"
                  :key="index"
                  class="px-3 py-1 bg-bg-main text-text-secondary rounded-md hover:bg-bg-highlight transition-colors cursor-pointer">
                  {{ author }}
                </span>
              </div>
            </div>

            <!-- Abstract -->
            <div>
              <h3 class="font-semibold text-text-main mb-3">Abstract</h3>
              <div class="prose prose-gray max-w-none">
                <p
                  class="text-text-secondary leading-relaxed whitespace-pre-line">
                  {{ paper.abstract }}
                </p>
              </div>
            </div>
          </div>

          <!-- Additional Content Sections -->
          <div v-if="paper.comments" class="bg-white rounded-lg p-6">
            <h3 class="font-semibold text-text-main mb-3">Comments</h3>
            <p class="text-text-secondary">{{ paper.comments }}</p>
          </div>

          <div v-if="paper.journal_ref" class="bg-white rounded-lg p-6">
            <h3 class="font-semibold text-text-main mb-3">Journal Reference</h3>
            <p class="text-text-secondary">{{ paper.journal_ref }}</p>
          </div>

          <div v-if="paper.doi" class="bg-white rounded-lg p-6">
            <h3 class="font-semibold text-text-main mb-3">DOI</h3>
            <a
              :href="`https://doi.org/${paper.doi}`"
              target="_blank"
              class="text-primary hover:text-primary/80 font-mono text-sm">
              {{ paper.doi }}
            </a>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-white rounded-lg p-6">
            <h3 class="font-semibold text-text-main mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <button
                v-if="paper.arxiv_id"
                @click="openArxivLink(paper.arxiv_id)"
                class="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in arXiv
              </button>

              <button
                v-if="paper.arxiv_id"
                @click="downloadPdf(paper.arxiv_id)"
                class="w-full flex items-center justify-center px-4 py-2 bg-bg-main text-text-main rounded-lg hover:bg-bg-highlight transition-colors border border-border">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>

              <button
                @click="shareLink"
                class="w-full flex items-center justify-center px-4 py-2 bg-bg-main text-text-main rounded-lg hover:bg-bg-highlight transition-colors border border-border">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>

          <!-- Paper Stats -->
          <div class="bg-white rounded-lg p-6">
            <h3 class="font-semibold text-text-main mb-4">Paper Statistics</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-text-secondary">Published</span>
                <span class="font-medium text-text-main">{{
                  formatDate(paper.published)
                }}</span>
              </div>

              <div
                v-if="paper.updated && paper.updated !== paper.published"
                class="flex justify-between items-center">
                <span class="text-text-secondary">Last Updated</span>
                <span class="font-medium text-text-main">{{
                  formatDate(paper.updated)
                }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-text-secondary">Category</span>
                <span class="font-medium text-text-main">{{
                  paper.category || "N/A"
                }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-text-secondary">Authors</span>
                <span class="font-medium text-text-main">{{
                  paper.authors?.length || 0
                }}</span>
              </div>
            </div>
          </div>

          <!-- Related Papers -->
          <div v-if="relatedPapers.length > 0" class="bg-white rounded-lg p-6">
            <h3 class="font-semibold text-text-main mb-4">Related Papers</h3>
            <div class="space-y-3">
              <div
                v-for="related in relatedPapers"
                :key="related.id"
                @click="navigateToPaper(related.id)"
                class="p-3 bg-bg-main rounded-lg hover:bg-bg-highlight transition-colors cursor-pointer">
                <h4
                  class="font-medium text-sm text-text-main line-clamp-2 mb-1">
                  {{ related.title }}
                </h4>
                <p class="text-xs text-text-muted">
                  {{ related.authors?.[0]
                  }}{{ related.authors?.length > 1 ? " et al." : "" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Use no layout
definePageMeta({
  layout: false,
});

// Get route params
const route = useRoute();
const paperId = route.params.id;

// State
const paper = ref(null);
const relatedPapers = ref([]);
const loading = ref(true);
const error = ref("");

// Methods
const loadPaper = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await $fetch(`/api/arxiv-paper/${paperId}`);
    paper.value = response.data;

    // Load related papers (you can implement this based on your backend)
    // For now, we'll leave it empty
    relatedPapers.value = [];
  } catch (err) {
    error.value = err.message || "Failed to load paper";
  } finally {
    loading.value = false;
  }
};

const openArxivLink = (arxivId) => {
  window.open(`https://arxiv.org/abs/${arxivId}`, "_blank");
};

const downloadPdf = (arxivId) => {
  window.open(`https://arxiv.org/pdf/${arxivId}.pdf`, "_blank");
};

const shareLink = async () => {
  try {
    await navigator.share({
      title: paper.value?.title,
      text: paper.value?.abstract?.substring(0, 200) + "...",
      url: window.location.href,
    });
  } catch (err) {
    // Fallback to clipboard
    await navigator.clipboard.writeText(window.location.href);
    // You could show a toast notification here
  }
};

const navigateToPaper = (id) => {
  navigateTo(`/paper/${id}`);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Load paper on mount
onMounted(() => {
  loadPaper();
});

// Set page title
useHead({
  title: computed(() =>
    paper.value?.title
      ? `${paper.value.title} - SciFind`
      : "Paper Details - SciFind"
  ),
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  max-width: none;
}
</style>
