import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const ROLES = [
  { value:'individual', icon:'🏠', label:'Individual', desc:'Home repairs & services', color:'#1D9E75', bg:'#E1F5EE' },
  { value:'nri', icon:'✈️', label:'NRI Owner', desc:'Remote property mgmt', color:'#1a2b4a', bg:'#eff6ff' },
  { value:'corporate', icon:'🏢', label:'Corporate', desc:'Multi-property & AMC', color:'#7c3aed', bg:'#f5f3ff' },
  { value:'field_force', icon:'🔧', label:'Technician', desc:'Field service provider', color:'#ea580c', bg:'#fff7ed' },
]

export default function Register() {
  const [form, setForm] = useState({ email:'', password:'', fullName:'', role:'individual', phone:'' })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fullName.trim()) { toast.error('Please enter your name'); return }
    if (!form.email.trim()) { toast.error('Please enter your email'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error } = await signUp(form.email.trim().toLowerCase(), form.password, form.fullName.trim(), form.role)
    setLoading(false)
    if (error) toast.error(error.message)
    else { toast.success('Account created! Please sign in.'); navigate('/login') }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>

      {/* LEFT */}
      <div className="reg-brand" style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'60px 48px',
        background:'linear-gradient(145deg, #060f1e 0%, #0a1f16 40%, #0F6E56 100%)',
        position:'relative', overflow:'hidden'
      }}>
        <div style={{ position:'absolute', width:260, height:260, borderRadius:'50%', background:'rgba(29,158,117,0.08)', top:-80, right:-80, animation:'float 7s ease-in-out infinite' }}/>
        <div style={{ position:'relative', zIndex:1, color:'white', maxWidth:'360px' }}>
          <div style={{ fontSize:'52px', marginBottom:'20px' }}>🏠</div>
          <h1 style={{ fontSize:'38px', fontWeight:'800', fontFamily:'var(--font-display)', marginBottom:'16px', letterSpacing:'-0.03em' }}>Join CasaCare</h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'15px', lineHeight:'1.7', marginBottom:'36px' }}>
            India's most trusted platform for property & asset management
          </p>
          {['✅ Verified expert technicians only',
            '✅ Photo & video proof of every job',
            '✅ NRI-friendly remote property access',
            '✅ 24×7 emergency support',
            '✅ Transparent pricing always'
          ].map((f,i) => (
            <div key={f} style={{ color:'rgba(255,255,255,0.8)', fontSize:'14px', fontWeight:'500', marginBottom:'12px', animation:`slideLeft 0.4s ease ${i*0.08}s both` }}>{f}</div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="reg-form" style={{
        width:'520px', flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'44px 48px', background:'white', overflowY:'auto'
      }}>
        <div style={{ width:'100%', animation:'fadeUp 0.6s ease 0.15s both' }}>
          <div style={{ marginBottom:'26px' }}>
            <h2 style={{ fontSize:'28px', fontWeight:'800', fontFamily:'var(--font-display)', color:'var(--gray-800)', marginBottom:'6px', letterSpacing:'-0.02em' }}>Create your account</h2>
            <p style={{ fontSize:'14px', color:'var(--gray-400)' }}>Choose your role to personalise your experience</p>
          </div>

          {/* Role selector */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'24px' }}>
            {ROLES.map((r,i) => (
              <div key={r.value} onClick={()=>set('role',r.value)} style={{
                border:`2px solid ${form.role===r.value ? r.color : 'var(--gray-200)'}`,
                borderRadius:'var(--r-md)', padding:'14px 12px', cursor:'pointer',
                background: form.role===r.value ? r.bg : 'white',
                transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                transform: form.role===r.value ? 'scale(1.03)' : 'scale(1)',
                boxShadow: form.role===r.value ? `0 6px 20px ${r.color}28` : 'none',
                animation:`scaleIn 0.35s ease ${i*0.07}s both`
              }}>
                <div style={{ fontSize:'22px', marginBottom:'6px' }}>{r.icon}</div>
                <div style={{ fontSize:'13px', fontWeight:'700', fontFamily:'var(--font-display)', color: form.role===r.value ? r.color : 'var(--gray-800)' }}>{r.label}</div>
                <div style={{ fontSize:'11px', color:'var(--gray-400)', marginTop:'2px', lineHeight:'1.3' }}>{r.desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" value={form.fullName}
                onChange={e=>set('fullName',e.target.value)}
                placeholder="Your full name" required/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e=>set('email',e.target.value)}
                  placeholder="you@example.com" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone}
                  onChange={e=>set('phone',e.target.value)}
                  placeholder="+91 98765 43210"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password}
                onChange={e=>set('password',e.target.value)}
                placeholder="Minimum 8 characters" required minLength={8}/>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{marginTop:'6px'}}>
              {loading ? <><span className="spinner" style={{width:'18px',height:'18px'}}/>Creating account...</> : 'Create my account →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'var(--gray-400)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--teal)', fontWeight:'700', textDecoration:'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .reg-brand { display:none !important; }
          .reg-form { width:100% !important; padding:36px 22px !important; }
        }
      `}</style>
    </div>
  )
}
