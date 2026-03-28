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
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <DiscalLogo
      v-if="showMascot"
      size="lg"
      class="mb-6 opacity-60"
    />
    <h3 class="heading-3 mb-2">
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="text-body max-w-sm"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.action"
      class="mt-6"
    >
      <slot name="action" />
    </div>
  </div>
</template>
