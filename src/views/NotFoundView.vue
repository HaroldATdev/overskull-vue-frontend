<script setup>
import { RouterLink } from 'vue-router'
import { ROUTE_NAMES } from '@/utils/constants'
</script>

<template>
  <div class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
    <p class="text-5xl font-bold text-brand-500">404</p>
    <h2 class="mt-3 text-lg font-semibold text-slate-900">Página no encontrada</h2>
    <p class="mt-2 text-sm text-slate-500">
      La ruta solicitada no existe. Puede volver al dashboard o al listado de productos.
    </p>
    <div class="mt-5 flex justify-center gap-2">
      <RouterLink
        :to="{ name: ROUTE_NAMES.dashboard }"
        class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Ir al dashboard
      </RouterLink>
      <RouterLink
        :to="{ name: ROUTE_NAMES.products }"
        class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Ver productos
      </RouterLink>
    </div>
  </div>
</template>