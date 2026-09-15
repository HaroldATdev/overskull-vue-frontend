<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationControls from '@/components/PaginationControls.vue'

import { useCategoriesStore } from '@/stores/categories.store'
import { useProductsStore } from '@/stores/products.store'
import { PER_PAGE_OPTIONS, PRODUCT_SORT_OPTIONS, ROUTE_NAMES, STATUS_OPTIONS } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatters'

const router = useRouter()
const products = useProductsStore()
const categories = useCategoriesStore()

const { items, meta, filters, loading, error, isEmpty } = storeToRefs(products)
const { options: categoryOptions } = storeToRefs(categories)

const productToDelete = ref(null)
const deleting = ref(false)
let searchTimer = null

onMounted(async () => {
  await Promise.all([products.fetchProducts(), categories.fetchOptions()])
})

/**
 * Búsqueda con retardo (debounce) para no saturar la API en cada tecla.
 */
const onSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => products.fetchProducts({ search: filters.value.search, page: 1 }), 400)
}

const applyFilter = (key, value) => products.fetchProducts({ [key]: value, page: 1 })

const goToPage = (page) => products.fetchProducts({ page })

const clearFilters = async () => {
  products.resetFilters()
  await products.fetchProducts()
}

const hasActiveFilters = computed(
  () => Boolean(filters.value.search || filters.value.category_id || filters.value.is_active),
)

const goToCreate = () => router.push({ name: ROUTE_NAMES.productCreate })
const goToEdit = (product) => router.push({ name: ROUTE_NAMES.productEdit, params: { id: product.id } })

const askDelete = (product) => {
  productToDelete.value = product
}

const confirmDelete = async () => {
  if (!productToDelete.value) {
    return
  }

  deleting.value = true
  await products.deleteProduct(productToDelete.value)
  deleting.value = false
  productToDelete.value = null
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="error"
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
    >
      <p>{{ error.message }}</p>
      <button type="button" class="font-semibold underline" @click="products.fetchProducts()">Reintentar</button>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div class="xl:col-span-2">
          <label for="product-search" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">Buscar</label>
          <input
            id="product-search"
            v-model="filters.search"
            type="search"
            placeholder="Nombre o descripción..."
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @input="onSearchInput"
          />
        </div>

        <div>
          <label for="product-filter-category" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">
            Categoría
          </label>
          <select
            id="product-filter-category"
            v-model="filters.category_id"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @change="applyFilter('category_id', filters.category_id)"
          >
            <option value="">Todas</option>
            <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="product-filter-status" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">
            Estado
          </label>
          <select
            id="product-filter-status"
            v-model="filters.is_active"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @change="applyFilter('is_active', filters.is_active)"
          >
            <option v-for="status in STATUS_OPTIONS" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>

        <div>
          <label for="product-filter-sort" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">
            Ordenar por
          </label>
          <select
            id="product-filter-sort"
            v-model="filters.sort_by"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @change="applyFilter('sort_by', filters.sort_by)"
          >
            <option v-for="option in PRODUCT_SORT_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{{ meta.total }} producto(s) encontrados</span>
          <label class="flex items-center gap-1">
            Mostrar
            <select
              v-model="filters.per_page"
              class="rounded border border-slate-300 bg-white px-1.5 py-1"
              @change="applyFilter('per_page', filters.per_page)"
            >
              <option v-for="size in PER_PAGE_OPTIONS" :key="size" :value="size">{{ size }}</option>
            </select>
          </label>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="font-semibold text-brand-600 underline"
            @click="clearFilters"
          >
            Limpiar filtros
          </button>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          @click="goToCreate"
        >
          + Nuevo producto
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <LoadingSpinner v-if="loading && items.length === 0" label="Cargando productos..." />

      <EmptyState
        v-else-if="isEmpty"
        title="No hay productos"
        message="Ajuste los filtros de búsqueda o registre un nuevo producto."
      >
        <template #actions>
          <button
            type="button"
            class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            @click="goToCreate"
          >
            Registrar producto
          </button>
        </template>
      </EmptyState>

      <template v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th class="px-4 py-3">Producto</th>
                <th class="px-4 py-3">Categoría</th>
                <th class="px-4 py-3 text-right">Precio</th>
                <th class="px-4 py-3 text-center">Stock</th>
                <th class="px-4 py-3 text-center">Estado</th>
                <th class="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="product in items" :key="product.id" class="transition hover:bg-slate-50">
                <td class="px-4 py-3">
                  <p class="font-medium text-slate-800">{{ product.name }}</p>
                  <p class="max-w-xs truncate text-xs text-slate-400">{{ product.description || 'Sin descripción' }}</p>
                </td>
                <td class="px-4 py-3 text-slate-600">{{ product.category?.name ?? '—' }}</td>
                <td class="px-4 py-3 text-right font-medium text-slate-700">{{ formatCurrency(product.price) }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="product.low_stock ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ product.stock }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
                  >
                    {{ product.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      @click="goToEdit(product)"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                      @click="askDelete(product)"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <PaginationControls :meta="meta" :disabled="loading" @change="goToPage" />
      </template>
    </div>

    <ConfirmDialog
      :open="productToDelete !== null"
      title="Eliminar producto"
      :message="`¿Confirma que desea eliminar '${productToDelete?.name ?? ''}'? La acción quedará registrada en la auditoría.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="productToDelete = null"
    />
  </div>
</template>