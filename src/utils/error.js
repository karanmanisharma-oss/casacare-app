export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (typeof error === 'string' && error.trim()) return error.trim()
  if (error && typeof error.message === 'string' && error.message.trim()) return error.message.trim()
  return fallback
}

export function errorMessageIncludes(error, terms = []) {
  const message = getErrorMessage(error, '').toLowerCase()
  return terms.some(term => message.includes(String(term).toLowerCase()))
}
