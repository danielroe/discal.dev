<script setup lang="ts">
withDefaults(defineProps<{
  interactive?: boolean
  highlight?: boolean
  padding?: 'sm' | 'md' | 'lg'
}>(), {
  interactive: false,
  highlight: false,
  padding: 'md',
})

const paddingClasses: Record<string, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6 sm:p-8',
}
</script>

<template>
  <div
    :class="[
      interactive ? 'card-interactive' : highlight ? 'card-highlight' : 'card',
      paddingClasses[padding],
    ]"
  >
    <slot />
  </div>
</template>
