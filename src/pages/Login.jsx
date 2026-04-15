import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) toast.error(error.message)
    else { toast.success('Welcome back!'); navigate('/dashboard') }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* LEFT BRAND PANEL */}
      <div className="login-brand-panel" style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '60px',
        background: 'linear-gradient(145deg, #0F6E56 0%, #1a2b4a 60%, #0d1f3c 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Animated blobs */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(29,158,117,0.15)', top: '-80px', left: '-80px', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(29,158,117,0.1)', bottom: '100px', right: '-50px', animation: 'float 8s ease-in-out infinite 2s' }} />
        <div style={{ position: 'absolute', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(245,166,35,0.08)', bottom: '-40px', left: '30%', animation: 'float 7s ease-in-out infinite 1s' }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', animation: 'fadeInUp 0.8s ease both' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '36px'
          }}>🏠</div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '12px', letterSpacing: '-0.5px' }}>CasaCare</h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', marginBottom: '8px', fontWeight: '500' }}>Integrated 24×7 Property & Asset Hub</p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>One Unified Hub. Guaranteed Care.</p>
          
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '48px' }}>
            {[['🏠', 'Property Care'], ['🔧', 'Expert Service'], ['📊', 'Full Visibility']].map(([icon, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="login-form-panel" style={{
        width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 48px', background: '#F8FFFE', flexShrink: 0
      }}>
        <div style={{ width: '100%', animation: 'fadeInUp 0.6s ease 0.2s both' }}>
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '8px' }}>Welcome back</h2>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>Sign in to manage your properties</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? <><span className="spinner" style={{ width: '18px', height: '18px' }} /> Signing in...</> : 'Sign in to CasaCare →'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: '#9ca3af' }}>
            New to CasaCare?{' '}
            <Link to="/register" style={{ color: '#1D9E75', fontWeight: '700', textDecoration: 'none' }}>Create account →</Link>
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .login-brand-panel { display: none !important; }
          .login-form-panel { width: 100% !important; min-height: 100vh; padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  )
}
