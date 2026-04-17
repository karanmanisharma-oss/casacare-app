import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/date'

const SERVICES = [
  { icon: '⚡', label: 'Electrician', category: 'electrical', sub: 'RO · AC · Geyser · Washing Machine' },
  { icon: '🔧', label: 'Plumbing', category: 'plumbing', sub: 'Leaks · Pipes · Fixtures' },
  { icon: '🪵', label: 'Carpentry', category: 'carpentry', sub: 'Furniture · Doors · Windows' },
  { icon: '🏗️', label: 'Civil Work', category: 'civil', sub: 'Painting · Renovation' },
  { icon: '🌍', label: 'NRI Services', category: 'nri', sub: 'Remote property management' },
  { icon: '📦', label: 'Movers & Packers', category: 'logistics', sub: 'Home · Office shifting' },
  { icon: '📋', label: 'AMC', category: 'amc', sub: 'Annual maintenance contracts' },
  { icon: '🐾', label: 'Pet Care', category: 'pet', sub: 'Boarding · Grooming' },
]

const QUICK_PILLS = [
  { icon: '⚡', label: 'Electrician' },
  { icon: '🔧', label: 'Plumbing' },
  { icon: '❄️', label: 'AC Repair' },
]

export default function IndividualDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroImgOk, setHeroImgOk] = useState(true)

  useEffect(() => {
    supabase.from('tickets').select('*').eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => { setTickets(data || []); setLoading(false) })
  }, [profile])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="anim-fade-up">
      {/* Hero */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--r-xl)',
          overflow: 'hidden',
          marginBottom: '28px',
          minHeight: '220px',
          background: 'linear-gradient(135deg, var(--navy) 0%, #0d2137 45%, var(--teal-dark) 100%)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {heroImgOk && (
          <img
            src="/brand/tech-male.jpg"
            alt=""
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 'min(48%, 380px)',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              opacity: 0.95,
            }}
            onError={() => setHeroImgOk(false)}
          />
        )}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '28px 32px',
            maxWidth: heroImgOk ? '58%' : '100%',
          }}
        >
          <p style={{
            margin: '0 0 8px',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.85)',
            fontWeight: '600',
            fontFamily: 'var(--font-display)',
          }}>
            {greeting}, {firstName}! 👋
          </p>
          <h1 style={{
            margin: '0 0 10px',
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            color: 'white',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}>
            What service do you need today?
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
            Home. Health. Happiness.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '18px' }}>
            {QUICK_PILLS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => navigate('/book')}
                className="btn btn-sm"
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="stat-grid d1">
        <div className="stat-card">
          <div className="stat-label">Active Tickets</div>
          <div className="stat-value">{tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}</div>
          <div className="stat-sub">Awaiting service</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{tickets.filter(t => t.status === 'closed').length}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Upcoming</div>
          <div className="stat-value">{tickets.filter(t => t.status === 'scheduled').length}</div>
          <div className="stat-sub">Scheduled visits</div>
        </div>
      </div>

      <div className="card card-pad d2 card-hover" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '18px', color: 'var(--gray-800)', fontFamily: 'var(--font-display)' }}>
          Book a service
        </h2>
        <div className="service-grid">
          {SERVICES.map(s => (
            <div
              key={s.category}
              className="service-item"
              onClick={() => navigate('/book')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/book') }}
            >
              <div className="service-icon">{s.icon}</div>
              <span className="service-label">{s.label}</span>
              {s.sub && <span className="service-sub">{s.sub}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad d3">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--gray-800)', fontFamily: 'var(--font-display)' }}>Recent tickets</h2>
          <Link to="/tickets" className="text-teal" style={{ fontSize: '13px', fontWeight: '600' }}>View all →</Link>
        </div>
        {loading ? (
          <div style={{ padding: '8px 0' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎫</span>
            <div className="empty-title">No tickets yet</div>
            <p className="empty-desc">Book your first service using the grid above.</p>
          </div>
        ) : (
          tickets.map(t => <TicketRow key={t.id} ticket={t} />)
        )}
      </div>

      <a
        href="https://wa.me/919810223963?text=Hi%20CasaCare%2C%20I%20need%20help"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          background: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
          zIndex: 50,
          fontSize: '28px',
          textDecoration: 'none',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        💬
      </a>
    </div>
  )
}

function TicketRow({ ticket }) {
  const statusColors = { open: 'badge-amber', in_progress: 'badge-navy', scheduled: 'badge-teal', closed: 'badge-green', cancelled: 'badge-gray' }
  return (
    <div className="ticket-row">
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-800)', fontFamily: 'var(--font-display)' }}>{ticket.title}</div>
        <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>{formatDate(ticket.created_at)}</div>
      </div>
      <span className={`badge ${statusColors[ticket.status] || 'badge-gray'}`}>{ticket.status?.replace('_', ' ')}</span>
    </div>
  )
}
