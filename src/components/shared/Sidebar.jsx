import { useState } from 'react'
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
  admin: [
    { path: '/admin', icon: '⚙️', label: 'Control Centre' },
    { path: '/tickets', icon: '🎫', label: 'All Tickets' },
    { path: '/admin/field-force', icon: '👷', label: 'Field Force' },
  ],
}

const ROLE_META = {
  individual: { color: '#1D9E75', bg: '#E1F5EE', label: 'Individual', dot: '#1D9E75' },
  nri: { color: '#1a2b4a', bg: '#eff6ff', label: 'NRI Owner', dot: '#3b82f6' },
  corporate: { color: '#7c3aed', bg: '#f5f3ff', label: 'Corporate HQ', dot: '#7c3aed' },
  field_force: { color: '#ea580c', bg: '#fff7ed', label: 'Field Force', dot: '#ea580c' },
  admin: { color: '#0F6E56', bg: '#E1F5EE', label: 'Admin', dot: '#1D9E75' },
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = profile?.role || 'individual'
  const items = NAV[role] || NAV.individual
  const meta = ROLE_META[role] || ROLE_META.individual
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CC'

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(29,158,117,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/brand/logo.jpg" alt="CasaCare" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px' }} />
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#1a2b4a' }}>CasaCare</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Property Hub</div>
          </div>
        </div>
        {/* Mobile close button */}
        <button onClick={() => setMobileOpen(false)} style={{ display: 'none', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9ca3af', padding: '4px' }} className="mobile-close-btn">✕</button>
      </div>

      {/* Role pill */}
      <div style={{ padding: '10px 14px 4px' }}>
        <div style={{ background: meta.bg, borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: '700', color: meta.color, fontFamily: "'Plus Jakarta Sans',sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>{meta.label}</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        {items.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', marginBottom: '2px',
                background: active ? 'linear-gradient(135deg, #E1F5EE, #d1fae5)' : 'transparent',
                color: active ? '#0F6E56' : '#4b5563',
                fontWeight: active ? '700' : '500',
                fontSize: '14px',
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                borderLeft: active ? '3px solid #1D9E75' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: '17px', lineHeight: 1 }}>{item.icon}</span>
              {item.label}
              {active && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#1D9E75' }} />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(29,158,117,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', background: '#F7FFFE', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', fontFamily: "'Plus Jakarta Sans',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'User'}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
          </div>
        </div>
        <button onClick={signOut} style={{ width: '100%', padding: '8px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#4b5563' }}>Sign out</button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: '56px', background: 'white', borderBottom: '1px solid rgba(29,158,117,0.1)', zIndex: 200, alignItems: 'center', padding: '0 16px', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: '4px', color: '#1a2b4a' }}>☰</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/brand/logo.jpg" alt="CasaCare" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px' }} />
          <span style={{ fontWeight: '800', fontSize: '16px', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#1a2b4a' }}>CasaCare</span>
        </div>
        <div style={{ marginLeft: 'auto', width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '800' }}>{initials}</div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300 }} />
      )}

      {/* Sidebar — desktop always visible, mobile slides in */}
      <aside style={{
        width: '252px',
        minHeight: '100vh',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(29,158,117,0.1)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        position: 'relative',
        zIndex: 400,
      }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: '280px',
        background: 'white',
        zIndex: 400,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: mobileOpen ? '4px 0 32px rgba(0,0,0,0.15)' : 'none',
        overflowY: 'auto',
      }} className="mobile-drawer">
        <SidebarContent />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-close-btn { display: block !important; }
        }
      `}</style>
    </>
  )
}
