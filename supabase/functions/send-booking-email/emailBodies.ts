/** CasaCare booking lifecycle HTML — teal #1D9E75, navy #1a2b4a */

export type Ctx = {
  customerName: string
  serviceType: string
  bookingDate: string
  bookingTime: string
  serviceAddress: string
  bookingRef: string
  amount: string
  technicianName: string
  serviceDuration: string
  invoiceId: string
  trackingUrl: string
  ticketUrl: string
  payUrl: string
  rescheduleUrl: string
  cancelUrl: string
  photosUrl: string
  rateUrl: string
  feedbackUrl: string
  appUrl: string
}

function wrap(title: string, body: string, appUrl: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head><body style="margin:0;padding:0;background:#F8FFFE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:20px 12px;"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,43,74,0.1);border:1px solid rgba(29,158,117,0.12);">
<tr><td style="background:linear-gradient(135deg,#1a2b4a 0%,#1D9E75 100%);padding:28px 20px;text-align:center;">
<div style="font-size:24px;font-weight:800;color:#ffffff;">CasaCare</div>
<p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.9);">Home. Health. Happiness.</p>
</td></tr>
<tr><td style="padding:32px 26px;">${body}</td></tr>
<tr><td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0;font-size:12px;color:#9ca3af;">Questions? <a href="mailto:support@casacare.in" style="color:#1D9E75;">support@casacare.in</a> · 9810223963</p>
<p style="margin:8px 0 0;font-size:12px;"><a href="${appUrl}" style="color:#1D9E75;">${appUrl.replace('https://', '')}</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}

export function htmlBookingConfirmed(c: Ctx) {
  const body = `<h1 style="margin:0 0 12px;font-size:22px;color:#1a2b4a;">Your service is booked ✓</h1>
<p style="color:#4b5563;font-size:15px;line-height:1.6;">Hi ${c.customerName},</p>
<p style="color:#4b5563;font-size:15px;line-height:1.6;">Your booking is confirmed. Details:</p>
<table width="100%" style="background:#f9fafb;border-left:4px solid #1D9E75;padding:16px;margin:16px 0;border-radius:8px;">
<tr><td style="font-size:14px;color:#6b7280;">Service</td><td style="font-size:14px;color:#1a2b4a;font-weight:700;text-align:right;">${c.serviceType}</td></tr>
<tr><td style="font-size:14px;color:#6b7280;padding-top:8px;">When</td><td style="font-size:14px;color:#1a2b4a;font-weight:700;text-align:right;">${c.bookingDate} · ${c.bookingTime}</td></tr>
<tr><td style="font-size:14px;color:#6b7280;padding-top:8px;">Where</td><td style="font-size:14px;color:#1a2b4a;font-weight:700;text-align:right;">${c.serviceAddress}</td></tr>
<tr><td style="font-size:14px;color:#6b7280;padding-top:8px;">Ref</td><td style="font-size:14px;color:#1D9E75;font-weight:800;text-align:right;">#${c.bookingRef}</td></tr>
<tr><td style="font-size:14px;color:#6b7280;padding-top:8px;">Amount</td><td style="font-size:14px;color:#1a2b4a;font-weight:700;text-align:right;">₹${c.amount}</td></tr>
</table>
<div style="text-align:center;margin:24px 0;"><a href="${c.ticketUrl}" style="display:inline-block;background:linear-gradient(135deg,#1D9E75,#0F6E56);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;">View booking</a></div>
<p style="font-size:13px;color:#9ca3af;">Reminders and tracking links will be sent before your visit.</p>`
  return wrap('Booking confirmed', body, c.appUrl)
}

export function htmlPaymentFailed(c: Ctx) {
  const body = `<h1 style="margin:0 0 12px;font-size:22px;color:#b91c1c;">Payment issue</h1>
<p style="color:#4b5563;font-size:15px;">Hi ${c.customerName},</p>
<p style="color:#4b5563;font-size:15px;">We couldn’t complete payment for <strong>${c.serviceType}</strong> (${c.bookingDate}).</p>
<div style="background:#fffbeb;border-left:4px solid #F5A623;padding:14px;margin:16px 0;border-radius:8px;">
<p style="margin:0;font-size:14px;color:#92400e;">Retry with UPI, card, or net banking. Need help? Call <strong>9810223963</strong>.</p></div>
<div style="text-align:center;margin:20px 0;"><a href="${c.payUrl}" style="display:inline-block;background:linear-gradient(135deg,#1D9E75,#0F6E56);color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px;">Retry payment</a></div>`
  return wrap('Payment issue', body, c.appUrl)
}

export function htmlReminder24h(c: Ctx) {
  const body = `<h1 style="margin:0 0 12px;font-size:22px;color:#1a2b4a;">Visit tomorrow</h1>
<p style="color:#4b5563;">Hi ${c.customerName},</p>
<p style="color:#4b5563;">Reminder: <strong>${c.serviceType}</strong> on <strong>${c.bookingDate}</strong> · ${c.bookingTime}</p>
<p style="color:#4b5563;font-size:14px;">📍 ${c.serviceAddress}</p>
<div style="text-align:center;margin:20px 0;"><a href="${c.ticketUrl}" style="display:inline-block;background:linear-gradient(135deg,#1D9E75,#0F6E56);color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px;">View booking</a></div>`
  return wrap('Reminder', body, c.appUrl)
}

export function htmlReminder2h(c: Ctx) {
  const body = `<h1 style="margin:0 0 8px;font-size:22px;color:#1a2b4a;">Visit in ~2 hours</h1>
<p style="color:#4b5563;">Hi ${c.customerName},</p>
<p style="color:#4b5563;"><strong>${c.serviceType}</strong> · ${c.bookingTime}</p>
<p style="color:#4b5563;">Technician: <strong>${c.technicianName || 'CasaCare partner'}</strong></p>
<div style="text-align:center;margin:20px 0;"><a href="${c.trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#1D9E75,#0F6E56);color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px;">Track / details</a></div>`
  return wrap('Visit soon', body, c.appUrl)
}

export function htmlLiveTracking(c: Ctx) {
  const body = `<h1 style="margin:0 0 8px;font-size:22px;color:#1a2b4a;">Technician on the way</h1>
<p style="color:#4b5563;">Hi ${c.customerName},</p>
<p style="color:#4b5563;">Live updates are available for your <strong>${c.serviceType}</strong> visit.</p>
<div style="text-align:center;margin:20px 0;"><a href="${c.trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#1D9E75,#0F6E56);color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px;">Open tracking</a></div>`
  return wrap('Tracking', body, c.appUrl)
}

export function htmlServiceCompleted(c: Ctx) {
  const body = `<h1 style="margin:0 0 8px;font-size:22px;color:#1a2b4a;">Service complete ✓</h1>
<p style="color:#4b5563;">Hi ${c.customerName},</p>
<p style="color:#4b5563;">Your <strong>${c.serviceType}</strong> job is complete.</p>
<table width="100%" style="background:#f0fdf4;border-radius:8px;padding:12px;margin:12px 0;">
<tr><td style="font-size:14px;">Technician</td><td style="text-align:right;font-weight:700;">${c.technicianName || '—'}</td></tr>
<tr><td style="font-size:14px;padding-top:6px;">Invoice ref</td><td style="text-align:right;">${c.invoiceId}</td></tr>
<tr><td style="font-size:14px;padding-top:6px;">Amount</td><td style="text-align:right;font-weight:700;">₹${c.amount}</td></tr>
</table>
<div style="text-align:center;margin:16px 0;">
<a href="${c.photosUrl}" style="display:inline-block;margin:4px;background:#1D9E75;color:#fff;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:10px;">Photos</a>
<a href="${c.rateUrl}" style="display:inline-block;margin:4px;background:#1a2b4a;color:#fff;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:10px;">Rate</a>
</div>`
  return wrap('Completed', body, c.appUrl)
}

export function htmlFollowup3d(c: Ctx) {
  const body = `<h1 style="margin:0 0 8px;font-size:22px;color:#1a2b4a;">Quick check-in</h1>
<p style="color:#4b5563;">Hi ${c.customerName},</p>
<p style="color:#4b5563;">How is your <strong>${c.serviceType}</strong> holding up after your visit?</p>
<div style="text-align:center;margin:20px 0;"><a href="${c.feedbackUrl}" style="display:inline-block;background:linear-gradient(135deg,#1D9E75,#0F6E56);color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px;">Share feedback</a></div>
<p style="font-size:13px;color:#9ca3af;">Problems within 7 days? <strong>9810223963</strong></p>`
  return wrap('Follow-up', body, c.appUrl)
}

export const subjects: Record<string, string> = {
  booking_confirmed: '✓ Your CasaCare booking is confirmed',
  payment_failed: 'Payment needed — CasaCare booking',
  reminder_24h: 'Reminder: your CasaCare visit is tomorrow',
  reminder_2h: 'Your CasaCare visit is in ~2 hours',
  live_tracking: 'Live tracking — CasaCare technician',
  service_completed: '✓ Service completed — CasaCare',
  followup_3day: 'Quick check-in — CasaCare',
}
