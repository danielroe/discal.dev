<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  href?: string
  to?: string
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
})

const variantClass: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

const sizeClass: Record<string, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

const classes = computed(() => [
  variantClass[props.variant],
  sizeClass[props.size],
])
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="classes"
    :aria-disabled="disabled || loading"
  >
    <span
      v-if="loading"
      class="loading-spinner"
    />
    <slot />
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :class="classes"
    :aria-disabled="disabled || loading"
  >
    <span
      v-if="loading"
      class="loading-spinner"
    />
    <slot />
  </a>
  <button
    v-else
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
  >
    <span
      v-if="loading"
      class="loading-spinner"
    />
    <slot />
  </button>
</template>
