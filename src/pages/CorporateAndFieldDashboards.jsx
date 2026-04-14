import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export function CorporateDashboard() {
  const { profile } = useAuth()
  const [tickets, setTickets] = useState([])
  const [amcs, setAmcs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('tickets').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('amc_contracts').select('*').eq('client_id', profile?.id)
    ]).then(([{ data: tix }, { data: amcData }]) => {
      setTickets(tix || [])
      setAmcs(amcData || [])
      setLoading(false)
    })
  }, [profile])

  const open = tickets.filter(t => t.status === 'open').length
  const inProgress = tickets.filter(t => t.status === 'in_progress').length
  const closed = tickets.filter(t => t.status === 'closed').length
  const slaBreached = tickets.filter(t => t.sla_breached).length

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Corporate Dashboard 📊</h1>
        <p className="page-subtitle">Full visibility across all assets and contracts</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Open tickets</div><div className="stat-value" style={{ color: 'var(--amber)' }}>{open}</div><div className="stat-sub">Awaiting action</div></div>
        <div className="stat-card"><div className="stat-label">In progress</div><div className="stat-value" style={{ color: 'var(--teal)' }}>{inProgress}</div><div className="stat-sub">Technician assigned</div></div>
        <div className="stat-card"><div className="stat-label">Closed this month</div><div className="stat-value" style={{ color: 'var(--green)' }}>{closed}</div><div className="stat-sub">Resolved</div></div>
        <div className="stat-card"><div className="stat-label">SLA breached</div><div className="stat-value" style={{ color: slaBreached > 0 ? 'var(--red)' : 'var(--green)' }}>{slaBreached}</div><div className="stat-sub">{slaBreached > 0 ? 'Needs attention' : 'All on time'}</div></div>
        <div className="stat-card"><div className="stat-label">AMC Contracts</div><div className="stat-value">{amcs.length}</div><div className="stat-sub">Active</div></div>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div> : (
        <>
          <div className="card card-pad" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>All tickets</h2>
              <button className="btn btn-primary btn-sm">+ New ticket</button>
            </div>
            {tickets.length === 0
              ? <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-400)', fontSize: '14px' }}>No tickets found.</div>
              : tickets.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>#{t.id?.slice(0, 8)} · {new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {t.sla_breached && <span className="badge badge-red">SLA breach</span>}
                    <span className={`badge ${t.status === 'open' ? 'badge-amber' : t.status === 'in_progress' ? 'badge-navy' : t.status === 'closed' ? 'badge-green' : 'badge-gray'}`}>{t.status?.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            }
          </div>

          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>AMC Contracts</h2>
              <button className="btn btn-secondary btn-sm">+ Add contract</button>
            </div>
            {amcs.length === 0
              ? <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-400)', fontSize: '14px' }}>No AMC contracts registered. Contact us to set up your Annual Maintenance Contract.</div>
              : amcs.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{a.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Expires: {new Date(a.end_date).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span className="badge badge-teal">Active</span>
                </div>
              ))
            }
          </div>
        </>
      )}
    </div>
  )
}

export function FieldForceDashboard() {
  const { profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('tickets').select('*').eq('assigned_to', profile?.id).order('scheduled_at', { ascending: true })
      .then(({ data }) => { setJobs(data || []); setLoading(false) })
  }, [profile])

  const today = jobs.filter(j => {
    const d = new Date(j.scheduled_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Jobs 🔧</h1>
        <p className="page-subtitle">Today: {today.length} job{today.length !== 1 ? 's' : ''} scheduled</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Today's jobs</div><div className="stat-value">{today.length}</div><div className="stat-sub">Scheduled</div></div>
        <div className="stat-card"><div className="stat-label">In progress</div><div className="stat-value">{jobs.filter(j => j.status === 'in_progress').length}</div><div className="stat-sub">Active</div></div>
        <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value">{jobs.filter(j => j.status === 'closed').length}</div><div className="stat-sub">All time</div></div>
      </div>

      <div className="card card-pad" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Scan an asset</h2>
        </div>
        <div style={{ background: 'var(--gray-50)', border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius)', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📷</div>
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>Scan the QR code on the asset to pull up service history and raise a ticket instantly</p>
          <button className="btn btn-primary" onClick={() => alert('QR scanner opens camera — coming in mobile app')}>Open QR Scanner</button>
        </div>
      </div>

      <div className="card card-pad">
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Assigned jobs</h2>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><div className="spinner" /></div>
          : jobs.length === 0
          ? <div style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)', fontSize: '14px' }}>No jobs assigned to you yet.</div>
          : jobs.map(j => (
            <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{j.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{j.address || 'Address not set'} · {j.scheduled_at ? new Date(j.scheduled_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Unscheduled'}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm">Navigate</button>
                <button className="btn btn-primary btn-sm">Start job</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default function CorporateDashboardDefault() { return <CorporateDashboard /> }
