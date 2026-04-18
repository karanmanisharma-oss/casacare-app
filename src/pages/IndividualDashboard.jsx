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

  useEffect(() => {
    const h = new Date().getHours()
    const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
    const name = profile?.full_name?.split(' ')[0] || ''
    const el = document.getElementById('hero-greet')
    if (el) el.textContent = `${g}${name ? ', ' + name : ''}! 👋`
  }, [profile])

  return (
    <div className="anim-fade-up">
      {/* Hero */}
      <div style={{
        borderRadius:'24px', overflow:'hidden',
        marginBottom:'28px', position:'relative', minHeight:'200px',
        background:'linear-gradient(135deg, #1a2b4a 0%, #0F6E56 100%)',
      }}>
        <img
          src="/brand/tech-male.jpg"
          alt=""
          style={{
            position:'absolute', right:0, top:0, bottom:0,
            width:'45%', height:'100%',
            objectFit:'cover', objectPosition:'center top',
            opacity:0.55,
            maskImage:'linear-gradient(to left, black 40%, transparent 100%)',
            WebkitMaskImage:'linear-gradient(to left, black 40%, transparent 100%)'
          }}
          onError={e => { e.target.style.display='none' }}
        />
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(90deg, rgba(26,43,74,0.92) 40%, rgba(26,43,74,0.1) 100%)'
        }}/>
        <div style={{ position:'relative', zIndex:1, padding:'32px', color:'white' }}>
          <img
            src="/brand/logo.jpg"
            alt="CasaCare"
            style={{
              width:'42px', height:'42px', objectFit:'contain',
              borderRadius:'10px', background:'rgba(255,255,255,0.15)',
              padding:'5px', marginBottom:'14px'
            }}
            onError={e => { e.target.style.display='none' }}
          />
          <h2 id="hero-greet" style={{
            fontSize:'26px', fontWeight:'800',
            fontFamily:"'Plus Jakarta Sans',sans-serif",
            marginBottom:'6px', letterSpacing:'-0.02em'
          }}>Good morning! 👋</h2>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.8)', marginBottom:'20px' }}>
            What service do you need today?
          </p>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {['⚡ Electrician','🔧 Plumbing','❄️ AC Repair'].map(s => (
              <span
                key={s}
                role="button"
                tabIndex={0}
                onClick={() => navigate('/book')}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate('/book') }}
                style={{
                  padding:'7px 16px',
                  background:'rgba(255,255,255,0.15)',
                  borderRadius:'99px', color:'white',
                  fontSize:'12px', fontWeight:'600',
                  backdropFilter:'blur(8px)',
                  border:'1px solid rgba(255,255,255,0.2)',
                  cursor:'pointer'
                }}
              >{s}</span>
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
