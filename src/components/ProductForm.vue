<script setup>
import { computed, reactive, ref, watch } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { productSchema, validateForm } from '@/utils/validators'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
  submitLabel: { type: String, default: 'Guardar producto' },
})

const emit = defineEmits(['submit', 'cancel', 'invalid'])

const emptyForm = () => ({
  name: '',
  description: '',
  price: '',
  stock: 0,
  category_id: '',
  is_active: true,
})

const form = reactive({ ...emptyForm(), ...props.modelValue })
const clientErrors = ref({})

// Sincroniza el formulario cuando el producto se carga de forma asíncrona (edición).
watch(
  () => props.modelValue,
  (value) => {
    Object.assign(form, emptyForm(), value ?? {})
  },
  { deep: true },
)

/**
 * Los errores del cliente tienen prioridad sobre los devueltos por la API.
 */
const errors = computed(() => ({ ...props.serverErrors, ...clientErrors.value }))

const clearError = (field) => {
  if (clientErrors.value[field] || props.serverErrors[field]) {
    clientErrors.value = { ...clientErrors.value, [field]: '' }
  }
}

const validateField = (field) => {
  const { errors: validationErrors } = validateForm(form, { [field]: productSchema[field] ?? [] })

  clientErrors.value = { ...clientErrors.value, [field]: validationErrors[field] ?? '' }
}

const handleSubmit = () => {
  const { valid, errors: validationErrors } = validateForm(form, productSchema)

  clientErrors.value = validationErrors

  if (!valid) {
    emit('invalid', validationErrors)

    return
  }

  emit('submit', { ...form })
}

const inputClass = (field) =>
  errors.value[field]
    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
    : 'border-slate-300 focus:border-brand-500 focus:ring-brand-200'
</script>

<template>
  <form
    class="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <div class="grid gap-5 md:grid-cols-2">
      <div class="md:col-span-2">
        <label for="product-name" class="mb-1 block text-sm font-medium text-slate-700">
          Nombre <span class="text-rose-500">*</span>
        </label>
        <input
          id="product-name"
          v-model="form.name"
          type="text"
          maxlength="150"
          placeholder="Camiseta Overskull"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2"
          :class="inputClass('name')"
          @input="clearError('name')"
          @blur="validateField('name')"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-rose-600">{{ errors.name }}</p>
      </div>

      <div>
        <label for="product-price" class="mb-1 block text-sm font-medium text-slate-700">
          Precio (S/) <span class="text-rose-500">*</span>
        </label>
        <input
          id="product-price"
          v-model="form.price"
          type="number"
          min="0"
          step="0.01"
          placeholder="89.90"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2"
          :class="inputClass('price')"
          @input="clearError('price')"
          @blur="validateField('price')"
        />
        <p v-if="errors.price" class="mt-1 text-xs text-rose-600">{{ errors.price }}</p>
      </div>
    <div>
        <label for="product-stock" class="mb-1 block text-sm font-medium text-slate-700">
          Stock <span class="text-rose-500">*</span>
        </label>
        <input
          id="product-stock"
          v-model="form.stock"
          type="number"
          min="0"
          step="1"
          placeholder="50"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2"
          :class="inputClass('stock')"
          @input="clearError('stock')"
          @blur="validateField('stock')"
        />
        <p v-if="errors.stock" class="mt-1 text-xs text-rose-600">{{ errors.stock }}</p>
      </div>

      <div>
        <label for="product-category" class="mb-1 block text-sm font-medium text-slate-700">
          Categoría <span class="text-rose-500">*</span>
        </label>
        <select
          id="product-category"
          v-model="form.category_id"
          class="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2"
          :class="inputClass('category_id')"
          @change="
            clearError('category_id');
            validateField('category_id')
          "
        >
          <option value="">Seleccione una categoría</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <p v-if="errors.category_id" class="mt-1 text-xs text-rose-600">{{ errors.category_id }}</p>
      </div>

      <div class="md:col-span-2">
        <label for="product-description" class="mb-1 block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="product-description"
          v-model="form.description"
          rows="3"
          maxlength="1000"
          placeholder="Camiseta negra edición limitada"
          class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2"
          :class="inputClass('description')"
          @input="clearError('description')"
          @blur="validateField('description')"
        />
        <p v-if="errors.description" class="mt-1 text-xs text-rose-600">{{ errors.description }}</p>
      </div>

      <div class="md:col-span-2">
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input v-model="form.is_active" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-brand-600" />
          Producto activo (visible en el catálogo)
        </label>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        :disabled="submitting"
      >
        <LoadingSpinner v-if="submitting" size="sm" label="" />
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>