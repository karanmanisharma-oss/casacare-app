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
    <div style={{ minHeight:'100vh', display:'flex' }}>
      {/* LEFT — Brand Panel */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'60px 48px',
        background:'linear-gradient(145deg, #0a1628 0%, #0F6E56 50%, #1D9E75 100%)',
        position:'relative', overflow:'hidden'
      }}>
        {[
          {w:320,h:320,top:'-100px',left:'-100px',op:0.08},
          {w:200,h:200,bottom:'80px',right:'-60px',op:0.06},
          {w:150,h:150,bottom:'-50px',left:'20%',op:0.1},
        ].map((c,i) => (
          <div key={i} style={{
            position:'absolute', width:c.w, height:c.h, borderRadius:'50%',
            background:`rgba(29,158,117,${c.op})`,
            top:c.top, left:c.left, bottom:c.bottom, right:c.right,
            animation:`float ${6+i}s ease-in-out infinite`
          }}/>
        ))}
        <div style={{ position:'relative', zIndex:1, color:'white', maxWidth:'400px', animation:'fadeInUp 0.8s ease both' }}>
          <div style={{
            width:'72px', height:'72px',
            background:'rgba(255,255,255,0.15)',
            backdropFilter:'blur(12px)',
            border:'1px solid rgba(255,255,255,0.25)',
            borderRadius:'22px',
            display:'flex', alignItems:'center', justifyContent:'center',
            marginBottom:'24px', fontSize:'32px'
          }}>🏠</div>

          <h1 style={{ fontSize:'44px', fontWeight:'800', fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1.1, marginBottom:'12px', letterSpacing:'-1px' }}>CasaCare</h1>
          <p style={{ fontSize:'16px', color:'rgba(255,255,255,0.8)', fontWeight:'500', marginBottom:'6px' }}>Integrated 24×7 Property & Asset Hub</p>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', fontStyle:'italic', marginBottom:'48px' }}>Home. Health. Happiness.</p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {[
              ['🔧','Expert Technicians','Verified & trained'],
              ['📸','Photo Evidence','Every job documented'],
              ['🌍','NRI Friendly','Manage from anywhere'],
              ['⚡','24×7 Support','Always available'],
            ].map(([icon, title, sub]) => (
              <div key={title} style={{
                background:'rgba(255,255,255,0.08)',
                backdropFilter:'blur(8px)',
                borderRadius:'14px',
                padding:'14px',
                border:'1px solid rgba(255,255,255,0.12)'
              }}>
                <div style={{ fontSize:'20px', marginBottom:'6px' }}>{icon}</div>
                <div style={{ fontSize:'12px', fontWeight:'700', fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:'2px' }}>{title}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div style={{
        width:'480px', flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'60px 48px',
        background:'#F7FFFE'
      }}>
        <div style={{ width:'100%', animation:'fadeInUp 0.6s ease 0.2s both' }}>
          <div style={{ marginBottom:'36px' }}>
            <h2 style={{ fontSize:'30px', fontWeight:'800', fontFamily:"'Plus Jakarta Sans',sans-serif", color:'#1f2937', marginBottom:'8px', letterSpacing:'-0.5px' }}>Welcome back</h2>
            <p style={{ fontSize:'14px', color:'#9ca3af' }}>Sign in to your CasaCare account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/>
            </div>
            <div className="form-group" style={{ marginBottom:'24px' }}>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"/>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{width:'18px',height:'18px'}}/> Signing in...</>
                : 'Sign in to CasaCare →'
              }
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'24px 0' }}>
            <div style={{ flex:1, height:'1px', background:'#e5e7eb' }}/>
            <span style={{ fontSize:'12px', color:'#9ca3af', fontWeight:'500' }}>NEW TO CASACARE</span>
            <div style={{ flex:1, height:'1px', background:'#e5e7eb' }}/>
          </div>

          <Link to="/register" className="btn btn-secondary btn-full" style={{ textDecoration:'none' }}>
            Create a free account →
          </Link>

          <p style={{ textAlign:'center', marginTop:'24px', fontSize:'12px', color:'#9ca3af', lineHeight:'1.6' }}>
            By signing in you agree to CasaCare's<br/>
            <span style={{ color:'#1D9E75', fontWeight:'600' }}>Terms of Service</span> & <span style={{ color:'#1D9E75', fontWeight:'600' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
