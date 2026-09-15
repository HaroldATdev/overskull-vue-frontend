<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '—' },
  hint: { type: String, default: '' },
  icon: { type: String, default: '' },
  tone: { type: String, default: 'default' },
  loading: { type: Boolean, default: false },
})

const tones = {
  default: 'bg-white text-slate-900',
  brand: 'bg-brand-50 text-brand-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  success: 'bg-emerald-50 text-emerald-700',
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 p-4 shadow-sm" :class="tones[props.tone] ?? tones.default">
    <div class="flex items-center justify-between gap-2">
      <p class="text-xs font-semibold tracking-wide uppercase opacity-70">{{ label }}</p>
      <span v-if="icon" aria-hidden="true" class="text-lg">{{ icon }}</span>
    </div>

    <div class="mt-2">
      <LoadingSpinner v-if="loading" size="sm" label="" />
      <p v-else class="text-2xl font-bold">{{ value }}</p>
    </div>

    <p v-if="hint" class="mt-1 text-xs opacity-70">{{ hint }}</p>
  </div>
</template>