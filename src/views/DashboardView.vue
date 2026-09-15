<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import StatCard from '@/components/StatCard.vue'

import { useDashboardStore } from '@/stores/dashboard.store'
import { EVENT_STYLES, ROUTE_NAMES } from '@/utils/constants'
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/formatters'

const dashboard = useDashboardStore()
const { summary, productsPerCategory, latestProducts, recentActivities, loading, error } = storeToRefs(dashboard)

onMounted(() => dashboard.fetchStats())

const maxProductsPerCategory = computed(() =>
  Math.max(...productsPerCategory.value.map((category) => category.products_count ?? 0), 1),
)

const barWidth = (count) => `${Math.round(((count ?? 0) / maxProductsPerCategory.value) * 100)}%`

const eventStyle = (event) => EVENT_STYLES[event] ?? { label: event, classes: 'bg-slate-100 text-slate-600' }

const loadingFirstPaint = computed(() => loading.value && summary.value === null)
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="error"
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
    >
      <p>{{ error.message }}</p>
      <button type="button" class="font-semibold underline" @click="dashboard.fetchStats()">Reintentar</button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Productos"
        :value="formatNumber(summary?.products_total)"
        :hint="`${summary?.products_active ?? 0} activos`"
        icon="📦"
        :loading="loadingFirstPaint"
      />
      <StatCard
        label="Stock bajo"
        :value="formatNumber(summary?.products_low_stock)"
        :hint="`Umbral: ≤ ${dashboard.lowStockThreshold} unidades`"
        icon="⚠️"
        tone="warning"
        :loading="loadingFirstPaint"
      />
      <StatCard
        label="Categorías"
        :value="formatNumber(summary?.categories_total)"
        :hint="`${summary?.categories_active ?? 0} activas`"
        icon="◈"
        tone="brand"
        :loading="loadingFirstPaint"
      />
      <StatCard
        label="Valor del inventario"
        :value="formatCurrency(summary?.inventory_value)"
        hint="Precio × stock"
        icon="💰"
        tone="success"
        :loading="loadingFirstPaint"
      />
    </div>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header class="mb-4 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900">Productos por categoría</h2>
        <RouterLink :to="{ name: ROUTE_NAMES.categories }" class="text-xs font-semibold text-brand-600 hover:underline">
          Ver categorías
        </RouterLink>
      </header>

      <LoadingSpinner v-if="loading && productsPerCategory.length === 0" label="Cargando indicadores..." />
      <ul v-else-if="productsPerCategory.length" class="space-y-3">
        <li v-for="category in productsPerCategory" :key="category.id">
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium text-slate-700">{{ category.name }}</span>
            <span class="text-slate-500">{{ category.products_count }} producto(s)</span>
          </div>
          <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-brand-500" :style="{ width: barWidth(category.products_count) }" />
          </div>
        </li>
      </ul>
      <EmptyState v-else title="Sin categorías" message="Registre categorías para ver la distribución del catálogo." />
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header class="mb-4 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900">Últimos productos registrados</h2>
        <RouterLink :to="{ name: ROUTE_NAMES.products }" class="text-xs font-semibold text-brand-600 hover:underline">
          Ver productos
        </RouterLink>
      </header>

      <LoadingSpinner v-if="loading && latestProducts.length === 0" label="Cargando productos..." />
      <div v-else-if="latestProducts.length" class="overflow-x-auto rounded-xl border border-slate-200">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th class="px-3 py-2">Producto</th>
              <th class="px-3 py-2">Categoría</th>
              <th class="px-3 py-2 text-right">Precio</th>
              <th class="px-3 py-2 text-right">Stock</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="product in latestProducts" :key="product.id">
              <td class="px-3 py-2 font-medium text-slate-700">{{ product.name }}</td>
              <td class="px-3 py-2 text-slate-500">{{ product.category?.name ?? '—' }}</td>
              <td class="px-3 py-2 text-right text-slate-700">{{ formatCurrency(product.price) }}</td>
              <td class="px-3 py-2 text-right">
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="product.low_stock ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'"
                >
                  {{ product.stock }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-else title="Sin productos" message="Aún no hay productos registrados en el catálogo." />
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header class="mb-2 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900">Actividad reciente (auditoría)</h2>
        <RouterLink :to="{ name: ROUTE_NAMES.activityLogs }" class="text-xs font-semibold text-brand-600 hover:underline">
          Ver historial completo
        </RouterLink>
      </header>

      <LoadingSpinner v-if="loading && recentActivities.length === 0" label="Cargando actividad..." />
      <ul v-else-if="recentActivities.length" class="divide-y divide-slate-100">
        <li v-for="activity in recentActivities" :key="activity.id" class="flex flex-wrap items-center gap-2 py-2 text-sm">
          <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="eventStyle(activity.event).classes">
            {{ eventStyle(activity.event).label }}
          </span>
          <span class="text-slate-700">{{ activity.description }}</span>
          <span class="ml-auto text-xs text-slate-400">{{ formatDateTime(activity.created_at) }}</span>
        </li>
      </ul>
      <EmptyState v-else title="Sin actividad" message="Las acciones sobre productos y categorías aparecerán aquí." />
    </section>
  </div>
</template>