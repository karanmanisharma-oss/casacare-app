/**
 * Base URL for Supabase auth email links (signup confirmation, password reset).
 * In production we always use the deployed host so links work on mobile email clients
 * (localhost in the email would open on the phone itself and fail).
 */
export function getAuthSiteOrigin() {
  const fromEnv = import.meta.env.VITE_AUTH_SITE_URL
  if (fromEnv && String(fromEnv).trim()) {
    const u = String(fromEnv).trim().replace(/\/$/, '')
    // Production builds must not use localhost in emailed links — a bad Vercel env breaks reset/verify on phones
    if (import.meta.env.PROD && /localhost|127\.0\.0\.1/i.test(u)) {
      return 'https://casacare-app.vercel.app'
    }
    return u
  }
  if (import.meta.env.PROD) {
    return 'https://casacare-app.vercel.app'
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'https://casacare-app.vercel.app'
}
