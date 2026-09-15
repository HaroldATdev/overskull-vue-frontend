<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar acción' },
  message: { type: String, default: '¿Está seguro de continuar?' },
  confirmLabel: { type: String, default: 'Confirmar' },
  cancelLabel: { type: String, default: 'Cancelar' },
  loading: { type: Boolean, default: false },
  tone: { type: String, default: 'danger' },
})

const emit = defineEmits(['confirm', 'cancel'])

const onKeydown = (event) => {
  if (event.key === 'Escape' && props.open) {
    emit('cancel')
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
        <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true">
          <h2 class="text-base font-semibold text-slate-900">{{ title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ message }}</p>

          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              :disabled="loading"
              @click="emit('cancel')"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
              :class="tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'"
              :disabled="loading"
              @click="emit('confirm')"
            >
              <LoadingSpinner v-if="loading" size="sm" label="" />
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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