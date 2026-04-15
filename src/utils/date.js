export function formatDate(value, locale = 'en-IN', options) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString(locale, options)
}

export function formatDateTime(value, locale = 'en-IN', options) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString(locale, options)
}

export function isSameDay(valueA, valueB = new Date()) {
  const a = new Date(valueA)
  const b = new Date(valueB)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return false
  return a.toDateString() === b.toDateString()
}
