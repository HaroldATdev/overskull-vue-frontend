import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const DEFAULT_TIMEOUT = 5000

/**
 * Notificaciones globales (toasts).
 */
export const useToastStore = defineStore('toasts', () => {
  const items = ref([])
  let nextId = 1

  const hasToasts = computed(() => items.value.length > 0)

  const remove = (id) => {
    items.value = items.value.filter((toast) => toast.id !== id)
  }

  const push = (type, message, timeout = DEFAULT_TIMEOUT) => {
    const id = nextId++
    items.value.push({ id, type, message })

    if (timeout > 0) {
      setTimeout(() => remove(id), timeout)
    }

    return id
  }

  return {
    items,
    hasToasts,
    push,
    remove,
    success: (message, timeout) => push('success', message, timeout),
    error: (message, timeout) => push('error', message, timeout),
    info: (message, timeout) => push('info', message, timeout),
    clear: () => {
      items.value = []
    },
  }
})

export default useToastStore