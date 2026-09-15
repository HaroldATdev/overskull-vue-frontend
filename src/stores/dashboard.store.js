import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { dashboardService } from '@/services/dashboard.service'

/**
 * Indicadores del dashboard.
 */
export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref(null)
  const productsPerCategory = ref([])
  const latestProducts = ref([])
  const recentActivities = ref([])
  const loading = ref(false)
  const error = ref(null)
  const loadedAt = ref(null)

  const inventoryValue = computed(() => summary.value?.inventory_value ?? 0)
  const lowStockThreshold = computed(() => summary.value?.low_stock_threshold ?? 10)

  async function fetchStats() {
    loading.value = true
    error.value = null

    try {
      const response = await dashboardService.stats()
      const data = response.data ?? {}

      summary.value = data.summary ?? null
      productsPerCategory.value = data.products_per_category ?? []
      latestProducts.value = data.latest_products ?? []
      recentActivities.value = data.recent_activities ?? []
      loadedAt.value = new Date().toISOString()
    } catch (err) {
      error.value = err
      summary.value = null
      productsPerCategory.value = []
      latestProducts.value = []
      recentActivities.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    productsPerCategory,
    latestProducts,
    recentActivities,
    loading,
    error,
    loadedAt,
    inventoryValue,
    lowStockThreshold,
    fetchStats,
  }
})

export default useDashboardStore