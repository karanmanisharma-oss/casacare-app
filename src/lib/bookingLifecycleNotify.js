import { supabase } from './supabase'

/**
 * Invokes the `send-booking-email` Edge Function (SendGrid).
 * Caller must be the ticket owner or an admin (enforced in the function).
 *
 * @param {string} ticketId
 * @param {'booking_confirmed'|'payment_failed'|'reminder_24h'|'reminder_2h'|'live_tracking'|'service_completed'|'followup_3day'} eventType
 */
export async function notifyBookingLifecycle(ticketId, eventType) {
  if (!ticketId || !eventType) {
    return { error: new Error('ticketId and eventType required') }
  }
  const { data, error } = await supabase.functions.invoke('send-booking-email', {
    body: { ticket_id: ticketId, event_type: eventType },
  })
  if (error) {
    console.error('notifyBookingLifecycle', eventType, error)
    return { error, data }
  }
  return { data }
}
