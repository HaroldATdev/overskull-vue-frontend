import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import productsService, { toProductPayload } from '@/services/products.service'
import { useToastStore } from '@/stores/toasts.store'
import { ApiError, toFieldErrors } from '@/utils/errorHandler'

const defaultFilters = () => ({
  search: '',
  category_id: '',
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
 * Estado y acciones del módulo de productos.
 */
export const useProductsStore = defineStore('products', () => {
  const items = ref([])
  const meta = ref(emptyMeta())
  const filters = reactive(defaultFilters())
  const current = ref(null)

  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const fieldErrors = ref({})

  const isEmpty = computed(() => !loading.value && items.value.length === 0)
  const lastPage = computed(() => meta.value.last_page ?? 1)

  const setFieldError = (field, message) => {
    fieldErrors.value = { ...fieldErrors.value, [field]: message }
  }

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

  async function fetchProducts(overrides = {}) {
    Object.assign(filters, overrides)
    loading.value = true
    error.value = null

    try {
      const response = await productsService.list(filters)

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

  async function fetchProduct(id) {
    loading.value = true
    error.value = null

    try {
      const response = await productsService.show(id)
      current.value = response.data

      return current.value
    } catch (err) {
      error.value = err
      current.value = null

      return null
    } finally {
      loading.value = false
    }
  }

  async function saveProduct(form, id = null) {
    saving.value = true
    error.value = null
    clearFieldErrors()

    try {
      const response = id
        ? await productsService.update(id, toProductPayload(form))
        : await productsService.create(toProductPayload(form))

      useToastStore().success(response.message)

      current.value = response.data

      return { success: true, data: response.data }
    } catch (err) {
      handleApiError(err)

      return { success: false, error: err }
    } finally {
      saving.value = false
    }
  }

  async function deleteProduct(product) {
    try {
      const response = await productsService.remove(product.id)

      useToastStore().success(response.message)

      // Si era el último registro de la página, retrocedemos una página.
      const nextPage = items.value.length === 1 && filters.page > 1 ? filters.page - 1 : filters.page
      await fetchProducts({ page: nextPage })

      return true
    } catch (err) {
      // El mensaje ya fue notificado por el interceptor global.
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
    current,
    loading,
    saving,
    error,
    fieldErrors,
    isEmpty,
    lastPage,
    setFieldError,
    clearFieldErrors,
    fetchProducts,
    fetchProduct,
    saveProduct,
    deleteProduct,
    resetFilters,
  }
})

export default useProductsStore