import axios from 'axios'
import { pinia } from '@/stores'
import { useLoadingStore } from '@/stores/loading.store'
import { useToastStore } from '@/stores/toasts.store'
import { normalizeError } from '@/utils/errorHandler'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

/* ---------------------------------------------------------------------------
 * Interceptor de petición: activa el indicador global de carga.
 * ------------------------------------------------------------------------- */
http.interceptors.request.use(
  (config) => {
    useLoadingStore(pinia).start()

    return config
  },
  (error) => {
    useLoadingStore(pinia).stop()

    return Promise.reject(normalizeError(error))
  },
)

/* ---------------------------------------------------------------------------
 * Interceptor de respuesta: manejo global de errores.
 *
 * - Devuelve directamente el cuerpo JSON ({ success, message, data, meta }).
 * - Normaliza cualquier error y lo notifica con un toast global.
 * - Los formularios pueden leer `error.errors` para pintar errores por campo.
 * ------------------------------------------------------------------------- */
http.interceptors.response.use(
  (response) => {
    useLoadingStore(pinia).stop()

    return response.data
  },
  (error) => {
    useLoadingStore(pinia).stop()

    const apiError = normalizeError(error)
    const skipToast = error?.config?.skipErrorMessage === true

    if (!skipToast) {
      useToastStore(pinia).error(apiError.message)
    }

    return Promise.reject(apiError)
  },
)

export default http