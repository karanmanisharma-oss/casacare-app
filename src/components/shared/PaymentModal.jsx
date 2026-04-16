import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const GPAY_UPI_ID = 'casacare@okicici'
const GPAY_NAME = 'CasaCare Services'

export default function PaymentModal({ ticket, amount, onClose, onSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [txnId, setTxnId] = useState('')

  const upiLink = `upi://pay?pa=${GPAY_UPI_ID}&pn=${encodeURIComponent(GPAY_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`CasaCare-${ticket?.id?.slice(0, 8)}`)}`

  async function confirmPayment() {
    if (!txnId.trim()) {
      toast.error('Please enter transaction ID')
      return
    }
    setUploading(true)
    const { error } = await supabase.from('tickets').update({
      payment_status: 'paid',
      payment_txn_id: txnId,
      payment_amount: amount,
      payment_date: new Date().toISOString()
    }).eq('id', ticket.id)
    setUploading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Payment confirmed!')
    onSuccess()
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '28px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>💳</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '20px', fontWeight: '800', color: '#1a2b4a' }}>Pay for Service</h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>{ticket?.title}</p>
        </div>

        <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Amount to pay</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#1D9E75', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>₹{amount}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>UPI ID: {GPAY_UPI_ID}</div>
        </div>

        <a href={upiLink} style={{
          display: 'block', textAlign: 'center',
          background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
          color: 'white', padding: '14px', borderRadius: '12px',
          fontWeight: '700', fontSize: '15px', textDecoration: 'none',
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          marginBottom: '16px'
        }}>
          Pay with GPay / PhonePe / UPI →
        </a>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'block', marginBottom: '6px' }}>
            Enter UPI Transaction ID after payment
          </label>
          <input
            value={txnId}
            onChange={e => setTxnId(e.target.value)}
            placeholder="e.g. 316547892345"
            style={{ width: '100%', padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontFamily: 'Inter,sans-serif', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', color: '#4b5563' }}>
            Cancel
          </button>
          <button onClick={confirmPayment} disabled={uploading} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', color: 'white' }}>
            {uploading ? 'Confirming...' : 'Confirm Payment ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
