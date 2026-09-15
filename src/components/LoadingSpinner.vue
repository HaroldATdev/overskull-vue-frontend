<script setup>
const props = defineProps({
  size: { type: String, default: 'md' },
  label: { type: String, default: 'Cargando...' },
})

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
}
</script>

<template>
  <span class="inline-flex items-center gap-2 text-slate-500" role="status">
    <svg
      class="animate-spin text-brand-500"
      :class="sizes[props.size] ?? sizes.md"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span v-if="label" class="text-sm">{{ label }}</span>
  </span>
</template>