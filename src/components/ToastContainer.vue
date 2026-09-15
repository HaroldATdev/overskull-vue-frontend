<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toasts.store'

const toasts = useToastStore()
const { items } = storeToRefs(toasts)

const styles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-brand-200 bg-brand-50 text-brand-800',
}

const icons = { success: '✔', error: '✕', info: 'ℹ' }
</script>

<template>
  <div
    class="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in items"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg"
        :class="styles[toast.type] ?? styles.info"
      >
        <span aria-hidden="true" class="mt-0.5 text-sm font-bold">
          {{ icons[toast.type] ?? icons.info }}
        </span>
        <p class="flex-1 text-sm leading-snug">{{ toast.message }}</p>
        <button
          type="button"
          class="rounded px-1 text-xs opacity-60 transition hover:opacity-100"
          aria-label="Cerrar notificación"
          @click="toasts.remove(toast.id)"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>