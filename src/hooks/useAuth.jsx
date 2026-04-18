import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getAuthSiteOrigin } from '../lib/authSiteUrl'

const AuthContext = createContext(null)

const VALID_ROLES = new Set(['individual', 'nri', 'corporate', 'field_force', 'admin'])

async function ensureProfileFromUser(user) {
  if (!user?.id) return
  const { data: row } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
  if (row) return
  const meta = user.user_metadata || {}
  const role = VALID_ROLES.has(meta.role) ? meta.role : 'individual'
  const payload = {
    id: user.id,
    email: user.email || '',
    full_name: (meta.full_name || meta.fullName || '').trim() || 'Member',
    role,
    phone: meta.phone ? String(meta.phone).trim() || null : null,
  }
  const { error } = await supabase.from('profiles').insert(payload)
  if (error) console.error('ensureProfileFromUser', error)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (error) throw error
      setProfile(data ?? null)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await ensureProfileFromUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch(() => {
      setUser(null)
      setProfile(null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await ensureProfileFromUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  /**
   * @returns {{ error: import('@supabase/supabase-js').AuthError | null, needsEmailConfirmation?: boolean, email?: string }}
   */
  async function signUp(email, password, fullName, role, phone = '') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getAuthSiteOrigin()}/verify`,
        data: {
          full_name: fullName,
          role,
          ...(phone?.trim() ? { phone: phone.trim() } : {}),
        },
      },
    })
    if (error) return { error }

    if (data.session?.user) {
      await ensureProfileFromUser(data.session.user)
      await fetchProfile(data.user.id)
    }

    const needsEmailConfirmation = Boolean(data.user && !data.session)
    return {
      error: null,
      needsEmailConfirmation,
      email,
    }
  }

  async function resendSignupEmail(email) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${getAuthSiteOrigin()}/verify`,
      },
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, resendSignupEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
