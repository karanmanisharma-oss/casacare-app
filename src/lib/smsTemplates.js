/** Text-only SMS bodies for MSG91 (Phase 3 wiring). Base URL matches production app. */
const APP = 'https://casacare-app.vercel.app'

export const smsTemplates = {
  /** When admin assigns a job (mirrors Edge Function body; keep in sync). */
  technician_job_assigned: (ticketId, title, whenLine) =>
    `Casa Care: New job — ${title}. ${whenLine}. Open ${APP}/my-jobs · Help 9810223963`,

  booking_confirmed: (ticketId, service, date, time) =>
    `Casa Care: Booking confirmed! ${service} on ${date} at ${time}. Ref #${String(ticketId).replace(/-/g, '').slice(0, 8)}. ${APP}/tickets Help: 9810223963`,

  payment_failed: (ticketId, amount) =>
    `Casa Care: Payment didn't go through for ₹${amount}. Retry: ${APP}/tickets Ref #${String(ticketId).replace(/-/g, '').slice(0, 8)} Help: 9810223963`,

  reminder_24h: (service, time) =>
    `Casa Care: Reminder! ${service} tomorrow at ${time}. Details in your email. Help: 9810223963`,

  reminder_2h: (service, time, trackingUrl) =>
    `Casa Care: Your ${service} is in ~2 hours at ${time}. Track: ${trackingUrl} Help: 9810223963`,

  live_tracking: (technicianName, eta, trackingUrl) =>
    `Casa Care: ${technicianName} is on the way! ETA: ${eta}. Track: ${trackingUrl} Help: 9810223963`,

  service_completed: (ticketId, service, invoiceId) =>
    `Casa Care: ${service} complete! Ref #${String(ticketId).replace(/-/g, '').slice(0, 8)} | Invoice ${invoiceId}. Rate: ${APP}/tickets Help: 9810223963`,

  followup_3day: (service, feedbackUrl) =>
    `Casa Care: How's your ${service}? Reply via app: ${feedbackUrl} Help: 9810223963`,
}
