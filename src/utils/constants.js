/**
 * Constantes compartidas por las vistas y los stores.
 */

export const PER_PAGE_OPTIONS = [5, 10, 15, 25, 50]

export const PRODUCT_SORT_OPTIONS = [
  { value: 'created_at', label: 'Más recientes' },
  { value: 'name', label: 'Nombre' },
  { value: 'price', label: 'Precio' },
  { value: 'stock', label: 'Stock' },
]

export const CATEGORY_SORT_OPTIONS = [
  { value: 'created_at', label: 'Más recientes' },
  { value: 'name', label: 'Nombre' },
  { value: 'products_count', label: 'N° de productos' },
]

export const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
]

export const LOG_NAME_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'producto', label: 'Productos' },
  { value: 'categoria', label: 'Categorías' },
]

export const EVENT_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'created', label: 'Creación' },
  { value: 'updated', label: 'Actualización' },
  { value: 'deleted', label: 'Eliminación' },
]

export const EVENT_STYLES = {
  created: { label: 'Creación', classes: 'bg-emerald-100 text-emerald-700' },
  updated: { label: 'Actualización', classes: 'bg-amber-100 text-amber-700' },
  deleted: { label: 'Eliminación', classes: 'bg-rose-100 text-rose-700' },
}

export const ROUTE_NAMES = {
  dashboard: 'dashboard',
  products: 'products',
  productCreate: 'products.create',
  productEdit: 'products.edit',
  categories: 'categories',
  activityLogs: 'activity-logs',
  notFound: 'not-found',
}