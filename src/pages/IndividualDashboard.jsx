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

export default function IndividualDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('tickets').select('*').eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => { setTickets(data || []); setLoading(false) })
  }, [profile])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="animate-fade-up">
      <div className="hero-banner floating-panel">
        <div style={{position:'relative',zIndex:1}}>
          <p style={{margin:'0 0 4px',fontSize:'13px',color:'rgba(255,255,255,0.7)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.06em'}}>
            {greeting}, {firstName}! 👋
          </p>
          <h1 style={{margin:'0 0 8px',fontSize:'28px',fontWeight:'800',fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'-0.5px'}}>
            What service do you need today?
          </h1>
          <p style={{margin:0,color:'rgba(255,255,255,0.65)',fontSize:'14px'}}>
            Home. Health. Happiness.
          </p>
        </div>
      </div>

      <div className="stat-grid animate-fade-up delay-1">
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

      <div className="card card-pad animate-fade-up delay-2" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-800)' }}>Book a service</h2>
        <div className="service-grid">
          {SERVICES.map(s => (
            <div
              key={s.category}
              className="service-item floating-panel"
              onClick={() => navigate('/book')}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = '' }}
            >
              <div className="service-icon">{s.icon}</div>
              <span className="service-label">{s.label}</span>
              {s.sub && <span style={{ fontSize: '10px', color: 'var(--gray-400)', textAlign: 'center', lineHeight: 1.3, maxWidth: '100%' }}>{s.sub}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad animate-fade-up delay-3">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-800)' }}>Recent tickets</h2>
          <Link to="/tickets" style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: '500' }}>View all →</Link>
        </div>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}><div className="spinner" /></div>
          : tickets.length === 0
          ? <div style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)', fontSize: '14px' }}>No tickets yet — book your first service above!</div>
          : tickets.map(t => <TicketRow key={t.id} ticket={t} />)
        }
      </div>
      <a
        href="https://wa.me/919810223963?text=Hi%20CasaCare%2C%20I%20need%20help%20with%20a%20service"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '56px', height: '56px',
          background: '#25D366', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          zIndex: 50, fontSize: '28px', textDecoration: 'none',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >💬</a>
    </div>
  )
}

function TicketRow({ ticket }) {
  const statusColors = { open: 'badge-amber', in_progress: 'badge-navy', scheduled: 'badge-teal', closed: 'badge-green', cancelled: 'badge-gray' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--gray-800)' }}>{ticket.title}</div>
        <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{formatDate(ticket.created_at)}</div>
      </div>
      <span className={`badge ${statusColors[ticket.status] || 'badge-gray'}`}>{ticket.status?.replace('_', ' ')}</span>
    </div>
  )
}
