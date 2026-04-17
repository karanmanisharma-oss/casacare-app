import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { toast.error('Please enter your email'); return }
    if (!password.trim()) { toast.error('Please enter your password'); return }
    setLoading(true)
    const { error } = await signIn(email.trim().toLowerCase(), password)
    setLoading(false)
    if (error) {
      if (error.message.includes('Invalid login') || error.message.includes('invalid_credentials')) {
        toast.error('Wrong email or password. Please check and try again.')
      } else if (error.message.includes('rate limit')) {
        toast.error('Too many attempts. Please wait 5 minutes.')
      } else {
        toast.error('Could not sign in. Please try again.')
      }
    } else {
      toast.success('Welcome back!')
      navigate('/dashboard')
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    if (!resetEmail.trim()) { toast.error('Please enter your email'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(
      resetEmail.trim().toLowerCase(),
      { redirectTo: 'https://casacare-app.vercel.app/reset-password' }
    )
    setLoading(false)
    if (error) toast.error(error.message)
    else setResetSent(true)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>

      {/* LEFT — Brand Panel (hidden on mobile) */}
      <div className="login-brand" style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'60px 48px',
        background:'linear-gradient(145deg, #060f1e 0%, #0a1f16 40%, #0F6E56 100%)',
        position:'relative', overflow:'hidden'
      }}>
        {/* Animated orbs */}
        {[[320,320,'-100px','auto','-100px','auto',0.07,6],
          [200,200,'auto','-50px','120px','auto',0.05,8],
          [160,160,'auto','auto','-40px','30%',0.09,7]
        ].map(([w,h,top,right,bottom,left,op,dur],i) => (
          <div key={i} style={{
            position:'absolute', width:w, height:h, borderRadius:'50%',
            background:`rgba(29,158,117,${op})`,
            top,right,bottom,left,
            animation:`float ${dur}s ease-in-out infinite`,
            animationDelay:`${i*1.5}s`
          }}/>
        ))}

        <div style={{ position:'relative', zIndex:1, color:'white', maxWidth:'380px', width:'100%' }}>
          {/* Logo */}
          <div style={{ marginBottom:'32px' }}>
            <img src="/brand/logo.svg" alt="CasaCare"
              style={{ width:'64px', height:'64px', objectFit:'contain',
                background:'rgba(255,255,255,0.1)', borderRadius:'18px',
                padding:'10px', border:'1px solid rgba(255,255,255,0.15)' }}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
            />
            <div style={{ display:'none', width:'64px', height:'64px', background:'rgba(255,255,255,0.1)', borderRadius:'18px', alignItems:'center', justifyContent:'center', fontSize:'28px', border:'1px solid rgba(255,255,255,0.15)' }}>🏠</div>
          </div>

          <h1 style={{ fontSize:'48px', fontWeight:'800', fontFamily:'var(--font-display)', lineHeight:1.05, marginBottom:'14px', letterSpacing:'-0.03em' }}>Casa<span style={{ color:'#5DCAA5' }}>Care</span></h1>
          <p style={{ fontSize:'17px', color:'rgba(255,255,255,0.75)', fontWeight:'500', marginBottom:'6px' }}>Integrated 24×7 Property & Asset Hub</p>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', fontStyle:'italic', marginBottom:'48px' }}>Home. Health. Happiness.</p>

          {/* Trust cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {[
              ['🔧','Expert Technicians','Verified & trained'],
              ['📸','Photo Evidence','Every job documented'],
              ['🌍','NRI Friendly','Manage from anywhere'],
              ['⚡','24×7 Support','Always available'],
            ].map(([icon,title,sub]) => (
              <div key={title} style={{
                background:'rgba(255,255,255,0.06)',
                backdropFilter:'blur(12px)',
                borderRadius:'14px', padding:'16px',
                border:'1px solid rgba(255,255,255,0.1)',
                transition:'all 0.2s'
              }}>
                <div style={{ fontSize:'22px', marginBottom:'8px' }}>{icon}</div>
                <div style={{ fontSize:'12px', fontWeight:'700', fontFamily:'var(--font-display)', marginBottom:'3px' }}>{title}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div className="login-form" style={{
        width:'460px', flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'60px 44px', background:'white'
      }}>
        <div style={{ width:'100%', animation:'fadeUp 0.6s ease 0.15s both' }}>

          {!forgotMode ? (
            <>
              <div style={{ marginBottom:'36px' }}>
                <h2 style={{ fontSize:'30px', fontWeight:'800', fontFamily:'var(--font-display)', color:'var(--gray-800)', marginBottom:'8px', letterSpacing:'-0.02em' }}>Welcome back</h2>
                <p style={{ fontSize:'14px', color:'var(--gray-400)' }}>Sign in to your CasaCare account</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input className="form-input" type="email" value={email}
                    onChange={e=>setEmail(e.target.value)}
                    placeholder="you@example.com" required autoComplete="email"/>
                </div>
                <div className="form-group" style={{ marginBottom:'8px' }}>
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={password}
                    onChange={e=>setPassword(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password"/>
                </div>
                <div style={{ textAlign:'right', marginBottom:'24px' }}>
                  <button type="button" onClick={()=>setForgotMode(true)}
                    style={{ background:'none', border:'none', color:'var(--teal)', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'var(--font-display)' }}>
                    Forgot password?
                  </button>
                </div>
                <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                  {loading ? <><span className="spinner" style={{width:'18px',height:'18px'}}/>Signing in...</> : 'Sign in →'}
                </button>
              </form>

              <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'24px 0' }}>
                <div style={{ flex:1, height:'1px', background:'var(--gray-100)' }}/>
                <span style={{ fontSize:'12px', color:'var(--gray-300)', fontWeight:'600', letterSpacing:'0.05em' }}>NEW TO CASACARE</span>
                <div style={{ flex:1, height:'1px', background:'var(--gray-100)' }}/>
              </div>

              <Link to="/register" className="btn btn-secondary btn-full" style={{ textDecoration:'none' }}>
                Create a free account →
              </Link>
            </>
          ) : (
            <>
              {resetSent ? (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ fontSize:'56px', marginBottom:'20px', animation:'float 3s ease-in-out infinite' }}>📧</div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:'800', fontSize:'22px', color:'var(--gray-800)', marginBottom:'10px' }}>Check your email</h3>
                  <p style={{ fontSize:'14px', color:'var(--gray-400)', lineHeight:'1.7', marginBottom:'28px' }}>
                    We sent a reset link to <strong style={{color:'var(--gray-700)'}}>{resetEmail}</strong>.
                    Click the link to set a new password.
                  </p>
                  <button onClick={()=>{setForgotMode(false);setResetSent(false);setResetEmail('')}}
                    className="btn btn-primary btn-full">
                    Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={()=>setForgotMode(false)}
                    style={{ background:'none', border:'none', color:'var(--gray-400)', fontSize:'13px', cursor:'pointer', marginBottom:'24px', display:'flex', alignItems:'center', gap:'6px', fontFamily:'var(--font-display)', fontWeight:'600' }}>
                    ← Back to sign in
                  </button>
                  <h2 style={{ fontSize:'26px', fontWeight:'800', fontFamily:'var(--font-display)', color:'var(--gray-800)', marginBottom:'8px' }}>Reset password</h2>
                  <p style={{ fontSize:'14px', color:'var(--gray-400)', marginBottom:'28px' }}>Enter your email and we'll send a reset link.</p>
                  <form onSubmit={handleForgotPassword}>
                    <div className="form-group">
                      <label className="form-label">Registered email</label>
                      <input className="form-input" type="email" value={resetEmail}
                        onChange={e=>setResetEmail(e.target.value)}
                        placeholder="you@example.com" required/>
                    </div>
                    <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                      {loading ? <><span className="spinner" style={{width:'18px',height:'18px'}}/>Sending...</> : 'Send reset link →'}
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-brand { display:none !important; }
          .login-form { width:100% !important; padding:40px 24px !important; }
        }
      `}</style>
    </div>
  )
}
