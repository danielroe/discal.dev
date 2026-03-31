<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'text' | 'heading' | 'card' | 'circle' | 'custom'
  lines?: number
  width?: string
  height?: string
}>(), {
  variant: 'text',
  lines: 1,
})

const variantClass: Record<string, string> = {
  text: 'h-4 rounded',
  heading: 'h-8 w-48 rounded-lg',
  card: 'h-32 rounded-xl skeleton-card skeleton-sparkles',
  circle: 'rounded-full',
  custom: 'rounded',
}
</script>

<template>
  <div
    v-if="lines > 1"
    class="flex flex-col gap-3"
  >
    <div
      v-for="i in lines"
      :key="i"
      class="skeleton skeleton-shimmer"
      :class="variantClass[variant]"
      :style="{
        width: i === lines ? '70%' : width,
        height,
      }"
      role="presentation"
      aria-hidden="true"
    />
  </div>
  <div
    v-else
    class="skeleton"
    :class="[
      variantClass[variant],
      variant !== 'card' ? 'skeleton-shimmer' : '',
    ]"
    :style="{ width, height }"
    role="presentation"
    aria-hidden="true"
  />
</template>
