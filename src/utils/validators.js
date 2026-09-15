/**
 * Validaciones de formularios en el cliente.
 *
 * Cada regla es una función que devuelve un mensaje de error (string) o ''
 * cuando el valor es válido. Los esquemas describen qué reglas aplica cada
 * campo, de modo que las vistas sólo consumen `validateForm`.
 */

const isEmpty = (value) => value === null || value === undefined || String(value).trim() === ''

export const rules = {
  required:
    (message = 'Este campo es requerido') =>
    (value) =>
      isEmpty(value) ? message : '',

  minLength: (min, message) => (value) =>
    !isEmpty(value) && String(value).trim().length < min
      ? message ?? `Debe tener al menos ${min} caracteres`
      : '',

  maxLength: (max, message) => (value) =>
    !isEmpty(value) && String(value).trim().length > max
      ? message ?? `No debe superar los ${max} caracteres`
      : '',

  numeric:
    (message = 'Debe ser un valor numérico') =>
    (value) =>
      isEmpty(value) || Number.isNaN(Number(value)) ? message : '',

  integer:
    (message = 'Debe ser un número entero') =>
    (value) =>
      isEmpty(value) || !Number.isInteger(Number(value)) ? message : '',

  greaterThan: (min, message) => (value) =>
    !isEmpty(value) && Number(value) <= min ? message ?? `Debe ser mayor que ${min}` : '',

  atLeast: (min, message) => (value) =>
    !isEmpty(value) && Number(value) < min ? message ?? `Debe ser mayor o igual a ${min}` : '',

  between: (min, max, message) => (value) =>
    !isEmpty(value) && (Number(value) < min || Number(value) > max)
      ? message ?? `Debe estar entre ${min} y ${max}`
      : '',

  decimal: (places = 2, message) => (value) => {
    if (isEmpty(value)) {
      return ''
    }

    const decimals = String(value).split('.')[1]?.length ?? 0

    return decimals > places ? message ?? `Máximo ${places} decimales` : ''
  },
}

/**
 * Ejecuta las reglas de un esquema sobre los valores indicados.
 *
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export const validateForm = (values, schema) => {
  const errors = {}

  Object.entries(schema).forEach(([field, fieldRules]) => {
    for (const rule of fieldRules) {
      const error = rule(values[field])

      if (error) {
        errors[field] = error
        break
      }
    }
  })

  return { valid: Object.keys(errors).length === 0, errors }
}

export const productSchema = {
  name: [
    rules.required('El campo nombre es requerido'),
    rules.minLength(3, 'El nombre debe tener al menos 3 caracteres'),
    rules.maxLength(150, 'El nombre no debe superar los 150 caracteres'),
  ],
  price: [
    rules.required('El campo precio es requerido'),
    rules.numeric('El precio debe ser un valor numérico'),
    rules.greaterThan(0, 'El precio debe ser mayor que 0'),
    rules.decimal(2, 'El precio admite máximo 2 decimales'),
  ],
  stock: [
    rules.required('El campo stock es requerido'),
    rules.integer('El stock debe ser un número entero'),
    rules.atLeast(0, 'El stock no puede ser negativo'),
  ],
  category_id: [rules.required('Debe seleccionar una categoría')],
  description: [rules.maxLength(1000, 'La descripción no debe superar los 1000 caracteres')],
}

export const categorySchema = {
  name: [
    rules.required('El campo nombre es requerido'),
    rules.minLength(3, 'El nombre debe tener al menos 3 caracteres'),
    rules.maxLength(100, 'El nombre no debe superar los 100 caracteres'),
  ],
  description: [rules.maxLength(255, 'La descripción no debe superar los 255 caracteres')],
}