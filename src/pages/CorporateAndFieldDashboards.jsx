import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { formatDate, formatDateTime, isSameDay } from '../utils/date'
import toast from 'react-hot-toast'
import PhotoUpload from '../components/shared/PhotoUpload'

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
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>#{t.id?.slice(0, 8)} · {formatDate(t.created_at)}</div>
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
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Expires: {formatDate(a.end_date)}</div>
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
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [activeJob, setActiveJob] = useState(null)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)

  async function load() {
    const { data } = await supabase.from('tickets').select('*').eq('assigned_to', profile?.id).order('scheduled_at', { ascending: true })
    setJobs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!profile?.id) return
    load()
  }, [profile])

  useEffect(() => {
    if (!profile?.id) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotifications(data || []))
  }, [profile])

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', profile.id)
    setNotifications([])
    setShowNotifs(false)
  }

  const today = jobs.filter(j => isSameDay(j.scheduled_at))

  return (
    <div>
      <div
        style={{
          background: '#ecfeff',
          border: '1px solid #99f6e4',
          color: '#0f766e',
          borderRadius: '10px',
          padding: '10px 12px',
          fontSize: '12px',
          marginBottom: '14px',
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        Debug: role={profile?.role || 'unknown'} | user={profile?.id?.slice(0, 8) || 'none'} | jobs={jobs.length} | unread={notifications.length}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', position: 'relative' }}>
        <button onClick={() => setShowNotifs(!showNotifs)} style={{
          position: 'relative', background: 'white', border: '1.5px solid #e5e7eb',
          borderRadius: '12px', padding: '10px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: '600', fontSize: '13px'
        }}>
          🔔 Notifications
          {notifications.length > 0 && (
            <span style={{
              background: '#ef4444', color: 'white', borderRadius: '99px',
              padding: '2px 7px', fontSize: '11px', fontWeight: '800'
            }}>{notifications.length}</span>
          )}
        </button>
        {showNotifs && (
          <div style={{
            position: 'absolute', top: '48px', right: 0, width: '320px',
            background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb', zIndex: 50, overflow: 'hidden'
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '14px' }}>New Jobs</span>
              {notifications.length > 0 && (
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#1D9E75', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Mark all read</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No new notifications</div>
            ) : notifications.map(n => (
              <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f9fafb', background: '#f0fdf4' }}>
                <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{n.message}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{new Date(n.created_at).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{j.address || 'Address not set'} · {j.scheduled_at ? formatDateTime(j.scheduled_at, 'en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Unscheduled'}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm">Navigate</button>
                <button className="btn btn-primary btn-sm">Start job</button>
                <button
                  onClick={() => { setActiveJob(j); setShowPhotoUpload(true) }}
                  style={{
                    padding: '7px 14px',
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans',sans-serif"
                  }}
                >
                  📷 Upload Proof
                </button>
              </div>
            </div>
          ))
        }
      </div>
      {showPhotoUpload && activeJob && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '24px',
            width: '100%', maxWidth: '480px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: '800', fontSize: '16px', color: '#1a2b4a' }}>
                Upload Proof of Service
              </h3>
              <button onClick={() => setShowPhotoUpload(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Job: {activeJob.title}
            </p>
            <PhotoUpload
              ticketId={activeJob.id}
              onUploadComplete={() => {
                toast.success('Proof submitted! Admin has been notified.')
                setShowPhotoUpload(false)
                load()
              }}
            />
            <button
              onClick={async () => {
                const { error } = await supabase.from('tickets')
                  .update({ status: 'closed', closed_at: new Date().toISOString() })
                  .eq('id', activeJob.id)
                if (!error) {
                  toast.success('Job marked as complete!')
                  setShowPhotoUpload(false)
                  load()
                }
              }}
              style={{
                width: '100%', marginTop: '16px', padding: '13px',
                background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans',sans-serif"
              }}
            >
              Mark Job Complete ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CorporateDashboardDefault() { return <CorporateDashboard /> }
