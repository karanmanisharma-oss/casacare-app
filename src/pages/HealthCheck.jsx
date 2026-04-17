import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function HealthCheck() {
  const [checks, setChecks] = useState({
    database: 'checking',
    auth: 'checking',
    storage: 'checking'
  })
  const [timestamp] = useState(new Date().toISOString())

  useEffect(() => {
    async function runChecks() {
      // DB check
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1)
        setChecks(c => ({ ...c, database: error ? `error: ${error.message}` : 'healthy' }))
      } catch (e) {
        setChecks(c => ({ ...c, database: `error: ${e.message}` }))
      }

      // Auth check
      try {
        const { error } = await supabase.auth.getSession()
        setChecks(c => ({ ...c, auth: error ? 'error' : 'healthy' }))
      } catch (e) {
        setChecks(c => ({ ...c, auth: 'error' }))
      }

      // Storage check
      try {
        const { error } = await supabase.storage.listBuckets()
        setChecks(c => ({ ...c, storage: error ? `error: ${error.message}` : 'healthy' }))
      } catch (e) {
        setChecks(c => ({ ...c, storage: 'error' }))
      }
    }
    runChecks()
  }, [])

  const allHealthy = Object.values(checks).every(v => v === 'healthy')

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F7FFFE', padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '32px',
        width: '100%', maxWidth: '440px',
        border: '1px solid rgba(29,158,117,0.1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>
            {allHealthy ? '✅' : '⚠️'}
          </div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: '20px', fontWeight: '800', color: '#1a2b4a'
          }}>
            CasaCare Health Status
          </h2>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
            {timestamp}
          </p>
        </div>

        {Object.entries(checks).map(([key, value]) => (
          <div key={key} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
            background: value === 'healthy' ? '#f0fdf4' : value === 'checking' ? '#f9fafb' : '#fef2f2'
          }}>
            <span style={{
              fontWeight: '600', fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              textTransform: 'capitalize', color: '#1f2937'
            }}>{key}</span>
            <span style={{
              fontSize: '12px', fontWeight: '700', padding: '3px 10px',
              borderRadius: '99px',
              background: value === 'healthy' ? '#dcfce7' : value === 'checking' ? '#f3f4f6' : '#fee2e2',
              color: value === 'healthy' ? '#166534' : value === 'checking' ? '#6b7280' : '#991b1b'
            }}>
              {value === 'checking' ? '⏳ checking...' : value === 'healthy' ? '✓ healthy' : `✗ ${value}`}
            </span>
          </div>
        ))}

        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%', marginTop: '16px', padding: '12px',
            background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontWeight: '700', fontSize: '14px', cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans',sans-serif"
          }}>
          Run checks again
        </button>
      </div>
    </div>
  )
}
