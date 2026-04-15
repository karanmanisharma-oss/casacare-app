import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([])
  const [fieldForce, setFieldForce] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tickets')

  async function loadData() {
    setLoading(true)
    const [{ data: tix }, { data: ff }] = await Promise.all([
      supabase
        .from('tickets')
        .select(
          '*, customer:profiles!user_id(full_name,phone,email), assignee:profiles!assigned_to(full_name,phone)',
        )
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'field_force'),
    ])
    setTickets(tix || [])
    setFieldForce(ff || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function assignTicket(ticketId, fieldForceId) {
    if (!fieldForceId) return
    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: fieldForceId, status: 'scheduled' })
      .eq('id', ticketId)
    if (error) toast.error(error.message)
    else {
      toast.success('Ticket assigned!')
      loadData()
    }
  }

  async function updateStatus(ticketId, status) {
    const updates = { status }
    if (status === 'closed') updates.closed_at = new Date().toISOString()
    const { error } = await supabase.from('tickets').update(updates).eq('id', ticketId)
    if (error) toast.error(error.message)
    else {
      toast.success('Status updated!')
      loadData()
    }
  }

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)
  const open = tickets.filter((t) => t.status === 'open').length
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length
  const scheduled = tickets.filter((t) => t.status === 'scheduled').length
  const closed = tickets.filter((t) => t.status === 'closed').length

  const statusColors = {
    open: '#f59e0b',
    scheduled: '#3b82f6',
    in_progress: '#8b5cf6',
    closed: '#10b981',
    cancelled: '#6b7280',
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a2b4a', margin: 0 }}>
            Admin Control Centre
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
            Manage all tickets, assignments and field force
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          style={{
            padding: '10px 20px',
            background: '#1D9E75',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {[
          { label: 'Open', value: open, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Scheduled', value: scheduled, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'In Progress', value: inProgress, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Closed', value: closed, color: '#10b981', bg: '#f0fdf4' },
        ].map((s) => (
          <button
            type="button"
            key={s.label}
            onClick={() =>
              setFilter(s.label.toLowerCase().replace(' ', '_'))
            }
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${s.color}30`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: s.color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#1f2937', marginTop: '6px' }}>
              {s.value}
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['tickets', 'field_force'].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 20px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              background: activeTab === tab ? '#1D9E75' : '#f3f4f6',
              color: activeTab === tab ? 'white' : '#4b5563',
            }}
          >
            {tab === 'tickets' ? '🎫 All Tickets' : '👷 Field Force'}
          </button>
        ))}
        {activeTab === 'tickets' &&
          ['all', 'open', 'scheduled', 'in_progress', 'closed'].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                background: filter === s ? '#1a2b4a' : '#f3f4f6',
                color: filter === s ? 'white' : '#4b5563',
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
      </div>

      {activeTab === 'tickets' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading tickets...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No tickets found</div>
          ) : (
            filtered.map((t, i) => (
              <div
                key={t.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: i % 2 === 0 ? 'white' : '#fafafa',
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1f2937', marginBottom: '3px' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    👤 {t.customer?.full_name || 'Unknown'} · 📱 {t.customer?.phone || 'N/A'}
                  </div>
                  {t.address && (
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>📍 {t.address}</div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>{t.category}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                    {new Date(t.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: `${statusColors[t.status] || '#6b7280'}20`,
                      color: statusColors[t.status] || '#6b7280',
                    }}
                  >
                    {t.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div>
                  <select
                    value={t.assigned_to || ''}
                    onChange={(e) => assignTicket(t.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Assign to...</option>
                    {fieldForce.map((ff) => (
                      <option key={ff.id} value={ff.id}>
                        {ff.full_name}
                      </option>
                    ))}
                  </select>
                  {t.assignee && (
                    <div style={{ fontSize: '11px', color: '#10b981', marginTop: '3px', fontWeight: '600' }}>
                      ✓ {t.assignee.full_name}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['open', 'scheduled', 'in_progress', 'closed']
                    .filter((s) => t.status !== s)
                    .map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => updateStatus(t.id, s)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontFamily: "'Plus Jakarta Sans',sans-serif",
                          background:
                            s === 'closed' ? '#f0fdf4' : s === 'in_progress' ? '#f5f3ff' : '#eff6ff',
                          color:
                            s === 'closed' ? '#166534' : s === 'in_progress' ? '#6d28d9' : '#1e40af',
                        }}
                      >
                        → {s.replace('_', ' ')}
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'field_force' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {fieldForce.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
              No field force members yet. Register users with the Field Technician role.
            </div>
          ) : (
            fieldForce.map((ff) => {
              const activeJobs = tickets.filter(
                (ticket) => ticket.assigned_to === ff.id && ticket.status !== 'closed',
              ).length
              return (
                <div
                  key={ff.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg,#1D9E75,#0F6E56)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '800',
                        fontSize: '16px',
                      }}
                    >
                      {ff.full_name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#1f2937' }}>{ff.full_name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{ff.phone || ff.email}</div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#f9fafb',
                      borderRadius: '10px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Active Jobs</span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        color: activeJobs > 0 ? '#F5A623' : '#10b981',
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
    </div>
  )
}
