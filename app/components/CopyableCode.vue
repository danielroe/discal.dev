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
  <div class="group relative flex items-start">
    <code class="code-block pr-12 flex-1">{{ value }}</code>
    <button
      type="button"
      class="btn-icon absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      :aria-label="copied ? 'Copied!' : 'Copy to clipboard'"
      @click="copy(value)"
    >
      <!-- Check icon when copied -->
      <svg
        v-if="copied"
        class="size-4 text-success"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <!-- Copy icon -->
      <svg
        v-else
        class="size-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
      </svg>
    </button>
  </div>
</template>
