/**
 * Normalización de errores HTTP.
 *
 * El interceptor de Axios convierte cualquier fallo (de red o de la API) en una
 * instancia de `ApiError`, de modo que las vistas siempre reciben la misma
 * estructura: { status, message, errors, isNetworkError }.
 */

export const HTTP_MESSAGES = {
  0: 'No se pudo conectar con el servidor. Verifique que la API esté disponible.',
  400: 'La petición no es válida.',
  401: 'No está autenticado para realizar esta acción.',
  403: 'No tiene permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  405: 'La operación no está permitida.',
  409: 'La operación entra en conflicto con el estado actual del recurso.',
  419: 'La sesión expiró. Vuelva a iniciar sesión.',
  422: 'Los datos enviados no son válidos.',
  429: 'Demasiadas solicitudes. Espere unos segundos e intente nuevamente.',
  500: 'Ocurrió un error inesperado en el servidor.',
}

export class ApiError extends Error {
  constructor({ status = 0, message, errors = {}, isNetworkError = false }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.isNetworkError = isNetworkError
  }

  get isValidationError() {
    return this.status === 422 && Object.keys(this.errors).length > 0
  }
}

/**
 * Convierte los errores de validación de la API en un mapa
 * { campo: "primer mensaje" } listo para pintar en el formulario.
 */
export const toFieldErrors = (apiError) => {
  if (!apiError?.errors) {
    return {}
  }

  return Object.entries(apiError.errors).reduce((fields, [field, messages]) => {
    fields[field] = Array.isArray(messages) ? messages[0] : String(messages)

    return fields
  }, {})
}

/**
 * Convierte un error de Axios (o cualquier excepción) en `ApiError`.
 */
export const normalizeError = (error) => {
  if (error instanceof ApiError) {
    return error
  }

  if (error?.response) {
    const { status, data } = error.response

    return new ApiError({
      status,
      message: data?.message || HTTP_MESSAGES[status] || 'Ocurrió un error inesperado.',
      errors: data?.errors ?? {},
    })
  }

  if (error?.code === 'ECONNABORTED') {
    return new ApiError({
      status: 0,
      message: 'La petición tardó demasiado tiempo. Intente nuevamente.',
      isNetworkError: true,
    })
  }

  return new ApiError({
    status: 0,
    message: HTTP_MESSAGES[0],
    isNetworkError: true,
  })
}