<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxViewport,
} from 'reka-ui'

const model = defineModel<string>({ required: true })

const timezones = Intl.supportedValuesOf('timeZone')
const search = ref('')

const filtered = computed(() => {
  if (!search.value) return timezones
  const q = search.value.toLowerCase()
  return timezones.filter(tz => tz.toLowerCase().includes(q))
})
</script>

<template>
  <ComboboxRoot
    v-model="model"
    v-model:search-term="search"
    class="relative"
  >
    <ComboboxAnchor class="w-full">
      <ComboboxInput
        class="input-base"
        placeholder="search timezones..."
      />
    </ComboboxAnchor>
    <ComboboxPortal>
      <ComboboxContent
        position="popper"
        class="z-50 mt-1 max-h-60 w-[var(--reka-combobox-trigger-width)] overflow-hidden rounded-lg border border-border bg-surface shadow-xl"
      >
        <ComboboxViewport class="p-1 max-h-60 overflow-y-auto">
          <ComboboxEmpty class="px-3 py-2 text-sm text-text-muted font-mono">
            no timezones found
          </ComboboxEmpty>
          <ComboboxItem
            v-for="tz in filtered"
            :key="tz"
            :value="tz"
            class="relative flex items-center rounded-md px-3 py-1.5 text-sm font-mono cursor-pointer select-none text-text data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary data-[state=checked]:font-bold data-[state=checked]:text-primary"
          >
            {{ tz }}
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
