import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const SERVICES = [
  { icon: '❄️', label: 'AC Repair', category: 'ac' },
  { icon: '💧', label: 'RO / Water', category: 'ro' },
  { icon: '🔧', label: 'Plumbing', category: 'plumbing' },
  { icon: '⚡', label: 'Electrical', category: 'electrical' },
  { icon: '🪵', label: 'Carpentry', category: 'carpentry' },
  { icon: '🚿', label: 'Geyser', category: 'geyser' },
  { icon: '🏠', label: 'Painting', category: 'painting' },
  { icon: '📦', label: 'Movers & Packers', category: 'logistics' },
]

export default function IndividualDashboard() {
  const { profile } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('tickets').select('*').eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => { setTickets(data || []); setLoading(false) })
  }, [profile])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{greeting}, {profile?.full_name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">What service do you need today?</p>
      </div>

      <div className="stat-grid">
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

      <div className="card card-pad" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-800)' }}>Book a service</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {SERVICES.map(s => (
            <Link key={s.category} to={`/book?category=${s.category}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px 8px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', textAlign: 'center', transition: 'all 0.15s', color: 'var(--gray-700)', fontSize: '12px', fontWeight: '500' }}>
              <span style={{ fontSize: '24px' }}>{s.icon}</span>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="card card-pad">
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
    </div>
  )
}

function TicketRow({ ticket }) {
  const statusColors = { open: 'badge-amber', in_progress: 'badge-navy', scheduled: 'badge-teal', closed: 'badge-green', cancelled: 'badge-gray' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--gray-800)' }}>{ticket.title}</div>
        <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{new Date(ticket.created_at).toLocaleDateString('en-IN')}</div>
      </div>
      <span className={`badge ${statusColors[ticket.status] || 'badge-gray'}`}>{ticket.status?.replace('_', ' ')}</span>
    </div>
  )
}
