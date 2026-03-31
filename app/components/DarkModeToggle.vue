<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button
    type="button"
    class="w-9 h-9 grid place-items-center rounded-full transition-colors cursor-pointer hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <span
      class="i-heroicons-sun-20-solid w-5 h-5 text-pop dark:inline-block hidden"
    />
    <span
      class="i-heroicons-moon-20-solid w-5 h-5 text-accent dark:hidden inline-block"
    />
  </button>
</template>
