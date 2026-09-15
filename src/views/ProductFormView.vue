<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ProductForm from '@/components/ProductForm.vue'

import { useCategoriesStore } from '@/stores/categories.store'
import { useProductsStore } from '@/stores/products.store'
import { useToastStore } from '@/stores/toasts.store'
import { ROUTE_NAMES } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const products = useProductsStore()
const categories = useCategoriesStore()
const toasts = useToastStore()

const { saving, fieldErrors, loading, error } = storeToRefs(products)
const { options: categoryOptions } = storeToRefs(categories)

const isEdit = computed(() => Boolean(route.params.id))
const formData = ref({})
const notFound = ref(false)

onMounted(async () => {
  await categories.fetchOptions()

  if (!isEdit.value) {
    return
  }

  const product = await products.fetchProduct(route.params.id)

  if (!product) {
    notFound.value = true

    return
  }

  formData.value = {
    name: product.name,
    description: product.description ?? '',
    price: product.price,
    stock: product.stock,
    category_id: product.category_id,
    is_active: product.is_active,
  }
})

/**
 * Guarda el producto (crea o actualiza) y regresa al listado.
 */
const handleSubmit = async (values) => {
  const { success } = await products.saveProduct(values, isEdit.value ? route.params.id : null)

  if (success) {
    router.push({ name: ROUTE_NAMES.products })
  }
}

const handleInvalid = (validationErrors) => {
  toasts.error(`Revise los campos marcados (${Object.keys(validationErrors).length} error(es)).`)
}

const goBack = () => router.push({ name: ROUTE_NAMES.products })
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        @click="goBack"
      >
        ← Volver al listado
      </button>
      <p class="text-xs text-slate-500">
        Los campos marcados con <span class="text-rose-500">*</span> son obligatorios
      </p>
    </div>

    <div
      v-if="error && !notFound"
      class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
    >
      {{ error.message }}
    </div>

    <div v-if="notFound" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      El producto solicitado no existe o fue eliminado.
    </div>

    <LoadingSpinner v-else-if="isEdit && loading" label="Cargando producto..." />

    <ProductForm
      v-else
      :model-value="formData"
      :categories="categoryOptions"
      :submitting="saving"
      :server-errors="fieldErrors"
      :submit-label="isEdit ? 'Actualizar producto' : 'Crear producto'"
      @submit="handleSubmit"
      @invalid="handleInvalid"
      @cancel="goBack"
    />
  </div>
</template>