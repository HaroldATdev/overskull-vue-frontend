<script setup>
import { computed, reactive, ref, watch } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { categorySchema, validateForm } from '@/utils/validators'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
  submitLabel: { type: String, default: 'Guardar categoría' },
})

const emit = defineEmits(['submit', 'cancel', 'invalid'])

const emptyForm = () => ({ name: '', description: '', is_active: true })

const form = reactive({ ...emptyForm(), ...props.modelValue })
const clientErrors = ref({})

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(form, emptyForm(), value ?? {})
  },
  { deep: true },
)

const errors = computed(() => ({ ...props.serverErrors, ...clientErrors.value }))

const clearError = (field) => {
  if (clientErrors.value[field] || props.serverErrors[field]) {
    clientErrors.value = { ...clientErrors.value, [field]: '' }
  }
}

const validateField = (field) => {
  const { errors: validationErrors } = validateForm(form, { [field]: categorySchema[field] ?? [] })

  clientErrors.value = { ...clientErrors.value, [field]: validationErrors[field] ?? '' }
}

const handleSubmit = () => {
  const { valid, errors: validationErrors } = validateForm(form, categorySchema)

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
  <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
    <div>
      <label for="category-name" class="mb-1 block text-sm font-medium text-slate-700">
        Nombre <span class="text-rose-500">*</span>
      </label>
      <input
        id="category-name"
        v-model="form.name"
        type="text"
        maxlength="100"
        placeholder="Ropa"
        class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2"
        :class="inputClass('name')"
        @input="clearError('name')"
        @blur="validateField('name')"
      />
      <p v-if="errors.name" class="mt-1 text-xs text-rose-600">{{ errors.name }}</p>
    </div>

    <div>
      <label for="category-description" class="mb-1 block text-sm font-medium text-slate-700">
        Descripción
      </label>
      <textarea
        id="category-description"
        v-model="form.description"
        rows="3"
        maxlength="255"
        placeholder="Prendas de vestir"
        class="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2"
        :class="inputClass('description')"
        @input="clearError('description')"
        @blur="validateField('description')"
      />
      <p v-if="errors.description" class="mt-1 text-xs text-rose-600">{{ errors.description }}</p>
    </div>

    <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input v-model="form.is_active" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-brand-600" />
      Categoría activa
    </label>

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