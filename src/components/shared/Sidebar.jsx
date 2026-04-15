import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV = {
  individual: [
    { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/tickets', icon: '🎫', label: 'My Tickets' },
    { path: '/book', icon: '📅', label: 'Book Service' },
  ],
  nri: [
    { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/properties', icon: '🏠', label: 'My Properties' },
    { path: '/tickets', icon: '🎫', label: 'Service Tickets' },
    { path: '/reports', icon: '📷', label: 'Visual Reports' },
  ],
  corporate: [
    { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/tickets', icon: '🎫', label: 'All Tickets' },
    { path: '/amc', icon: '📋', label: 'AMC Contracts' },
    { path: '/sla', icon: '📊', label: 'SLA Tracker' },
    { path: '/team', icon: '👥', label: 'Team' },
  ],
  field_force: [
    { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/my-jobs', icon: '🔧', label: 'My Jobs' },
    { path: '/scan', icon: '📷', label: 'Scan Asset' },
    { path: '/proof', icon: '✅', label: 'Submit Proof' },
  ],
}

const ROLE_META = {
  individual: { color: '#1D9E75', bg: '#E1F5EE', label: 'Individual' },
  nri: { color: '#1a2b4a', bg: '#eff6ff', label: 'NRI Owner' },
  corporate: { color: '#7c3aed', bg: '#f5f3ff', label: 'Corporate HQ' },
  field_force: { color: '#ea580c', bg: '#fff7ed', label: 'Field Force' },
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const role = profile?.role || 'individual'
  const navItems = NAV[role] || NAV.individual
  const meta = ROLE_META[role]
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <aside style={{
      width: '250px', minHeight: '100vh', flexShrink: 0,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(29,158,117,0.1)',
      display: 'flex', flexDirection: 'column',
      boxShadow: '4px 0 24px rgba(0,0,0,0.04)'
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(29,158,117,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', boxShadow: '0 4px 12px rgba(29,158,117,0.3)'
          }}>🏠</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1f2937' }}>CasaCare</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Property Hub</div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{ background: meta.bg, borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color, animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: meta.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meta.label}</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {navItems.map((item, i) => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', borderRadius: '10px', marginBottom: '2px',
              background: active ? 'linear-gradient(135deg, #E1F5EE, #d1fae5)' : 'transparent',
              color: active ? '#0F6E56' : '#4b5563',
              fontWeight: active ? '700' : '500',
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.2s',
              borderLeft: active ? '3px solid #1D9E75' : '3px solid transparent',
              textDecoration: 'none',
              animation: `slideInLeft 0.3s ease ${i * 0.05}s both`
            }}>
              <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
              {item.label}
              {active && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#1D9E75' }} />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(29,158,117,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', background: '#F8FFFE', marginBottom: '8px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '13px', fontWeight: '800', flexShrink: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'User'}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
          </div>
        </div>
        <button onClick={signOut} className="btn btn-secondary btn-full btn-sm" style={{ borderRadius: '8px' }}>Sign out</button>
      </div>
    </aside>
  )
}
