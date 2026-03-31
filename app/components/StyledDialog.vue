<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'

defineProps<{
  title: string
  description?: string
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 motion-safe:animate-fade-in" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 bg-surface border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md motion-safe:animate-slide-up">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <DialogTitle class="heading-3">
              {{ title }}
            </DialogTitle>
            <DialogDescription
              v-if="description"
              class="text-sm text-text-muted mt-1"
            >
              {{ description }}
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <button
              type="button"
              class="shrink-0 p-1 rounded-full text-text-muted hover:text-text hover:bg-surface-raised transition-all hover:rotate-90 cursor-pointer"
              aria-label="Close"
            >
              <span class="i-heroicons-x-mark-20-solid w-5 h-5" />
            </button>
          </DialogClose>
        </div>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
