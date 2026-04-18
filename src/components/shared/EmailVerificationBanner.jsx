import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

/** Shown when the account exists but email is not verified yet (Urban Company–style trust nudge). */
export default function EmailVerificationBanner() {
  const { user, resendSignupEmail } = useAuth()
  const [sending, setSending] = useState(false)

  if (!user || user.email_confirmed_at) return null

  async function resend() {
    if (!user.email) return
    setSending(true)
    const { error } = await resendSignupEmail(user.email)
    setSending(false)
    if (error) toast.error(error.message)
    else toast.success('Confirmation email sent. Check your inbox and spam folder.')
  }

  return (
    <div
      role="status"
      style={{
        marginBottom: '20px',
        padding: '14px 18px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '1px solid rgba(245, 166, 35, 0.45)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'var(--font-display), system-ui, sans-serif',
      }}
    >
      <span style={{ fontSize: '20px' }} aria-hidden>✉️</span>
      <div style={{ flex: '1 1 220px' }}>
        <div style={{ fontWeight: '800', color: '#92400e', fontSize: '14px', marginBottom: '4px' }}>
          Verify your email
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#78350f', lineHeight: 1.5 }}>
          We sent a link to <strong>{user.email}</strong>. Until you verify, some actions may be limited.
        </p>
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={sending}
        className="btn btn-secondary"
        style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}
      >
        {sending ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  )
}
