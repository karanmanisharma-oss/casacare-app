import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const TICKET_SELECT = `
  *,
  profiles!user_id(full_name, phone),
  assigned_profile:profiles!assigned_to(full_name)
`

const STATUS_ORDER = ['open', 'scheduled', 'in_progress', 'closed']

function nextStatus(current) {
  const i = STATUS_ORDER.indexOf(current)
  if (i < 0 || i >= STATUS_ORDER.length - 1) return STATUS_ORDER[0]
  return STATUS_ORDER[i + 1]
}

const statusColors = {
  open: 'badge-amber',
  in_progress: 'badge-navy',
  scheduled: 'badge-teal',
  closed: 'badge-green',
  cancelled: 'badge-gray',
}

const priorityColors = { low: 'badge-gray', medium: 'badge-teal', high: 'badge-amber', urgent: 'badge-red' }

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [tickets, setTickets] = useState([])
  const [fieldForce, setFieldForce] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [assigningId, setAssigningId] = useState(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: tix, error: tErr }, { data: ff, error: fErr }] = await Promise.all([
      supabase.from('tickets').select(TICKET_SELECT).order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, phone, email, role').eq('role', 'field_force').order('full_name'),
    ])
    if (tErr) {
      console.error(tErr)
      toast.error(tErr.message)
    }
    if (fErr) {
      console.error(fErr)
      toast.error(fErr.message)
    }
    setTickets(tix || [])
    setFieldForce(ff || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (profile?.role !== 'admin') {
      navigate('/dashboard', { replace: true })
      return
    }
    load()
  }, [authLoading, profile?.role, navigate, load])

  useEffect(() => {
    if (location.pathname === '/admin/field-force') {
      const el = document.getElementById('admin-field-force')
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [location.pathname, loading])

  const activeJobCounts = useMemo(() => {
    const counts = {}
    fieldForce.forEach((f) => {
      counts[f.id] = tickets.filter(
        (t) =>
          t.assigned_to === f.id && ['open', 'scheduled', 'in_progress'].includes(t.status),
      ).length
    })
    return counts
  }, [tickets, fieldForce])

  const startOfToday = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'open').length
    const inProgress = tickets.filter((t) => t.status === 'in_progress').length
    const closedToday = tickets.filter((t) => {
      if (t.status !== 'closed') return false
      const ref = t.closed_at || t.updated_at
      if (!ref) return false
      return new Date(ref) >= startOfToday
    }).length
    const ffCount = fieldForce.length
    return { open, inProgress, closedToday, ffCount }
  }, [tickets, fieldForce.length, startOfToday])

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'all') return tickets
    return tickets.filter((t) => t.status === statusFilter)
  }, [tickets, statusFilter])

  async function handleAssign(ticketId, selectedUserId) {
    if (!selectedUserId) return
    setAssigningId(ticketId)
    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: selectedUserId, status: 'scheduled' })
      .eq('id', ticketId)
    setAssigningId(null)
    if (error) {
      console.error(error)
      toast.error(error.message)
      return
    }
    toast.success('Ticket assigned and marked scheduled')
    load()
  }

  async function handleStatusAdvance(ticket) {
    const n = nextStatus(ticket.status)
    setStatusUpdatingId(ticket.id)
    const now = new Date().toISOString()
    const patch = { status: n, updated_at: now }
    if (n === 'closed') {
      patch.closed_at = now
    }
    const { error } = await supabase.from('tickets').update(patch).eq('id', ticket.id)
    setStatusUpdatingId(null)
    if (error) {
      console.error(error)
      toast.error(error.message)
      return
    }
    toast.success(`Status updated to ${n.replace('_', ' ')}`)
    load()
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <div className="spinner spinner-teal" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  if (profile?.role !== 'admin') return null

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <div className="spinner spinner-teal" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Admin</h1>
        <p className="page-subtitle">Tickets, field force, and operations overview</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '28px',
        }}
        className="stat-grid-admin"
      >
        <div className="stat-card">
          <div className="stat-label">Open tickets</div>
          <div className="stat-value">{stats.open}</div>
          <div className="stat-sub">Awaiting assignment</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In progress</div>
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-sub">Active jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Closed today</div>
          <div className="stat-value">{stats.closedToday}</div>
          <div className="stat-sub">Completed since midnight</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Field force</div>
          <div className="stat-value">{stats.ffCount}</div>
          <div className="stat-sub">Team members</div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-800)' }}>All tickets</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'open', 'in_progress', 'scheduled', 'closed'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              >
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--gray-100)', color: 'var(--gray-400)', fontWeight: '600' }}>
                  <th style={{ padding: '10px 8px' }}>ID</th>
                  <th style={{ padding: '10px 8px' }}>Customer</th>
                  <th style={{ padding: '10px 8px' }}>Service</th>
                  <th style={{ padding: '10px 8px' }}>Priority</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px', minWidth: '120px' }}>Address</th>
                  <th style={{ padding: '10px 8px' }}>Created</th>
                  <th style={{ padding: '10px 8px' }}>Assigned to</th>
                  <th style={{ padding: '10px 8px' }}>Assign</th>
                  <th style={{ padding: '10px 8px' }}>Next status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-400)' }}>
                      No tickets match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const cust = t.profiles
                    const assignedName = t.assigned_profile?.full_name
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--gray-100)', verticalAlign: 'top' }}>
                        <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--gray-600)' }}>
                          {t.id?.slice(0, 8)}…
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{cust?.full_name || '—'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{cust?.phone || ''}</div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>{t.category || t.title}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`badge ${priorityColors[t.priority] || 'badge-gray'}`}>{t.priority}</span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`badge ${statusColors[t.status] || 'badge-gray'}`}>{t.status?.replace('_', ' ')}</span>
                        </td>
                        <td style={{ padding: '12px 8px', maxWidth: '180px', wordBreak: 'break-word' }}>{t.address || '—'}</td>
                        <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                          {t.created_at ? new Date(t.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                        </td>
                        <td style={{ padding: '12px 8px' }}>{assignedName || '—'}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <select
                            className="form-input form-select"
                            style={{ minWidth: '140px', fontSize: '12px', padding: '6px 8px' }}
                            value={t.assigned_to || ''}
                            disabled={assigningId === t.id}
                            onChange={(e) => {
                              const v = e.target.value
                              if (v) handleAssign(t.id, v)
                            }}
                          >
                            <option value="">Assign…</option>
                            {fieldForce.map((ff) => (
                              <option key={ff.id} value={ff.id}>
                                {ff.full_name || ff.email}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={statusUpdatingId === t.id || t.status === 'closed' || t.status === 'cancelled'}
                            onClick={() => handleStatusAdvance(t)}
                          >
                            {statusUpdatingId === t.id ? <span className="spinner spinner-teal" style={{ width: 14, height: 14 }} /> : `→ ${nextStatus(t.status).replace('_', ' ')}`}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
        </div>
      </div>

      <div id="admin-field-force" className="card card-pad">
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-800)' }}>Field force</h2>
        {fieldForce.length === 0 ? (
          <div style={{ color: 'var(--gray-400)', fontSize: '14px' }}>No field force members yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--gray-100)', color: 'var(--gray-400)', fontWeight: '600' }}>
                  <th style={{ padding: '10px 8px' }}>Name</th>
                  <th style={{ padding: '10px 8px' }}>Phone</th>
                  <th style={{ padding: '10px 8px' }}>Email</th>
                  <th style={{ padding: '10px 8px' }}>Active jobs</th>
                </tr>
              </thead>
              <tbody>
                {fieldForce.map((ff) => (
                  <tr key={ff.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '600' }}>{ff.full_name || '—'}</td>
                    <td style={{ padding: '12px 8px' }}>{ff.phone || '—'}</td>
                    <td style={{ padding: '12px 8px' }}>{ff.email || '—'}</td>
                    <td style={{ padding: '12px 8px' }}>{activeJobCounts[ff.id] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .stat-grid-admin { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
