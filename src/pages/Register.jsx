import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'individual', label: 'Individual User', desc: 'Book services for your home' },
  { value: 'nri', label: 'NRI Owner', desc: 'Manage your property remotely' },
  { value: 'corporate', label: 'Corporate HQ', desc: 'Manage multiple properties & AMC' },
  { value: 'field_force', label: 'Field Technician', desc: 'Service provider / technician' },
]

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'individual', phone: '' })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.fullName, form.role)
    setLoading(false)
    if (error) toast.error(error.message)
    else { toast.success('Account created! Please check your email to verify.'); navigate('/login') }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0F6E56 0%, #1a2b4a 100%)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>🏠 CasaCare</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '4px' }}>Create your account</p>
        </div>
        <div className="card card-pad">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your full name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone number</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" required minLength={8} />
            </div>

            <div className="form-group">
              <label className="form-label">I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {ROLES.map(r => (
                  <div key={r.value} onClick={() => set('role', r.value)} style={{ border: `2px solid ${form.role === r.value ? 'var(--teal)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius-sm)', padding: '10px 12px', cursor: 'pointer', background: form.role === r.value ? 'var(--teal-light)' : 'white', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: form.role === r.value ? 'var(--teal-dark)' : 'var(--gray-800)' }}>{r.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? <span className="spinner" /> : 'Create account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--gray-400)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--teal)', fontWeight: '500' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
