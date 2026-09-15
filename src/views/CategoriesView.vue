<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import CategoryForm from '@/components/CategoryForm.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationControls from '@/components/PaginationControls.vue'

import { useCategoriesStore } from '@/stores/categories.store'
import { useToastStore } from '@/stores/toasts.store'
import { CATEGORY_SORT_OPTIONS, PER_PAGE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'

const categories = useCategoriesStore()
const toasts = useToastStore()

const { items, meta, filters, loading, error, saving, fieldErrors, isEmpty } = storeToRefs(categories)

const formOpen = ref(false)
const editing = ref(null)
const formData = ref({})
const categoryToDelete = ref(null)
const deleting = ref(false)
let searchTimer = null

onMounted(() => categories.fetchCategories())

/**
 * Búsqueda con retardo (debounce).
 */
const onSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => categories.fetchCategories({ search: filters.value.search, page: 1 }), 400)
}

const applyFilter = (key, value) => categories.fetchCategories({ [key]: value, page: 1 })
const goToPage = (page) => categories.fetchCategories({ page })

const modalTitle = computed(() => (editing.value ? 'Editar categoría' : 'Nueva categoría'))

const openCreate = () => {
  editing.value = null
  formData.value = { name: '', description: '', is_active: true }
  categories.clearFieldErrors()
  formOpen.value = true
}

const openEdit = (category) => {
  editing.value = category
  formData.value = {
    name: category.name,
    description: category.description ?? '',
    is_active: category.is_active,
  }
  categories.clearFieldErrors()
  formOpen.value = true
}

const closeForm = () => {
  formOpen.value = false
  editing.value = null
}

const handleSubmit = async (values) => {
  const { success } = await categories.saveCategory(values, editing.value?.id ?? null)

  if (success) {
    closeForm()
  }
}

const handleInvalid = (validationErrors) => {
  toasts.error(`Revise los campos marcados (${Object.keys(validationErrors).length} error(es)).`)
}

const askDelete = (category) => {
  categoryToDelete.value = category
}

const confirmDelete = async () => {
  if (!categoryToDelete.value) {
    return
  }

  deleting.value = true
  await categories.deleteCategory(categoryToDelete.value)
  deleting.value = false
  categoryToDelete.value = null
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="error"
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
    >
      <p>{{ error.message }}</p>
      <button type="button" class="font-semibold underline" @click="categories.fetchCategories()">Reintentar</button>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label for="category-search" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">Buscar</label>
          <input
            id="category-search"
            v-model="filters.search"
            type="search"
            placeholder="Nombre o descripción..."
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @input="onSearchInput"
          />
        </div>

        <div>
          <label for="category-filter-status" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">
            Estado
          </label>
          <select
            id="category-filter-status"
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
          <label for="category-filter-sort" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">
            Ordenar por
          </label>
          <select
            id="category-filter-sort"
            v-model="filters.sort_by"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @change="applyFilter('sort_by', filters.sort_by)"
          >
            <option v-for="option in CATEGORY_SORT_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div>
          <label for="category-filter-per-page" class="mb-1 block text-xs font-semibold text-slate-500 uppercase">
            Por página
          </label>
          <select
            id="category-filter-per-page"
            v-model="filters.per_page"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            @change="applyFilter('per_page', filters.per_page)"
          >
            <option v-for="size in PER_PAGE_OPTIONS" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p class="text-xs text-slate-500">{{ meta.total }} categoría(s) registradas</p>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          @click="openCreate"
        >
          + Nueva categoría
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <LoadingSpinner v-if="loading && items.length === 0" label="Cargando categorías..." />

      <EmptyState
        v-else-if="isEmpty"
        title="No hay categorías"
        message="Registre la primera categoría para organizar los productos del catálogo."
      />

      <template v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th class="px-4 py-3">Categoría</th>
                <th class="px-4 py-3 text-center">Productos</th>
                <th class="px-4 py-3 text-center">Estado</th>
                <th class="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="category in items" :key="category.id" class="transition hover:bg-slate-50">
                <td class="px-4 py-3">
                  <p class="font-medium text-slate-800">{{ category.name }}</p>
                  <p class="max-w-md truncate text-xs text-slate-400">{{ category.description || 'Sin descripción' }}</p>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                    {{ category.products_count ?? 0 }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="category.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
                  >
                    {{ category.is_active ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      @click="openEdit(category)"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                      @click="askDelete(category)"
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

    <!-- Modal de creación / edición -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="formOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
          <div class="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true">
            <h2 class="text-base font-semibold text-slate-900">{{ modalTitle }}</h2>
            <p class="mb-4 text-xs text-slate-500">Complete la información de la categoría.</p>

            <CategoryForm
              :model-value="formData"
              :submitting="saving"
              :server-errors="fieldErrors"
              :submit-label="editing ? 'Actualizar categoría' : 'Crear categoría'"
              @submit="handleSubmit"
              @invalid="handleInvalid"
              @cancel="closeForm"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmDialog
      :open="categoryToDelete !== null"
      title="Eliminar categoría"
      :message="`¿Confirma que desea eliminar '${categoryToDelete?.name ?? ''}'? Sólo es posible si no tiene productos asociados.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="categoryToDelete = null"
    />
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>