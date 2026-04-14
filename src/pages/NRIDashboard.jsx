import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function NRIDashboard() {
  const { profile } = useAuth()
  const [properties, setProperties] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('properties').select('*').eq('owner_id', profile?.id),
      supabase.from('tickets').select('*').eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(5)
    ]).then(([{ data: props }, { data: tix }]) => {
      setProperties(props || [])
      setTickets(tix || [])
      setLoading(false)
    })
  }, [profile])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Property Overview 🏠</h1>
        <p className="page-subtitle">Your properties are being watched over — 24x7</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Properties</div><div className="stat-value">{properties.length}</div><div className="stat-sub">Registered</div></div>
        <div className="stat-card"><div className="stat-label">Active Issues</div><div className="stat-value">{tickets.filter(t => t.status === 'open').length}</div><div className="stat-sub">Need attention</div></div>
        <div className="stat-card"><div className="stat-label">Reports This Month</div><div className="stat-value">{tickets.filter(t => t.has_photos).length}</div><div className="stat-sub">With photo evidence</div></div>
        <div className="stat-card"><div className="stat-label">Resolved</div><div className="stat-value">{tickets.filter(t => t.status === 'closed').length}</div><div className="stat-sub">Issues closed</div></div>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div> : (
        <>
          <div className="card card-pad" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Your properties</h2>
              <button className="btn btn-primary btn-sm" onClick={() => alert('Add property form coming soon')}>+ Add property</button>
            </div>
            {properties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)', fontSize: '14px' }}>
                No properties registered yet.<br />
                <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => alert('Add property form')}>Register your first property</button>
              </div>
            ) : properties.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <div>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{p.address}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm">View report</button>
                  <button className="btn btn-primary btn-sm">Raise ticket</button>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Recent service activity</h2>
            {tickets.length === 0
              ? <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-400)', fontSize: '14px' }}>No service history yet.</div>
              : tickets.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  {t.has_photos && <span style={{ fontSize: '11px', background: 'var(--teal-light)', color: 'var(--teal-dark)', padding: '3px 8px', borderRadius: '99px', fontWeight: '600' }}>📷 Photos</span>}
                </div>
              ))
            }
          </div>
        </>
      )}
    </div>
  )
}
