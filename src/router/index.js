import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_NAMES } from '@/utils/constants'

const routes = [
  {
    path: '/',
    name: ROUTE_NAMES.dashboard,
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Dashboard', subtitle: 'Resumen del catálogo y actividad reciente' },
  },
  {
    path: '/productos',
    name: ROUTE_NAMES.products,
    component: () => import('@/views/ProductsView.vue'),
    meta: { title: 'Productos', subtitle: 'Listado, filtros y mantenimiento del catálogo' },
  },
  {
    path: '/productos/nuevo',
    name: ROUTE_NAMES.productCreate,
    component: () => import('@/views/ProductFormView.vue'),
    meta: { title: 'Nuevo producto', subtitle: 'Registre un producto del catálogo', mode: 'create' },
  },
  {
    path: '/productos/:id/editar',
    name: ROUTE_NAMES.productEdit,
    component: () => import('@/views/ProductFormView.vue'),
    props: true,
    meta: { title: 'Editar producto', subtitle: 'Actualice la información del producto', mode: 'edit' },
  },
  {
    path: '/categorias',
    name: ROUTE_NAMES.categories,
    component: () => import('@/views/CategoriesView.vue'),
    meta: { title: 'Categorías', subtitle: 'Agrupación de productos del catálogo' },
  },
  {
    path: '/auditoria',
    name: ROUTE_NAMES.activityLogs,
    component: () => import('@/views/ActivityLogsView.vue'),
    meta: { title: 'Auditoría', subtitle: 'Historial de acciones registradas en la API' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.notFound,
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada', subtitle: 'La ruta solicitada no existe' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const appName = import.meta.env.VITE_APP_NAME ?? 'Overskull'
  document.title = to.meta?.title ? `${to.meta.title} | ${appName}` : appName
})

export default router