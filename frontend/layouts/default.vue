<template>
  <div class="min-h-screen bg-bg-main">
    <!-- Simple Header -->
    <header class="bg-white shadow-sm border-b border-accent">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <nav class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink
            to="/"
            class="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <svg
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span class="text-2xl font-bold">SciFind</span>
          </NuxtLink>

          <!-- Navigation -->
          <div class="flex items-center space-x-6">
            <NuxtLink
              to="/"
              class="text-text-secondary hover:text-primary transition-colors">
              Home
            </NuxtLink>
            <NuxtLink
              to="/search"
              class="text-text-secondary hover:text-primary transition-colors">
              Search
            </NuxtLink>
            <button
              class="text-text-secondary hover:text-primary transition-colors">
              About
            </button>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-accent mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="text-center text-text-muted">
          <p>&copy; 2025 SciFind. AI-Enhanced Scientific Paper Discovery.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Simple layout script - no complex logic needed
</script>

<style scoped>
/* Simple layout styles */
button {
  transition: all 0.3s ease;
}
</style>
