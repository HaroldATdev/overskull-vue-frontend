<script setup>
defineProps({
  title: { type: String, default: 'Sin resultados' },
  message: { type: String, default: 'No se encontraron registros para mostrar.' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
    <span aria-hidden="true" class="text-2xl">🗂️</span>
    <p class="text-base font-semibold text-slate-700">{{ title }}</p>
    <p class="max-w-md text-sm text-slate-500">{{ message }}</p>
    <div class="mt-2">
      <slot name="actions" />
    </div>
  </div>
</template>