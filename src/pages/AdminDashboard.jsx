import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { formatDate } from '../utils/date'
import { notifyBookingLifecycle } from '../lib/bookingLifecycleNotify'

const STATUS_BADGE = {
  open: 'badge-amber',
  scheduled: 'badge-navy',
  in_progress: 'badge-navy',
  closed: 'badge-green',
  cancelled: 'badge-gray',
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [tickets, setTickets] = useState([])
  const [fieldForce, setFieldForce] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tickets')
  const [viewingPhotos, setViewingPhotos] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const [{ data: tix, error: tixError }, { data: ff, error: ffError }] = await Promise.all([
        supabase
          .from('tickets')
          .select(
            '*, customer:profiles!user_id(full_name,phone,email), assignee:profiles!assigned_to(full_name,phone)',
          )
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'field_force'),
      ])
      if (tixError) throw tixError
      if (ffError) throw ffError
      setTickets(tix || [])
      setFieldForce(ff || [])
    } catch (error) {
      console.error(error)
      toast.error('Could not load admin data')
      setTickets([])
      setFieldForce([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function assignTicket(ticketId, fieldForceId) {
    if (!fieldForceId) return
    const { error } = await supabase
      .from('tickets')
      .update({
        assigned_to: fieldForceId,
        status: 'scheduled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
    if (error) {
      toast.error(error.message)
      return
    }

    await supabase
      .from('notifications')
      .insert({
        user_id: fieldForceId,
        ticket_id: ticketId,
        message: 'You have been assigned a new job. Please check your jobs list.',
        type: 'job_assigned',
        read: false,
        created_at: new Date().toISOString(),
      })
      .then(({ error: notifError }) => {
        if (notifError) console.log('Notification table not yet created, skipping')
      })

    toast.success('Ticket assigned! Field force notified.')
    loadData()
  }

  async function updateStatus(ticketId, status) {
    const updates = { status }
    if (status === 'closed') updates.closed_at = new Date().toISOString()
    const { error } = await supabase.from('tickets').update(updates).eq('id', ticketId)
    if (error) toast.error(error.message)
    else {
      toast.success('Status updated!')
      if (status === 'closed') {
        notifyBookingLifecycle(ticketId, 'service_completed').catch(() => {})
      }
      loadData()
    }
  }

  function statFilterFromLabel(label) {
    return label.toLowerCase().replace(/\s+/g, '_')
  }

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)
  const open = tickets.filter((t) => t.status === 'open').length
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length
  const scheduled = tickets.filter((t) => t.status === 'scheduled').length
  const closed = tickets.filter((t) => t.status === 'closed').length

  if (!profile) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-teal" style={{ width: '32px', height: '32px' }} />
      </div>
    )
  }

  if (profile.role !== 'admin') {
    return (
      <div className="empty-state">
        <span className="empty-icon">🔒</span>
        <div className="empty-title">Access Denied</div>
        <p className="empty-desc">You need admin privileges to view this page.</p>
      </div>
    )
  }

  const statCards = [
    { label: 'Open', value: open, accent: 'var(--amber)', bg: '#fffbeb', border: 'rgba(245, 158, 11, 0.35)' },
    { label: 'Scheduled', value: scheduled, accent: '#3b82f6', bg: '#eff6ff', border: 'rgba(59, 130, 246, 0.35)' },
    { label: 'In Progress', value: inProgress, accent: '#8b5cf6', bg: '#f5f3ff', border: 'rgba(139, 92, 246, 0.35)' },
    { label: 'Closed', value: closed, accent: 'var(--green)', bg: '#f0fdf4', border: 'rgba(16, 185, 129, 0.35)' },
  ]

  return (
    <div className="anim-fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">Admin Control Centre</h1>
          <p className="page-subtitle">Tickets, assignments, and field team</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={loadData}>
          Refresh
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {statCards.map((s) => (
          <button
            type="button"
            key={s.label}
            onClick={() => setFilter(statFilterFromLabel(s.label))}
            className="card card-pad card-hover"
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              border: `1px solid ${s.border}`,
              background: s.bg,
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '800', color: s.accent, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-display)' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--gray-800)', marginTop: '8px', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {s.value}
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('tickets')}
        >
          🎫 All Tickets
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'field_force' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('field_force')}
        >
          👷 Field Force
        </button>
        {activeTab === 'tickets' && (
          <>
            {['all', 'open', 'scheduled', 'in_progress', 'closed'].map((x) => (
              <button
                type="button"
                key={x}
                className={`btn btn-xs ${filter === x ? 'btn-navy' : 'btn-ghost'}`}
                onClick={() => setFilter(x)}
              >
                {x.replace('_', ' ')}
              </button>
            ))}
          </>
        )}
      </div>

      {activeTab === 'tickets' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading tickets…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎫</span>
              <div className="empty-title">No tickets</div>
              <p className="empty-desc">No tickets match the current filter.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {filtered.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(200px, 2fr) minmax(120px, 1fr) minmax(100px, 0.8fr) minmax(140px, 1fr) minmax(160px, 1.2fr)',
                    gap: '16px',
                    alignItems: 'start',
                    padding: '18px 20px',
                    borderBottom: '1px solid var(--gray-100)',
                    background: i % 2 === 0 ? 'var(--surface)' : 'var(--gray-50)',
                    minWidth: '720px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--gray-800)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                      👤 {t.customer?.full_name || 'Unknown'} · 📱 {t.customer?.phone || 'N/A'}
                    </div>
                    {t.address && <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>📍 {t.address}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-700)' }}>{t.category}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>{formatDate(t.created_at)}</div>
                  </div>
                  <div>
                    <span className={`badge ${STATUS_BADGE[t.status] || 'badge-gray'}`}>{t.status?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <select
                      value={t.assigned_to || ''}
                      onChange={(e) => assignTicket(t.id, e.target.value)}
                      className="form-input form-select"
                      style={{ fontSize: '12px', padding: '8px 10px' }}
                    >
                      <option value="">Assign to…</option>
                      {fieldForce.map((ff) => (
                        <option key={ff.id} value={ff.id}>{ff.full_name}</option>
                      ))}
                    </select>
                    {t.assignee && (
                      <div style={{ fontSize: '11px', color: 'var(--teal)', marginTop: '6px', fontWeight: '600' }}>✓ {t.assignee.full_name}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                    {t.has_photos && (
                      <button type="button" className="btn btn-ghost btn-xs" onClick={() => setViewingPhotos(t.id)}>
                        📷 Photos
                      </button>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {['open', 'scheduled', 'in_progress', 'closed']
                        .filter((s) => t.status !== s)
                        .map((s) => (
                          <button
                            type="button"
                            key={s}
                            className="btn btn-xs btn-secondary"
                            onClick={() => updateStatus(t.id, s)}
                          >
                            → {s.replace('_', ' ')}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'field_force' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {fieldForce.length === 0 ? (
            <div className="card card-pad" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state">
                <span className="empty-icon">👷</span>
                <div className="empty-title">No field force members</div>
                <p className="empty-desc">Register users with the Field Technician role.</p>
              </div>
            </div>
          ) : (
            fieldForce.map((ff) => {
              const activeJobs = tickets.filter(
                (ticket) => ticket.assigned_to === ff.id && ticket.status !== 'closed',
              ).length
              const initials = ff.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'FF'
              return (
                <div key={ff.id} className="card card-pad card-hover">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '800',
                        fontSize: '16px',
                        fontFamily: 'var(--font-display)',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--gray-800)', fontFamily: 'var(--font-display)' }}>{ff.full_name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{ff.phone || ff.email}</div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--gray-100)',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--gray-600)', fontWeight: '600' }}>Active jobs</span>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: activeJobs > 0 ? 'var(--orange)' : 'var(--green)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {activeJobs}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {viewingPhotos && <PhotoViewer ticketId={viewingPhotos} onClose={() => setViewingPhotos(null)} />}
    </div>
  )
}

function PhotoViewer({ ticketId, onClose }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('ticket_photos')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPhotos(data || []); setLoading(false) })
  }, [ticketId])

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', color: 'var(--navy)' }}>Proof of Service Photos</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--gray-400)' }} aria-label="Close">✕</button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)' }}>Loading photos…</div>
        ) : photos.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}>
            <p className="empty-desc">No photos uploaded yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {photos.map(p => (
              <div key={p.id} style={{ borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--gray-100)' }}>
                <img src={p.url} alt="Proof" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '8px 10px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{new Date(p.created_at).toLocaleString('en-IN')}</div>
                  {p.caption && <div style={{ fontSize: '12px', color: 'var(--gray-800)', fontWeight: '500', marginTop: '4px' }}>{p.caption}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
