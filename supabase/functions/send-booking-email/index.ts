import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"
import {
  type Ctx,
  htmlBookingConfirmed,
  htmlPaymentFailed,
  htmlReminder24h,
  htmlReminder2h,
  htmlLiveTracking,
  htmlServiceCompleted,
  htmlFollowup3d,
  subjects,
} from "./emailBodies.ts"
import { protectArcjetRequest } from "../_shared/arcjet.ts"

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type EventType =
  | "booking_confirmed"
  | "payment_failed"
  | "reminder_24h"
  | "reminder_2h"
  | "live_tracking"
  | "service_completed"
  | "followup_3day"

function fmtDate(d: string | null | undefined) {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return String(d)
  }
}

function fmtTime(d: string | null | undefined) {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  } catch {
    return String(d)
  }
}

function buildCtx(
  ticket: Record<string, unknown>,
  customerEmail: string,
  customerName: string,
  techName: string,
  appUrl: string,
): Ctx {
  const id = String(ticket.id)
  const short = id.replace(/-/g, "").slice(0, 8)
  const amount = ticket.payment_amount != null ? String(ticket.payment_amount) : "—"
  const addr = String(ticket.address || "—")
  const cat = String(ticket.category || ticket.title || "Service")
  const scheduled = ticket.scheduled_at as string | null

  return {
    customerName: customerName || customerEmail.split("@")[0] || "there",
    serviceType: cat,
    bookingDate: fmtDate(scheduled),
    bookingTime: fmtTime(scheduled),
    serviceAddress: addr,
    bookingRef: short,
    amount,
    technicianName: techName,
    serviceDuration: "—",
    invoiceId: short.toUpperCase(),
    trackingUrl: `${appUrl}/tickets`,
    ticketUrl: `${appUrl}/tickets`,
    payUrl: `${appUrl}/tickets`,
    rescheduleUrl: `${appUrl}/tickets`,
    cancelUrl: `${appUrl}/tickets`,
    photosUrl: `${appUrl}/tickets`,
    rateUrl: `${appUrl}/tickets`,
    feedbackUrl: `${appUrl}/tickets`,
    appUrl,
  }
}

async function sendSendGrid(to: string, subject: string, html: string): Promise<{ ok: boolean; err?: string }> {
  const key = Deno.env.get("SENDGRID_API_KEY")
  const fromEmail = Deno.env.get("SENDGRID_FROM_EMAIL") || "support@casacare.in"
  const fromName = Deno.env.get("SENDGRID_FROM_NAME") || "CasaCare"
  if (!key) {
    return { ok: false, err: "SENDGRID_API_KEY not set on Edge Function secrets" }
  }
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  })
  if (res.status === 202 || res.status === 200) return { ok: true }
  const t = await res.text()
  return { ok: false, err: `${res.status} ${t}` }
}

Deno.serve(withArcjetProtection(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } })
  }

  const denied = await protectArcjetRequest(req, cors)
  if (denied) return denied

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!
    const admin = createClient(supabaseUrl, serviceKey)

    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } })
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } })
    }
    const user = userData.user

    const body = await req.json()
    const ticketId = body.ticket_id || body.booking_id
    const eventType = body.event_type as EventType
    if (!ticketId || !eventType) {
      return new Response(JSON.stringify({ error: "ticket_id (or booking_id) and event_type required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      })
    }

    const { data: ticket, error: tErr } = await admin.from("tickets").select("*").eq("id", ticketId).maybeSingle()
    if (tErr || !ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } })
    }

    const { data: profile } = await admin.from("profiles").select("email, full_name, role, phone").eq("id", user.id).maybeSingle()
    const isAdmin = profile?.role === "admin"
    const isOwner = ticket.user_id === user.id
    const isAssignedField =
      profile?.role === "field_force" && ticket.assigned_to === user.id
    if (!isAdmin && !isOwner && !isAssignedField) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } })
    }

    const { data: owner } = await admin.from("profiles").select("email, full_name").eq("id", ticket.user_id).maybeSingle()
    const toEmail = owner?.email
    if (!toEmail) {
      return new Response(JSON.stringify({ error: "Customer email missing" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } })
    }

    let techName = ""
    if (ticket.assigned_to) {
      const { data: tech } = await admin.from("profiles").select("full_name").eq("id", ticket.assigned_to).maybeSingle()
      techName = tech?.full_name || ""
    }

    const appUrl = Deno.env.get("PUBLIC_APP_URL") || "https://casacare-app.vercel.app"
    const ctx = buildCtx(ticket, toEmail, owner?.full_name || "", techName, appUrl)

    let html = ""
    let templateName = ""
    const subject = subjects[eventType] || "CasaCare update"

    switch (eventType) {
      case "booking_confirmed":
        html = htmlBookingConfirmed(ctx)
        templateName = "booking_confirmed"
        break
      case "payment_failed":
        html = htmlPaymentFailed(ctx)
        templateName = "payment_failed"
        break
      case "reminder_24h":
        html = htmlReminder24h(ctx)
        templateName = "reminder_24h"
        break
      case "reminder_2h":
        html = htmlReminder2h(ctx)
        templateName = "reminder_2h"
        break
      case "live_tracking":
        html = htmlLiveTracking(ctx)
        templateName = "live_tracking"
        break
      case "service_completed":
        html = htmlServiceCompleted(ctx)
        templateName = "service_completed"
        break
      case "followup_3day":
        html = htmlFollowup3d(ctx)
        templateName = "followup_3day"
        break
      default:
        return new Response(JSON.stringify({ error: `Unknown event_type: ${eventType}` }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        })
    }

    const send = await sendSendGrid(toEmail, subject, html)

    const { error: insErr } = await admin.from("booking_notifications").insert({
      booking_id: ticketId,
      user_id: ticket.user_id,
      notification_type: "email",
      event_type: eventType,
      recipient: toEmail,
      subject,
      template_name: templateName,
      status: send.ok ? "sent" : "failed",
      error_message: send.err || null,
      sent_at: send.ok ? new Date().toISOString() : null,
    })

    if (insErr) console.error("booking_notifications insert", insErr)

    return new Response(
      JSON.stringify({
        success: send.ok,
        event_type: eventType,
        email: toEmail,
        sendgrid_error: send.err || null,
      }),
      { status: send.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" } },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } })
  }
}, cors))
