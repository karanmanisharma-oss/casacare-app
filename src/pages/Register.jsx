import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'individual', icon: '🏠', label: 'Individual', desc: 'Home services & repairs' },
  { value: 'nri', icon: '✈️', label: 'NRI Owner', desc: 'Remote property management' },
  { value: 'corporate', icon: '🏢', label: 'Corporate', desc: 'Multi-property & AMC' },
  { value: 'field_force', icon: '🔧', label: 'Technician', desc: 'Field service provider' },
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
    else { toast.success('Account created! Check your email.'); navigate('/login') }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* LEFT PANEL */}
      <div className="register-brand-panel" style={{
        flex: 1, background: 'linear-gradient(145deg, #0F6E56 0%, #1a2b4a 60%, #0d1f3c 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(29,158,117,0.12)', top: '-60px', right: '-60px', animation: 'float 7s ease-in-out infinite' }} />
        <div style={{ position: 'relative', zIndex: 1, color: 'white', animation: 'fadeInUp 0.8s ease both' }}>
          <div style={{ fontSize: '60px', marginBottom: '24px', textAlign: 'center' }}>🏠</div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'center', marginBottom: '16px' }}>Join CasaCare</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: '1.7' }}>India's most trusted platform for<br/>property & asset management</p>
          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {['✅ 24×7 service availability', '✅ Verified technicians only', '✅ Photo proof of every job', '✅ NRI-friendly remote access'].map(f => (
              <div key={f} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="register-form-panel" style={{ width: '520px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', background: '#F8FFFE', overflowY: 'auto' }}>
        <div style={{ width: '100%', animation: 'fadeInUp 0.6s ease 0.2s both' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1f2937', marginBottom: '6px' }}>Create your account</h2>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>Choose your role to get started</p>
          </div>

          {/* ROLE SELECTOR */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {ROLES.map((r, i) => (
              <div key={r.value} onClick={() => set('role', r.value)}
                style={{
                  border: `2px solid ${form.role === r.value ? '#1D9E75' : '#e5e7eb'}`,
                  borderRadius: '12px', padding: '14px', cursor: 'pointer',
                  background: form.role === r.value ? '#E1F5EE' : 'white',
                  transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: form.role === r.value ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: form.role === r.value ? '0 4px 15px rgba(29,158,117,0.2)' : 'none',
                  animation: `fadeInUp 0.4s ease ${i * 0.08}s both`
                }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{r.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: "'Plus Jakarta Sans', sans-serif", color: form.role === r.value ? '#0F6E56' : '#1f2937' }}>{r.label}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{r.desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your full name" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" required minLength={8} />
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? <><span className="spinner" style={{ width: '18px', height: '18px' }} /> Creating account...</> : 'Create my account →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#9ca3af' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1D9E75', fontWeight: '700', textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .register-brand-panel { display: none !important; }
          .register-form-panel { width: 100% !important; min-height: 100vh; padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  )
}
