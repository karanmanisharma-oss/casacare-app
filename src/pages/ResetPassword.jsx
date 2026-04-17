import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  async function handleReset(e) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      setDone(true)
      toast.success('Password updated successfully!')
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7FFFE', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔐</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: '800', fontSize: '22px', color: '#1a2b4a' }}>
            {done ? 'Password Updated!' : 'Set New Password'}
          </h2>
          {done && <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>Redirecting to login...</p>}
        </div>

        {!done && (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input className="form-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: '18px', height: '18px' }} /> Updating...</> : 'Update password →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
