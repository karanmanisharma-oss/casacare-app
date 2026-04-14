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

const ROLE_COLORS = {
  individual: '#1D9E75',
  nri: '#1a2b4a',
  corporate: '#7c3aed',
  field_force: '#ea580c',
}

const ROLE_LABELS = {
  individual: 'Individual',
  nri: 'NRI Owner',
  corporate: 'Corporate HQ',
  field_force: 'Field Force',
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const role = profile?.role || 'individual'
  const navItems = NAV[role] || NAV.individual
  const color = ROLE_COLORS[role]

  return (
    <aside style={{ width: '240px', minHeight: '100vh', background: 'var(--white)', borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🏠</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--gray-800)' }}>CasaCare</div>
            <div style={{ fontSize: '11px', color: color, fontWeight: '600' }}>{ROLE_LABELS[role]}</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 12px' }}>
        {navItems.map(item => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', marginBottom: '2px', background: active ? `${color}15` : 'transparent', color: active ? color : 'var(--gray-600)', fontWeight: active ? '600' : '400', fontSize: '14px', transition: 'all 0.12s' }}>
              <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid var(--gray-100)' }}>
        <div style={{ padding: '10px 12px', marginBottom: '4px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'User'}</div>
          <div style={{ fontSize: '11px', color: 'var(--gray-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
        </div>
        <button onClick={signOut} className="btn btn-secondary btn-full btn-sm">Sign out</button>
      </div>
    </aside>
  )
}
