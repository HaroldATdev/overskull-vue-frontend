<script setup>
import { computed } from 'vue'

const props = defineProps({
  meta: {
    type: Object,
    default: () => ({ current_page: 1, last_page: 1, total: 0, from: null, to: null, per_page: 15 }),
  },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['change'])

const currentPage = computed(() => props.meta.current_page ?? 1)
const lastPage = computed(() => Math.max(props.meta.last_page ?? 1, 1))

/**
 * Ventana de páginas visibles (máximo 5 botones) alrededor de la actual.
 */
const pages = computed(() => {
  const total = lastPage.value
  const start = Math.max(1, Math.min(currentPage.value - 2, total - 4))
  const end = Math.min(total, start + 4)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const goTo = (page) => {
  if (props.disabled || page < 1 || page > lastPage.value || page === currentPage.value) {
    return
  }

  emit('change', page)
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
    <p class="text-sm text-slate-500">
      Mostrando <span class="font-semibold text-slate-700">{{ meta.from ?? 0 }}</span> –
      <span class="font-semibold text-slate-700">{{ meta.to ?? 0 }}</span> de
      <span class="font-semibold text-slate-700">{{ meta.total ?? 0 }}</span> registros
    </p>

    <div class="flex items-center gap-1">
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled || currentPage <= 1"
        @click="goTo(currentPage - 1)"
      >
        Anterior
      </button>

      <button
        v-for="page in pages"
        :key="page"
        type="button"
        class="min-w-9 rounded-lg border px-2 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed"
        :class="
          page === currentPage
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
        "
        :disabled="disabled"
        @click="goTo(page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled || currentPage >= lastPage"
        @click="goTo(currentPage + 1)"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>