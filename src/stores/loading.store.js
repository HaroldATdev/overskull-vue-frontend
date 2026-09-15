import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * Estado global de carga.
 *
 * El interceptor de Axios incrementa/decrementa el contador en cada petición,
 * por lo que la barra de progreso refleja todas las solicitudes simultáneas.
 */
export const useLoadingStore = defineStore('loading', () => {
  const pending = ref(0)

  const isLoading = computed(() => pending.value > 0)

  const start = () => {
    pending.value += 1
  }

  const stop = () => {
    pending.value = Math.max(0, pending.value - 1)
  }

  const reset = () => {
    pending.value = 0
  }

  return { pending, isLoading, start, stop, reset }
})

export default useLoadingStore