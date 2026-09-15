import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { activityLogsService } from '@/services/dashboard.service'

const defaultFilters = () => ({
  search: '',
  log_name: '',
  event: '',
  per_page: 15,
  page: 1,
})

const emptyMeta = () => ({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
  from: null,
  to: null,
})

/**
 * Historial de auditoría generado por Spatie Activity Log.
 */
export const useActivityLogsStore = defineStore('activity-logs', () => {
  const items = ref([])
  const meta = ref(emptyMeta())
  const filters = reactive(defaultFilters())
  const loading = ref(false)
  const error = ref(null)

  const isEmpty = computed(() => !loading.value && items.value.length === 0)

  async function fetchLogs(overrides = {}) {
    Object.assign(filters, overrides)
    loading.value = true
    error.value = null

    try {
      const response = await activityLogsService.list(filters)

      items.value = response.data ?? []
      meta.value = { ...emptyMeta(), ...(response.meta ?? {}) }
    } catch (err) {
      error.value = err
      items.value = []
      meta.value = emptyMeta()
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    Object.assign(filters, defaultFilters())
  }

  return { items, meta, filters, loading, error, isEmpty, fetchLogs, resetFilters }
})

export default useActivityLogsStore