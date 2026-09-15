import http from '@/services/http'
import { cleanParams, toPayload } from '@/utils/query'

/**
 * Endpoints de productos (CRUD completo).
 */
export const productsService = {
  list: (filters = {}) => http.get('/products', { params: cleanParams(filters) }),

  show: (id) => http.get(`/products/${id}`),

  create: (payload) => http.post('/products', payload),

  update: (id, payload) => http.put(`/products/${id}`, payload),

  remove: (id) => http.delete(`/products/${id}`),
}

/**
 * Normaliza el formulario antes de enviarlo a la API.
 */
export const toProductPayload = (form) =>
  toPayload(
    {
      name: form.name,
      description: form.description,
      price: form.price,
      stock: form.stock,
      category_id: form.category_id,
      is_active: form.is_active,
    },
    ['price', 'stock', 'category_id'],
    ['is_active'],
  )

export default productsService