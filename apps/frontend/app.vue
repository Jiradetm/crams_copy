<script setup lang="ts">
const route = useRoute()

// Check if current route is auth page
const isAuthPage = computed(() => route.path.startsWith('/auth'))
</script>

<template>
  <div>
    <NuxtPage v-if="isAuthPage" />
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
