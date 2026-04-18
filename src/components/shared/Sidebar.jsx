import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV = {
  individual: [
    {path:'/dashboard',icon:'⊞',label:'Dashboard'},
    {path:'/tickets',icon:'🎫',label:'My Tickets'},
    {path:'/book',icon:'📅',label:'Book Service'},
  ],
  nri: [
    {path:'/dashboard',icon:'⊞',label:'Dashboard'},
    {path:'/properties',icon:'🏠',label:'My Properties'},
    {path:'/tickets',icon:'🎫',label:'Service Tickets'},
    {path:'/reports',icon:'📷',label:'Visual Reports'},
  ],
  corporate: [
    {path:'/dashboard',icon:'⊞',label:'Dashboard'},
    {path:'/tickets',icon:'🎫',label:'All Tickets'},
    {path:'/amc',icon:'📋',label:'AMC Contracts'},
    {path:'/sla',icon:'📊',label:'SLA Tracker'},
    {path:'/team',icon:'👥',label:'Team'},
  ],
  field_force: [
    {path:'/dashboard',icon:'⊞',label:'Dashboard'},
    {path:'/my-jobs',icon:'🔧',label:'My Jobs'},
    {path:'/scan',icon:'📷',label:'Scan Asset'},
    {path:'/proof',icon:'✅',label:'Submit Proof'},
  ],
  admin: [
    {path:'/admin',icon:'⚙️',label:'Control Centre'},
    {path:'/tickets',icon:'🎫',label:'All Tickets'},
    {path:'/admin/field-force',icon:'👷',label:'Field Force'},
  ],
}

const ROLE_META = {
  individual: {color:'#1D9E75',bg:'#E1F5EE',label:'Individual',dot:'#1D9E75'},
  nri: {color:'#1a2b4a',bg:'#eff6ff',label:'NRI Owner',dot:'#3b82f6'},
  corporate: {color:'#7c3aed',bg:'#f5f3ff',label:'Corporate HQ',dot:'#7c3aed'},
  field_force: {color:'#ea580c',bg:'#fff7ed',label:'Field Force',dot:'#ea580c'},
  admin: {color:'#0F6E56',bg:'#E1F5EE',label:'Admin',dot:'#1D9E75'},
}

export default function Sidebar() {
  const {profile, signOut} = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = profile?.role || 'individual'
  const items = NAV[role] || NAV.individual
  const meta = ROLE_META[role] || ROLE_META.individual
  const initials = profile?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'CC'

  const SidebarInner = () => (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {/* Logo */}
      <div style={{padding:'22px 18px 14px',borderBottom:'1px solid rgba(29,158,117,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'11px'}}>
          <img
            src="/brand/logo.jpg"
            alt="CasaCare"
            style={{ width:'30px', height:'30px', objectFit:'contain' }}
            onError={e => {
              e.target.outerHTML = '<span style="font-size:20px">🏠</span>'
            }}
          />
          <div>
            <div style={{fontWeight:'800',fontSize:'16px',fontFamily:'var(--font-display)',color:'var(--navy)',letterSpacing:'-0.02em'}}>CasaCare</div>
            <div style={{fontSize:'10px',color:'var(--gray-400)',fontWeight:'600',letterSpacing:'0.06em',textTransform:'uppercase'}}>Property Hub</div>
          </div>
        </div>
        <button className="mobile-close-btn" onClick={()=>setMobileOpen(false)}
          style={{display:'none',background:'none',border:'none',fontSize:'22px',cursor:'pointer',color:'var(--gray-400)',padding:'4px'}}>✕</button>
      </div>

      {/* Role pill */}
      <div style={{padding:'10px 14px 4px'}}>
        <div style={{background:meta.bg,borderRadius:'10px',padding:'8px 13px',display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'7px',height:'7px',borderRadius:'50%',background:meta.dot,flexShrink:0,animation:'pulse 2.5s infinite'}}/>
          <span style={{fontSize:'11px',fontWeight:'700',color:meta.color,fontFamily:'var(--font-display)',textTransform:'uppercase',letterSpacing:'0.06em'}}>{meta.label}</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:'8px 10px',overflowY:'auto'}}>
        {items.map((item,i) => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path}
              onClick={()=>setMobileOpen(false)}
              style={{
                display:'flex',alignItems:'center',gap:'12px',
                padding:'11px 14px',borderRadius:'12px',marginBottom:'2px',
                background: active ? 'linear-gradient(135deg, #E1F5EE, #d1fae5)' : 'transparent',
                color: active ? '#0F6E56' : 'var(--gray-500)',
                fontWeight: active ? '700' : '500',
                fontSize:'14px',fontFamily:'var(--font-display)',
                borderLeft: active ? '3px solid var(--teal)' : '3px solid transparent',
                textDecoration:'none',
                transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                animation:`slideLeft 0.35s ease ${i*0.05}s both`
              }}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--teal-xlight)';e.currentTarget.style.color='var(--teal)';e.currentTarget.style.transform='translateX(3px)'}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--gray-500)';e.currentTarget.style.transform='translateX(0)'}}}>
              <span style={{fontSize:'17px',lineHeight:1}}>{item.icon}</span>
              {item.label}
              {active && <div style={{marginLeft:'auto',width:'6px',height:'6px',borderRadius:'50%',background:'var(--teal)',animation:'pulse 2s infinite'}}/>}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{padding:'12px 14px',borderTop:'1px solid rgba(29,158,117,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px',borderRadius:'12px',background:'var(--bg)',marginBottom:'8px'}}>
          <div style={{
            width:'38px',height:'38px',flexShrink:0,borderRadius:'50%',
            background:'linear-gradient(135deg, #1D9E75, #0F6E56)',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'white',fontSize:'13px',fontWeight:'800',
            fontFamily:'var(--font-display)',
            boxShadow:'0 2px 8px rgba(29,158,117,0.3)'
          }}>{initials}</div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:'13px',fontWeight:'700',color:'var(--gray-800)',fontFamily:'var(--font-display)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.full_name || 'User'}</div>
            <div style={{fontSize:'11px',color:'var(--gray-400)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.email}</div>
          </div>
        </div>
        <button onClick={signOut} className="btn btn-secondary btn-full btn-sm" style={{borderRadius:'10px',fontSize:'13px'}}>Sign out</button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar" style={{
        display:'none',position:'fixed',top:0,left:0,right:0,
        height:'58px',background:'white',
        borderBottom:'1px solid rgba(29,158,117,0.1)',
        zIndex:200,alignItems:'center',padding:'0 16px',
        gap:'12px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'
      }}>
        <button onClick={()=>setMobileOpen(true)} style={{background:'none',border:'none',fontSize:'22px',cursor:'pointer',padding:'4px',color:'var(--navy)'}}>☰</button>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <img
            src="/brand/logo.jpg"
            alt="CasaCare"
            style={{ width:'30px', height:'30px', objectFit:'contain' }}
            onError={e => {
              e.target.outerHTML = '<span style="font-size:20px">🏠</span>'
            }}
          />
          <span style={{fontWeight:'800',fontSize:'16px',fontFamily:'var(--font-display)',color:'var(--navy)'}}>CasaCare</span>
        </div>
        <div style={{marginLeft:'auto',width:'34px',height:'34px',borderRadius:'50%',background:'linear-gradient(135deg,#1D9E75,#0F6E56)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'13px',fontWeight:'800',fontFamily:'var(--font-display)'}}>{initials}</div>
      </div>

      {/* Overlay */}
      {mobileOpen && <div onClick={()=>setMobileOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:300,backdropFilter:'blur(4px)'}}/>}

      {/* Desktop sidebar */}
      <aside style={{
        width:'254px',minHeight:'100vh',flexShrink:0,
        background:'rgba(255,255,255,0.97)',
        backdropFilter:'blur(24px)',
        borderRight:'1px solid rgba(29,158,117,0.08)',
        boxShadow:'4px 0 32px rgba(0,0,0,0.04)',
        position:'relative',zIndex:10
      }} className="desktop-sidebar">
        <SidebarInner/>
      </aside>

      {/* Mobile drawer */}
      <div style={{
        position:'fixed',top:0,left:0,bottom:0,
        width:'280px',background:'white',zIndex:400,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: mobileOpen ? '4px 0 40px rgba(0,0,0,0.18)' : 'none',
        overflowY:'auto'
      }} className="mobile-drawer">
        <SidebarInner/>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display:none !important; }
          .mobile-topbar { display:flex !important; }
          .mobile-close-btn { display:block !important; }
        }
      `}</style>
    </>
  )
}
