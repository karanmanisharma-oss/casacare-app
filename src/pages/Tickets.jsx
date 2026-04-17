import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { formatDate } from '../utils/date'
import PaymentModal from '../components/shared/PaymentModal'
import { getErrorMessage, errorMessageIncludes } from '../utils/error'

const CATEGORIES = ['AC Repair', 'RO / Water Purifier', 'Plumbing', 'Electrical', 'Carpentry', 'Geyser', 'Washing Machine', 'Painting', 'Civil Work', 'Movers & Packers', 'Other']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']

export default function Tickets() {
  const { profile } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'AC Repair', priority: 'medium', address: '' })
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')
  const [payingTicket, setPayingTicket] = useState(null)
  const [viewingTicket, setViewingTicket] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function load() {
    try {
      let q = supabase.from('tickets').select('*').order('created_at', { ascending: false })
      if (profile?.role === 'individual' || profile?.role === 'nri') q = q.eq('user_id', profile.id)
      if (profile?.role === 'field_force') q = q.eq('assigned_to', profile.id)
      const { data, error } = await q
      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error(error)
      toast.error('Could not load tickets')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [profile])

  async function createTicket(e) {
    e.preventDefault()
    
    // Validate all required fields
    if (!form.title.trim()) { toast.error('Please enter an issue title'); return }
    if (!form.category) { toast.error('Please select a service category'); return }
    if (!form.address.trim()) { toast.error('Please enter your service address'); return }
    if (form.title.trim().length < 5) { toast.error('Title must be at least 5 characters'); return }

    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        toast.error('Session expired. Please sign in again.')
        setSaving(false)
        return
      }

      const { error } = await supabase.from('tickets').insert({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        address: form.address.trim(),
        user_id: session.user.id,
        status: 'open',
        has_photos: false,
        ticket_type: 'rm',
      })

      if (error) {
        console.error('Ticket error:', error)
        if (errorMessageIncludes(error, ['foreign key'])) {
          toast.error('Profile error. Please sign out and sign back in.')
        } else {
          toast.error(getErrorMessage(error, 'Could not raise ticket. Please try again.'))
        }
      } else {
        toast.success('Service request raised! We will assign a technician shortly.')
        setShowNew(false)
        setForm({ title: '', description: '', category: 'AC Repair', priority: 'medium', address: '' })
        load()
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error. Please check your connection and try again.')
    }
    setSaving(false)
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)
  const statusColors = { open: 'badge-amber', in_progress: 'badge-navy', scheduled: 'badge-teal', closed: 'badge-green', cancelled: 'badge-gray' }
  const priorityColors = { low: 'badge-gray', medium: 'badge-teal', high: 'badge-amber', urgent: 'badge-red' }

  return (
    <div>
      <div className="card card-pad" style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Service Tickets</h1>
            <p className="page-subtitle">Raise and track all your service requests</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Ticket</button>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'open', 'in_progress', 'scheduled', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}>{s.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="card card-pad" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Raise a new ticket</h2>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--gray-400)', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={createTicket}>
              <div className="form-group">
                <label className="form-label">Issue title *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. AC not cooling in bedroom" required />
              </div>
              <div className="form-group">
                <label className="form-label">Service category *</label>
                <select className="form-input form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Service address</label>
                <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Flat / House number, Society, City" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the issue in detail..." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary btn-full" onClick={() => setShowNew(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={saving}>{saving ? <span className="spinner" /> : 'Raise ticket'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ padding: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton skeleton-card" style={{ marginBottom: '10px' }} />
            ))}
          </div>
        )
          : filtered.length === 0
          ? <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-400)', fontSize: '14px' }}>No tickets found. Click "+ New Ticket" to get started.</div>
          : filtered.map(t => (
            <div key={t.id} className="ticket-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--gray-800)', marginBottom: '4px' }}>{t.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                  #{t.id?.slice(0, 8)} · {t.category} · {formatDate(t.created_at, 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {t.address && ` · ${t.address}`}
                </div>
                <div style={{ fontSize: '11px', color: '#0f766e', marginTop: '4px' }}>
                  payment {t.payment_status || 'pending'} | amount {t.payment_amount ?? 'TBD'}
                </div>
                {t.description && <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '6px' }}>{t.description}</div>}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                <span className={`badge ${statusColors[t.status] || 'badge-gray'}`}>{t.status?.replace('_', ' ')}</span>
                <span className={`badge ${priorityColors[t.priority] || 'badge-gray'}`}>{t.priority}</span>
                {t.has_photos && (
                  <button
                    onClick={() => setViewingTicket(t.id)}
                    style={{ padding: '5px 12px', background: '#f0fdf4', color: '#166534', border: '1.5px solid #bbf7d0', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    📷 View Proof
                  </button>
                )}
                {t.status === 'closed' && t.payment_status !== 'paid' && (
                  <button onClick={() => setPayingTicket(t)} style={{
                    padding: '6px 14px', background: '#1D9E75', color: 'white',
                    border: 'none', borderRadius: '8px', fontSize: '12px',
                    fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif"
                  }}>Pay Now</button>
                )}
              </div>
            </div>
          ))
        }
      </div>
      {payingTicket && (
        <PaymentModal
          ticket={payingTicket}
          amount={payingTicket.payment_amount || 500}
          onClose={() => setPayingTicket(null)}
          onSuccess={() => { setPayingTicket(null); load() }}
        />
      )}
      {viewingTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: '800', color: '#1a2b4a' }}>Service Proof</h3>
              <button onClick={() => setViewingTicket(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <TicketPhotos ticketId={viewingTicket} />
          </div>
        </div>
      )}
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

function TicketPhotos({ ticketId }) {
  const [photos, setPhotos] = useState([])
  useEffect(() => {
    supabase.from('ticket_photos').select('*').eq('ticket_id', ticketId)
      .then(({ data }) => setPhotos(data || []))
  }, [ticketId])
  return photos.length === 0 ? (
    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No photos yet</p>
  ) : (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
      {photos.map(p => (
        <img key={p.id} src={p.url} alt="proof" style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', height: '150px' }} />
      ))}
    </div>
  )
}
