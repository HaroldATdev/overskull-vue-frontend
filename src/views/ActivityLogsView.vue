<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import EmptyState from '@/components/EmptyState.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationControls from '@/components/PaginationControls.vue'

import { useActivityLogsStore } from '@/stores/activityLogs.store'
import { EVENT_OPTIONS, EVENT_STYLES, LOG_NAME_OPTIONS, PER_PAGE_OPTIONS } from '@/utils/constants'
import { formatDateTime } from '@/utils/formatters'

const activityLogs = useActivityLogsStore()
const { items, meta, filters, loading, error, isEmpty } = storeToRefs(activityLogs)

const showProperties = ref(null)
let searchTimer = null

onMounted(() => activityLogs.fetchLogs())

const onSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => activityLogs.fetchLogs({ search: filters.value.search, page: 1 }), 400)
}

const applyFilter = (key, value) => activityLogs.fetchLogs({ [key]: value, page: 1 })
const goToPage = (page) => activityLogs.fetchLogs({ page })

const eventStyle = (event) => EVENT_STYLES[event] ?? { label: event, classes: 'bg-slate-100 text-slate-600' }

const logLabel = (logName) =>
  LOG_NAME_OPTIONS.find((option) => option.value === logName)?.label ?? logName

/**
 * Resumen legible de los atributos modificados (properties de Spatie).
 */
const changedAttributes = (activity) => {
  const attributes = activity.properties?.attributes ?? {}

  return Object.keys(attributes)
}

const toggleProperties = (id) => {
  showProperties.value = showProperties.value === id ? null : id
}

const clearFilters = async () => {
  activityLogs.resetFilters()
  await activityLogs.fetchLogs()
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="error"
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
    >
      <p>{{ error.message }}</p>
      <button type="button" class="font-semibold underline" @click="activityLogs.fetchLogs()">Reintentar</button>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div class="xl:col-span-2">
          <label for="audit-search" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">Buscar</label>
          <input
            id="audit-search"
            v-model="filters.search"
            type="search"
            placeholder="Descripcion, modelo o evento..."
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @input="onSearchInput"
          />
        </div>

        <div>
          <label for="audit-filter-log" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">Modulo</label>
          <select
            id="audit-filter-log"
            v-model="filters.log_name"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @change="applyFilter('log_name', filters.log_name)"
          >
            <option v-for="option in LOG_NAME_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div>
          <label for="audit-filter-event" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">Evento</label>
          <select
            id="audit-filter-event"
            v-model="filters.event"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @change="applyFilter('event', filters.event)"
          >
            <option v-for="option in EVENT_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div>
          <label for="audit-filter-per-page" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">Por pagina</label>
          <select
            id="audit-filter-per-page"
            v-model="filters.per_page"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @change="applyFilter('per_page', filters.per_page)"
          >
            <option v-for="size in PER_PAGE_OPTIONS" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p class="text-xs text-slate-500">{{ meta.total }} accion(es) registradas</p>
        <button
          v-if="filters.search || filters.log_name || filters.event"
          type="button"
          class="text-xs font-semibold text-brand-600 underline"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <LoadingSpinner v-if="loading && items.length === 0" label="Cargando historial..." />

      <EmptyState
        v-else-if="isEmpty"
        title="Sin actividad registrada"
        message="Las acciones de creacion, actualizacion y eliminacion apareceran aqui."
      />

      <template v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th class="px-4 py-3">Accion</th>
                <th class="px-4 py-3">Modulo</th>
                <th class="px-4 py-3">Evento</th>
                <th class="px-4 py-3">Cambios</th>
                <th class="px-4 py-3 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template v-for="activity in items" :key="activity.id">
                <tr class="transition hover:bg-slate-50">
                  <td class="px-4 py-3">
                    <p class="font-medium text-slate-800">{{ activity.description }}</p>
                    <p class="text-xs text-slate-400">
                      {{ activity.subject_type ?? '-' }} #{{ activity.subject_id ?? '-' }} · {{ activity.causer ?? 'Sistema' }}
                    </p>
                  </td>
                  <td class="px-4 py-3">
                    <span class="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                      {{ logLabel(activity.log_name) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="eventStyle(activity.event).classes">
                      {{ eventStyle(activity.event).label }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <button
                      v-if="changedAttributes(activity).length"
                      type="button"
                      class="text-xs font-semibold text-brand-600 underline"
                      @click="toggleProperties(activity.id)"
                    >
                      {{ showProperties === activity.id ? 'Ocultar detalle' : 'Ver campos' }}
                    </button>
                    <span v-else class="text-xs text-slate-400">-</span>
                  </td>
                  <td class="px-4 py-3 text-right text-xs whitespace-nowrap text-slate-500">
                    {{ formatDateTime(activity.created_at) }}
                  </td>
                </tr>
                <tr v-if="showProperties === activity.id" :key="`detail-${activity.id}`" class="bg-slate-50">
                  <td colspan="5" class="px-4 py-3">
                    <pre class="max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">{{ JSON.stringify(activity.properties ?? {}, null, 2) }}</pre>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <PaginationControls :meta="meta" :disabled="loading" @change="goToPage" />
      </template>
    </div>
  </div>
</template>


