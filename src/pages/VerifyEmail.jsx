import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

/**
 * Supabase email confirmation redirect target (PKCE + implicit).
 *
 * Dashboard: Authentication → URL configuration
 * - Site URL: https://casacare-app.vercel.app
 * - Redirect URLs (add all that you use):
 *   https://casacare-app.vercel.app/**
 *   http://localhost:5173/**   (Vite dev)
 *   http://127.0.0.1:5173/**
 *
 * Optional: set VITE_AUTH_SITE_URL if the public URL differs from production defaults.
 */
export default function VerifyEmail() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your email…')
  const navigate = useNavigate()
  const finished = useRef(false)

  useEffect(() => {
    let cancelled = false

    function succeed() {
      if (finished.current || cancelled) return
      finished.current = true
      setStatus('success')
      setMessage('Email verified. Welcome to CasaCare.')
      toast.success('Email verified!')
      window.history.replaceState({}, document.title, '/verify')
      setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
    }

    async function run() {
      try {
        const href = window.location.href
        const url = new URL(href)
        if (url.searchParams.get('code')) {
          const { error } = await supabase.auth.exchangeCodeForSession(href)
          if (error) throw error
        }

        await new Promise(r => setTimeout(r, 400))
        const { data: { session: s0 }, error: e0 } = await supabase.auth.getSession()
        if (e0) throw e0
        if (s0?.user) {
          succeed()
          return
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
          if (cancelled || finished.current) return
          if (sess?.user && event === 'SIGNED_IN') {
            subscription.unsubscribe()
            succeed()
          }
        })

        await new Promise(r => setTimeout(r, 4000))
        const { data: { session: s1 } } = await supabase.auth.getSession()
        subscription.unsubscribe()

        if (s1?.user && !finished.current) {
          succeed()
          return
        }
        if (!cancelled && !finished.current) {
          setStatus('error')
          setMessage('We could not confirm this link. It may have expired. Sign in, or register again.')
        }
      } catch (e) {
        if (!cancelled && !finished.current) {
          setStatus('error')
          setMessage(e?.message || 'Verification failed. Please try again.')
        }
      }
    }

    run()
    return () => { cancelled = true }
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a2b4a 0%, #1D9E75 100%)',
      padding: '24px',
      fontFamily: "'Plus Jakarta Sans',sans-serif",
    }}>
      <div style={{
        background: 'white', padding: '40px 32px', borderRadius: '20px', textAlign: 'center',
        maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {status === 'loading' && '⏳'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>
        <h1 style={{ color: '#1a2b4a', margin: '0 0 12px 0', fontSize: '22px', fontWeight: '800' }}>
          {status === 'loading' && 'Verifying email'}
          {status === 'success' && 'You’re all set'}
          {status === 'error' && 'Could not verify'}
        </h1>
        <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: '15px', lineHeight: 1.55 }}>{message}</p>
        {status === 'success' && (
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>Redirecting to your dashboard…</p>
        )}
        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <Link to="/login" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>Sign in</Link>
            <Link to="/register" className="btn btn-secondary btn-full" style={{ textDecoration: 'none' }}>Create account</Link>
          </div>
        )}
        <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '28px' }}>
          CasaCare · support@casacare.in · 9810223963
        </p>
      </div>
    </div>
  )
}
