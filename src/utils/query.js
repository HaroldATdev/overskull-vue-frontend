/**
 * Utilidades para construir los parámetros de consulta de los listados.
 *
 * Descarta los filtros vacíos para no enviar parámetros innecesarios a la API.
 */
export const cleanParams = (filters = {}) =>
  Object.entries(filters).reduce((params, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params[key] = value
    }

    return params
  }, {})

/**
 * Convierte los valores de un formulario en un payload limpio (trim + tipos).
 */
export const toPayload = (values, numericFields = [], booleanFields = []) => {
  const payload = { ...values }

  Object.keys(payload).forEach((key) => {
    if (typeof payload[key] === 'string') {
      payload[key] = payload[key].trim()
    }

    if (payload[key] === '') {
      payload[key] = null
    }
  })

  numericFields.forEach((field) => {
    if (payload[field] !== null && payload[field] !== undefined) {
      payload[field] = Number(payload[field])
    }
  })

  booleanFields.forEach((field) => {
    if (payload[field] !== null && payload[field] !== undefined) {
      payload[field] = Boolean(payload[field])
    }
  })

  return payload
}