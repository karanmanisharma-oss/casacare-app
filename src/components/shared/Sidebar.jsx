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
    {path:'/admin',icon:'⊞',label:'Dashboard'},
    {path:'/tickets',icon:'🎫',label:'All Tickets'},
    {path:'/admin/field-force',icon:'👷',label:'Field Force'},
  ],
}

const ROLE_META = {
  individual: {color:'#1D9E75', bg:'#E1F5EE', label:'Individual', dot:'#1D9E75'},
  nri: {color:'#1a2b4a', bg:'#eff6ff', label:'NRI Owner', dot:'#3b82f6'},
  corporate: {color:'#7c3aed', bg:'#f5f3ff', label:'Corporate HQ', dot:'#7c3aed'},
  field_force: {color:'#ea580c', bg:'#fff7ed', label:'Field Force', dot:'#ea580c'},
  admin: {color:'#1a2b4a', bg:'#E1F5EE', label:'Admin', dot:'#1D9E75'},
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const role = profile?.role || 'individual'
  const items = NAV[role] || NAV.individual
  const meta = ROLE_META[role]
  const initials = profile?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'CC'

  return (
    <aside style={{
      width:'256px', minHeight:'100vh', flexShrink:0,
      display:'flex', flexDirection:'column',
      background:'rgba(255,255,255,0.95)',
      backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)',
      borderRight:'1px solid rgba(29,158,117,0.1)',
      boxShadow:'4px 0 32px rgba(0,0,0,0.04)'
    }}>
      <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid rgba(29,158,117,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{
            width:'44px', height:'44px', flexShrink:0,
            background:'linear-gradient(135deg, #1D9E75, #0F6E56)',
            borderRadius:'14px',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'22px',
            boxShadow:'0 4px 16px rgba(29,158,117,0.35)'
          }}>🏠</div>
          <div>
            <div style={{ fontWeight:'800', fontSize:'17px', fontFamily:"'Plus Jakarta Sans',sans-serif", color:'#1a2b4a', letterSpacing:'-0.3px' }}>CasaCare</div>
            <div style={{ fontSize:'10px', color:'#9ca3af', fontWeight:'600', letterSpacing:'0.06em', textTransform:'uppercase' }}>Property Hub</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'12px 16px 4px' }}>
        <div style={{ background:meta.bg, borderRadius:'10px', padding:'9px 14px', display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:meta.dot, animation:'pulse 2.5s infinite' }}/>
          <span style={{ fontSize:'11px', fontWeight:'700', color:meta.color, fontFamily:"'Plus Jakarta Sans',sans-serif", textTransform:'uppercase', letterSpacing:'0.06em' }}>{meta.label}</span>
        </div>
      </div>

      <nav style={{ flex:1, padding:'8px 10px' }}>
        {items.map((item,i) => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={{
              display:'flex', alignItems:'center', gap:'12px',
              padding:'11px 14px', borderRadius:'12px', marginBottom:'3px',
              background: active ? 'linear-gradient(135deg, #E1F5EE 0%, #d1fae5 100%)' : 'transparent',
              color: active ? '#0F6E56' : '#4b5563',
              fontWeight: active ? '700' : '500',
              fontSize:'14px',
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              transition:'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              borderLeft: active ? '3px solid #1D9E75' : '3px solid transparent',
              textDecoration:'none',
              animation:`slideInLeft 0.35s ease ${i*0.06}s both`
            }}>
              <span style={{ fontSize:'17px', lineHeight:1 }}>{item.icon}</span>
              {item.label}
              {active && <div style={{ marginLeft:'auto', width:'6px', height:'6px', borderRadius:'50%', background:'#1D9E75', animation:'pulse 2s infinite' }}/>}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(29,158,117,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'12px', background:'#F7FFFE', marginBottom:'8px' }}>
          <div style={{
            width:'38px', height:'38px', flexShrink:0, borderRadius:'50%',
            background:'linear-gradient(135deg, #1D9E75, #0F6E56)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontSize:'13px', fontWeight:'800',
            fontFamily:"'Plus Jakarta Sans',sans-serif"
          }}>{initials}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:'13px', fontWeight:'700', color:'#1f2937', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile?.full_name || 'User'}</div>
            <div style={{ fontSize:'11px', color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile?.email}</div>
          </div>
        </div>
        <button onClick={signOut} className="btn btn-secondary btn-full btn-sm" style={{ borderRadius:'10px', fontSize:'13px' }}>Sign out</button>
      </div>
    </aside>
  )
}
