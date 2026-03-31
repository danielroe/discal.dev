<script setup lang="ts">
defineProps<{
  value: string
}>()

const copied = ref(false)
let timeout: ReturnType<typeof setTimeout> | undefined

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    // Fallback: no-op
  }
}
</script>

<template>
  <div class="flex items-center gap-2 bg-code-bg rounded-lg px-4 py-2.5 border border-border">
    <code class="font-mono text-sm text-code-text flex-1 truncate">{{ value }}</code>
    <button
      type="button"
      class="shrink-0 p-1.5 rounded-md text-code-text/60 hover:text-code-text transition-colors cursor-pointer"
      :aria-label="copied ? 'Copied!' : 'Copy to clipboard'"
      @click="copy(value)"
    >
      <span
        v-if="copied"
        class="i-heroicons-check-20-solid w-4 h-4 text-success motion-safe:animate-[check-bounce_0.35s_cubic-bezier(0.34,1.56,0.64,1)]"
      />
      <span
        v-else
        class="i-heroicons-clipboard-document-20-solid w-4 h-4"
      />
    </button>
  </div>
</template>
