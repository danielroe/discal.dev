<script setup lang="ts">
const props = withDefaults(defineProps<{
  interactive?: boolean
  highlight?: boolean
  padding?: 'sm' | 'md' | 'lg'
}>(), {
  interactive: false,
  highlight: false,
  padding: 'md',
})

const paddingClass: Record<string, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

const classes = computed(() => [
  props.highlight ? 'card-highlight' : 'card',
  props.interactive ? 'hover:-translate-y-0.5 hover:shadow-lg hover:border-border-emphasis cursor-pointer' : '',
  paddingClass[props.padding],
])
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
