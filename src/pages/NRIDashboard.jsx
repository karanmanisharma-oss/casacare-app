import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/date'

export default function NRIDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroImgOk, setHeroImgOk] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('properties').select('*').eq('owner_id', profile?.id),
      supabase.from('tickets').select('*').eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(8),
    ]).then(([{ data: props }, { data: tix }]) => {
      setProperties(props || [])
      setTickets(tix || [])
      setLoading(false)
    })
  }, [profile])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const reportsThisMonth = tickets.filter(t => t.has_photos && t.created_at && new Date(t.created_at) >= monthStart).length

  return (
    <div className="anim-fade-up">
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--r-xl)',
          overflow: 'hidden',
          marginBottom: '28px',
          minHeight: '200px',
          background: 'linear-gradient(135deg, var(--navy) 0%, #142a4a 50%, var(--teal-dark) 100%)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {heroImgOk && (
          <img
            src="/brand/nri-care.jpg"
            alt=""
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 'min(52%, 420px)',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            onError={() => setHeroImgOk(false)}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1, padding: '32px', maxWidth: heroImgOk ? '58%' : '100%' }}>
          <h1 className="page-title" style={{ color: 'white', fontSize: 'clamp(22px, 3.5vw, 28px)', marginBottom: '8px' }}>
            Property Overview 🏠
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, maxWidth: '420px' }}>
            Your properties are being watched over — 24×7
          </p>
        </div>
      </div>

      <div className="stat-grid d1">
        <div className="stat-card">
          <div className="stat-label">Properties</div>
          <div className="stat-value">{properties.length}</div>
          <div className="stat-sub">Registered</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Issues</div>
          <div className="stat-value">{tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}</div>
          <div className="stat-sub">Need attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reports This Month</div>
          <div className="stat-value">{reportsThisMonth}</div>
          <div className="stat-sub">With documentation</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{tickets.filter(t => t.status === 'closed').length}</div>
          <div className="stat-sub">Issues closed</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><div className="spinner spinner-teal" style={{ width: '32px', height: '32px' }} /></div>
      ) : (
        <>
          <div className="card card-pad d2 card-hover" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--gray-800)' }}>Your properties</h2>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => alert('Add property — coming soon')}>+ Add property</button>
            </div>
            {properties.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <span className="empty-icon">🏠</span>
                <div className="empty-title">No properties yet</div>
                <p className="empty-desc">Register your first property to unlock remote monitoring and reports.</p>
                <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => alert('Add property — coming soon')}>
                  Register property
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {properties.map(p => (
                  <div
                    key={p.id}
                    className="card card-pad card-hover"
                    style={{ border: '1px solid rgba(29,158,117,0.12)', boxShadow: 'var(--shadow-xs)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--gray-800)', fontFamily: 'var(--font-display)' }}>{p.name || 'Property'}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '6px', lineHeight: 1.5 }}>{p.address}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/reports')}>View report</button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/book')}>Raise ticket</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card card-pad d3">
            <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '16px', fontFamily: 'var(--font-display)', color: 'var(--gray-800)' }}>Recent activity</h2>
            {tickets.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 16px' }}>
                <span className="empty-icon">📭</span>
                <div className="empty-title">No activity yet</div>
                <p className="empty-desc">Service history will appear here once you raise a ticket.</p>
              </div>
            ) : (
              tickets.map(t => (
                <div key={t.id} className="ticket-row">
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-800)' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>
                      {formatDate(t.created_at, 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  {t.has_photos && <span className="badge badge-teal">📷 Photos</span>}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
