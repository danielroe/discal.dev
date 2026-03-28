<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  href?: string
  to?: string
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
})

const variantClasses: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

const sizeClasses: Record<string, string> = {
  sm: 'btn-sm',
  md: '', // default size is baked into variant shortcuts
  lg: 'btn-lg',
}
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="[variantClasses[variant], sizeClasses[size]]"
    :aria-disabled="disabled || loading"
  >
    <span
      v-if="loading"
      class="size-4 border-2 border-current border-t-transparent rounded-full animate-spin-slow"
    />
    <slot />
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :class="[variantClasses[variant], sizeClasses[size]]"
    :aria-disabled="disabled || loading"
  >
    <span
      v-if="loading"
      class="size-4 border-2 border-current border-t-transparent rounded-full animate-spin-slow"
    />
    <slot />
  </a>
  <button
    v-else
    type="button"
    :disabled="disabled || loading"
    :class="[variantClasses[variant], sizeClasses[size]]"
  >
    <span
      v-if="loading"
      class="size-4 border-2 border-current border-t-transparent rounded-full animate-spin-slow"
    />
    <slot />
  </button>
</template>
