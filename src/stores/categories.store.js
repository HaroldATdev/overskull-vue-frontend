import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import categoriesService, { toCategoryPayload } from '@/services/categories.service'
import { useToastStore } from '@/stores/toasts.store'
import { ApiError, toFieldErrors } from '@/utils/errorHandler'

const defaultFilters = () => ({
  search: '',
  is_active: '',
  sort_by: 'created_at',
  sort_direction: 'desc',
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
 * Estado y acciones del módulo de categorías.
 */
export const useCategoriesStore = defineStore('categories', () => {
  const items = ref([])
  const meta = ref(emptyMeta())
  const filters = reactive(defaultFilters())
  const options = ref([])

  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const fieldErrors = ref({})

  const isEmpty = computed(() => !loading.value && items.value.length === 0)

  const clearFieldErrors = () => {
    fieldErrors.value = {}
  }

  const handleApiError = (err) => {
    error.value = err
    clearFieldErrors()

    if (err instanceof ApiError && err.isValidationError) {
      fieldErrors.value = toFieldErrors(err)
    }
  }

  async function fetchCategories(overrides = {}) {
    Object.assign(filters, overrides)
    loading.value = true
    error.value = null

    try {
      const response = await categoriesService.list(filters)

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

  /**
   * Categorías para los selectores de formularios.
   */
  async function fetchOptions() {
    try {
      const response = await categoriesService.options()
      options.value = response.data ?? []

      return options.value
    } catch (err) {
      error.value = err
      options.value = []

      return []
    }
  }

  async function saveCategory(form, id = null) {
    saving.value = true
    error.value = null
    clearFieldErrors()

    try {
      const response = id
        ? await categoriesService.update(id, toCategoryPayload(form))
        : await categoriesService.create(toCategoryPayload(form))

      useToastStore().success(response.message)

      await Promise.all([fetchCategories(), fetchOptions()])

      return { success: true, data: response.data }
    } catch (err) {
      handleApiError(err)

      return { success: false, error: err }
    } finally {
      saving.value = false
    }
  }

  async function deleteCategory(category) {
    try {
      const response = await categoriesService.remove(category.id)

      useToastStore().success(response.message)

      const nextPage = items.value.length === 1 && filters.page > 1 ? filters.page - 1 : filters.page
      await Promise.all([fetchCategories({ page: nextPage }), fetchOptions()])

      return true
    } catch (err) {
      // La regla de negocio (409) ya fue notificada por el interceptor global.
      error.value = err

      return false
    }
  }

  function resetFilters() {
    Object.assign(filters, defaultFilters())
  }

  return {
    items,
    meta,
    filters,
    options,
    loading,
    saving,
    error,
    fieldErrors,
    isEmpty,
    clearFieldErrors,
    fetchCategories,
    fetchOptions,
    saveCategory,
    deleteCategory,
    resetFilters,
  }
})

export default useCategoriesStore