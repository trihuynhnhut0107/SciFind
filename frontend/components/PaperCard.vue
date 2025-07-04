<template>
  <!-- Individual Paper Card -->
  <div
    class="bg-white rounded-lg border border-border hover:border-primary transition-colors p-6">
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-lg font-semibold text-text-main line-clamp-2">
        {{ paper.title }}
      </h3>
      <div class="text-sm text-text-muted ml-4 flex-shrink-0">
        {{ formatDate(paper.update_date || paper.published) }}
      </div>
    </div>

    <div class="text-text-secondary mb-3">
      <span
        v-for="(author, index) in getFormattedAuthors(paper.authors)?.slice(
          0,
          3
        )"
        :key="index">
        {{ author
        }}{{
          index < Math.min(getFormattedAuthors(paper.authors)?.length - 1, 2)
            ? ", "
            : ""
        }}
      </span>
      <span
        v-if="getFormattedAuthors(paper.authors)?.length > 3"
        class="text-text-muted">
        and {{ getFormattedAuthors(paper.authors).length - 3 }} others
      </span>
    </div>

    <p
      class="text-text-secondary mb-4"
      :class="{ 'line-clamp-3': !showFullAbstract }">
      {{ paper.abstract }}
    </p>
    <button
      v-if="paper.abstract && paper.abstract.length > 0"
      class="text-primary text-xs underline mb-2 hover:cursor-pointer focus:outline-none"
      @click="showFullAbstract = !showFullAbstract"
      type="button">
      {{ showFullAbstract ? "Show less" : "Show more" }}
    </button>

    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center space-x-4">
        <span
          v-if="paper.categories"
          class="px-2 py-1 bg-bg-highlight text-primary text-sm rounded-full">
          {{ paper.categories }}
        </span>
        <span v-if="paper.id" class="text-sm text-text-muted">
          arXiv: {{ paper.id }}
        </span>
      </div>

      <div class="flex items-center space-x-2">
        <span
          v-if="searchType === 'enhanced' && paper.combinedScore"
          class="text-xs text-text-muted bg-bg-main px-2 py-1 rounded">
          Score: {{ (paper.combinedScore * 100).toFixed(0) }}%
        </span>

        <!-- ArXiv Material Buttons -->
        <div class="flex items-center space-x-1">
          <Button
            @click="$emit('abstractClick', paper.id)"
            :content="'📄 Abstract'"
            :custom-class="'px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-xs'"
            title="View Abstract on arXiv" />
          <Button
            @click="$emit('pdfClick', paper.id)"
            :content="'📋 PDF'"
            :custom-class="'px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-xs'"
            title="View PDF from arXiv" />
          <Button
            @click="$emit('sourceClick', paper.id)"
            :content="'💾 Source'"
            :custom-class="'px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-xs'"
            title="Download source files (if available) - This will download files to your computer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const showFullAbstract = ref(false);
// Props
const props = defineProps({
  paper: {
    type: Object,
    required: true,
  },
  searchType: {
    type: String,
    required: true,
  },
});

// Emits
defineEmits(["abstractClick", "pdfClick", "sourceClick"]);

// Methods
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getFormattedAuthors = (authors) => {
  if (!authors) return [];

  // Handle new API format: [["Gartner", "Florian M.", ""], ["Frey", "Erwin", ""]]
  if (
    Array.isArray(authors) &&
    authors.length > 0 &&
    Array.isArray(authors[0])
  ) {
    return authors.map((author) => {
      if (Array.isArray(author)) {
        // Join first name and last name, filter out empty strings
        return author.filter((part) => part && part.trim()).join(" ");
      }
      return author;
    });
  }

  // Handle old format (simple string array)
  return authors;
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
