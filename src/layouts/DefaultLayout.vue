<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useLoadingStore } from '@/stores/loading.store'
import { ROUTE_NAMES } from '@/utils/constants'
import { API_BASE_URL } from '@/services/http'

const route = useRoute()
const loading = useLoadingStore()

const navigation = [
  { name: ROUTE_NAMES.dashboard, label: 'Dashboard', icon: '▤' },
  { name: ROUTE_NAMES.products, label: 'Productos', icon: '' },
  { name: ROUTE_NAMES.categories, label: 'Categorías', icon: '◈' },
  { name: ROUTE_NAMES.activityLogs, label: 'Auditoría', icon: '⟳' },
]

const pageTitle = computed(() => route.meta?.title ?? 'Overskull')
const pageSubtitle = computed(() => route.meta?.subtitle ?? '')
const appName = computed(() => import.meta.env.VITE_APP_NAME ?? 'Overskull')

/**
 * Mantiene "Productos" resaltado también en las rutas de creación/edición.
 */
const isActive = (name) => {
  if (name === ROUTE_NAMES.products) {
    return route.path.startsWith('/productos')
  }

  return route.name === name
}
</script>

<template>
  <div class="min-h-screen lg:flex">
    <div v-if="loading.isLoading" id="global-loader" aria-label="Cargando" />

    <!-- Barra lateral -->
    <aside class="bg-slate-900 text-slate-300 lg:w-64 lg:shrink-0">
      <div class="flex items-center gap-3 px-5 py-5">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white">
          O
        </span>
        <div class="leading-tight">
          <p class="text-sm font-semibold text-white">Overskull</p>
          <p class="text-xs text-slate-400">Gestión de catálogo</p>
        </div>
      </div>

      <nav class="flex gap-2 overflow-x-auto px-3 pb-3 lg:flex-col lg:gap-1 lg:px-3 lg:pb-6">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="
            isActive(item.name)
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          "
        >
          <span aria-hidden="true">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="hidden px-5 py-4 text-xs text-slate-400 lg:block">
        <p class="font-semibold text-slate-300">API conectada</p>
        <p class="mt-1 break-all">{{ API_BASE_URL }}</p>
      </div>
    </aside>

    <!-- Contenido -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="border-b border-slate-200 bg-white px-5 py-4">
        <h1 class="text-lg font-semibold text-slate-900">{{ pageTitle }}</h1>
        <p v-if="pageSubtitle" class="text-sm text-slate-500">{{ pageSubtitle }}</p>
      </header>

      <main class="flex-1 px-5 py-6">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>

      <footer class="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
        {{ appName }} · Laravel 11 + Vue 3 · Prueba técnica Full Stack
      </footer>
    </div>
  </div>
</template>