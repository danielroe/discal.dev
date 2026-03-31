<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  showMascot?: boolean
}>(), {
  showMascot: true,
})
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center py-16 gap-4">
    <DiscalLogo
      v-if="showMascot"
      size="lg"
      class="motion-safe:animate-float"
    />
    <h3 class="heading-3 text-text-muted">
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="text-sm text-text-muted max-w-sm"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.action"
      class="mt-2"
    >
      <slot name="action" />
    </div>
  </div>
</template>
