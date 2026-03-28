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

const variantClasses: Record<string, string> = {
  text: 'skeleton-text',
  heading: 'skeleton-heading',
  card: 'skeleton-card',
  circle: 'skeleton rounded-full size-10',
  custom: 'skeleton',
}
</script>

<template>
  <div
    v-if="lines > 1"
    class="flex flex-col gap-2.5"
  >
    <div
      v-for="i in lines"
      :key="i"
      :class="variantClasses[variant]"
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
    :class="variantClasses[variant]"
    :style="{ width, height }"
    role="presentation"
    aria-hidden="true"
  />
</template>
