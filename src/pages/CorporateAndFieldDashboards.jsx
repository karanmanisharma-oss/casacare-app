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

  async function startJob(job) {
    const { error } = await supabase.from('tickets').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', job.id)
    if (error) toast.error(error.message)
    else {
      toast.success('Job started')
      load()
    }
  }

  function openMaps(job) {
    const q = job.address || job.title || ''
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer')
  }

  const today = jobs.filter(j => isSameDay(j.scheduled_at))

  return (
    <div className="anim-fade-up" style={{ position: 'relative' }}>
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <div style={{
          borderRadius:'24px', overflow:'hidden',
          marginBottom:'0', position:'relative', minHeight:'160px',
          background:'linear-gradient(135deg, #1a2b4a 0%, #0F6E56 100%)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <img
            src="/brand/electrician.jpg"
            alt=""
            style={{
              position:'absolute', right:0, top:0,
              width:'38%', height:'100%',
              objectFit:'cover', opacity:0.5
            }}
            onError={e => {
              e.target.src = '/brand/tech-male.jpg'
              e.target.onerror = () => { e.target.style.display = 'none' }
            }}
          />
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(90deg, rgba(26,43,74,0.95) 45%, transparent 100%)'
          }}/>
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              zIndex: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setShowNotifs(!showNotifs)}
              className="btn btn-secondary btn-sm"
              style={{
                position: 'relative',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              🔔
              {notifications.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '99px',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '11px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            {showNotifs && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: 'min(320px, 92vw)',
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--gray-100)',
                  zIndex: 50,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontFamily: 'var(--font-display)', fontSize: '14px' }}>Notifications</span>
                  {notifications.length > 0 && (
                    <button type="button" onClick={markAllRead} className="btn btn-ghost btn-xs" style={{ border: 'none' }}>Mark all read</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>No new notifications</div>
                ) : notifications.map(n => (
                  <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-50)', background: 'var(--teal-xlight)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--gray-800)', fontWeight: '500' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>{new Date(n.created_at).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ position:'relative', zIndex:2, padding:'28px', color:'white' }}>
            <h2 style={{
              fontSize:'22px', fontWeight:'800',
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              marginBottom:'4px'
            }}>My Jobs 🔧</h2>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>
              Verified CasaCare Technician
            </p>
          </div>
        </div>
      </div>

      <div className="stat-grid d1">
        <div className="stat-card"><div className="stat-label">Today&apos;s jobs</div><div className="stat-value">{today.length}</div><div className="stat-sub">Scheduled</div></div>
        <div className="stat-card"><div className="stat-label">In progress</div><div className="stat-value">{jobs.filter(j => j.status === 'in_progress').length}</div><div className="stat-sub">Active</div></div>
        <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value">{jobs.filter(j => j.status === 'closed').length}</div><div className="stat-sub">All time</div></div>
      </div>

      <div className="card card-pad d2" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '16px', fontFamily: 'var(--font-display)', color: 'var(--gray-800)' }}>Scan an asset</h2>
        <div
          style={{
            background: 'var(--gray-50)',
            border: '2px dashed var(--gray-200)',
            borderRadius: 'var(--r-lg)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📷</div>
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px', maxWidth: '420px', margin: '0 auto 16px' }}>
            Scan the QR code on the asset to pull up service history and raise a ticket instantly
          </p>
          <button type="button" className="btn btn-primary" onClick={() => alert('QR scanner opens camera — coming in mobile app')}>Open QR Scanner</button>
        </div>
      </div>

      <div className="card card-pad d3">
        <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '16px', fontFamily: 'var(--font-display)', color: 'var(--gray-800)' }}>Assigned jobs</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><div className="spinner spinner-teal" style={{ width: '28px', height: '28px' }} /></div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔧</span>
            <div className="empty-title">No jobs assigned</div>
            <p className="empty-desc">New assignments will appear here when dispatch assigns you.</p>
          </div>
        ) : (
          jobs.map(j => (
            <div
              key={j.id}
              style={{
                padding: '18px 0',
                borderBottom: '1px solid var(--gray-100)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-800)', fontFamily: 'var(--font-display)' }}>{j.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '6px' }}>{j.address || 'Address not set'}</div>
                <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: '600', marginTop: '8px' }}>
                  {j.scheduled_at ? formatDateTime(j.scheduled_at, 'en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Unscheduled'}
                </div>
                <span className={`badge ${j.status === 'open' ? 'badge-amber' : j.status === 'in_progress' ? 'badge-navy' : j.status === 'closed' ? 'badge-green' : 'badge-gray'}`} style={{ marginTop: '10px' }}>
                  {j.status?.replace('_', ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => openMaps(j)}>Navigate</button>
                {j.status !== 'in_progress' && j.status !== 'closed' && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => startJob(j)}>Start Job</button>
                )}
                {j.status === 'in_progress' && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#166534', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                    onClick={() => { setActiveJob(j); setShowPhotoUpload(true) }}
                  >
                    📷 Upload Proof
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showPhotoUpload && activeJob && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowPhotoUpload(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '17px', color: 'var(--navy)' }}>
                Upload Proof of Service
              </h3>
              <button type="button" onClick={() => setShowPhotoUpload(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--gray-400)' }} aria-label="Close">✕</button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '16px' }}>Job: {activeJob.title}</p>
            <PhotoUpload
              ticketId={activeJob.id}
              onUploadComplete={() => {
                toast.success('Proof submitted! Admin has been notified.')
                setShowPhotoUpload(false)
                load()
              }}
            />
            <button
              type="button"
              className="btn btn-primary btn-full"
              style={{ marginTop: '16px' }}
              onClick={async () => {
                const { error } = await supabase.from('tickets')
                  .update({ status: 'closed', closed_at: new Date().toISOString() })
                  .eq('id', activeJob.id)
                if (!error) {
                  toast.success('Job marked as complete!')
                  setShowPhotoUpload(false)
                  load()
                } else toast.error(error.message)
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
