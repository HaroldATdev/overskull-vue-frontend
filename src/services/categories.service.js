import http from '@/services/http'
import { cleanParams, toPayload } from '@/utils/query'

/**
 * Endpoints de categorías (CRUD completo) más el listado simple para selectores.
 */
export const categoriesService = {
  list: (filters = {}) => http.get('/categories', { params: cleanParams(filters) }),

  options: () => http.get('/categories/options'),

  show: (id) => http.get(`/categories/${id}`),

  create: (payload) => http.post('/categories', payload),

  update: (id, payload) => http.put(`/categories/${id}`, payload),

  remove: (id) => http.delete(`/categories/${id}`),
}

/**
 * Normaliza el formulario de categoría antes de enviarlo a la API.
 */
export const toCategoryPayload = (form) =>
  toPayload(
    {
      name: form.name,
      description: form.description,
      is_active: form.is_active,
    },
    [],
    ['is_active'],
  )

export default categoriesService