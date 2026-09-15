/**
 * Formateadores de presentación (moneda, números y fechas).
 */

const currencyFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('es-PE')

export const formatCurrency = (value) => currencyFormatter.format(Number(value ?? 0))

export const formatNumber = (value) => numberFormatter.format(Number(value ?? 0))

export const formatDateTime = (value) => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDate = (value) => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-PE')
}