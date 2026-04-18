/**
 * After admin assigns a ticket, creates an in-app notification + logs SMS (and sends via MSG91 when configured).
 * Invoke with user JWT (admin). Body: { ticket_id: string }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function fmtWhen(iso: string | null | undefined) {
  if (!iso) return "Time TBD"
  try {
    const d = new Date(iso)
    return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  } catch {
    return "Time TBD"
  }
}

function normalizeIndiaPhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  const d = raw.replace(/\D/g, "")
  if (d.length >= 10) return d.slice(-10)
  return null
}

/** MSG91 legacy sendhttp (transactional). Set MSG91_AUTHKEY + MSG91_SENDER_ID (6 chars) to enable. */
async function tryMsg91Send(mobile10: string, message: string): Promise<{ ok: boolean; err?: string }> {
  const key = Deno.env.get("MSG91_AUTHKEY")
  const sender = Deno.env.get("MSG91_SENDER_ID")
  if (!key || !sender) return { ok: false, err: "MSG91 not configured" }

  const params = new URLSearchParams({
    authkey: key,
    mobiles: `91${mobile10}`,
    message,
    sender,
    route: "4",
    country: "91",
  })
  const res = await fetch(`https://api.msg91.com/api/sendhttp.php?${params.toString()}`)
  const text = await res.text()
  if (!res.ok) return { ok: false, err: `${res.status} ${text}` }
  // API returns request id string on success
  if (text.toLowerCase().includes("error") || text.includes("Invalid")) return { ok: false, err: text }
  return { ok: true }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!
    const appUrl = Deno.env.get("PUBLIC_APP_URL") || "https://casacare-app.vercel.app"
    const admin = createClient(supabaseUrl, serviceKey)

    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } })
    }
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } })
    }

    const { data: adminProfile } = await admin.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
    if (adminProfile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } })
    }

    const body = await req.json()
    const ticketId = body.ticket_id as string
    if (!ticketId) {
      return new Response(JSON.stringify({ error: "ticket_id required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } })
    }

    const { data: ticket, error: tErr } = await admin.from("tickets").select("*").eq("id", ticketId).maybeSingle()
    if (tErr || !ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } })
    }
    const assignee = ticket.assigned_to as string | null
    if (!assignee) {
      return new Response(JSON.stringify({ error: "Ticket has no assignee" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } })
    }

    const { data: tech } = await admin.from("profiles").select("full_name, phone, email").eq("id", assignee).maybeSingle()
    const title = String(ticket.title || "Service job")
    const cat = String(ticket.category || "")
    const addr = String(ticket.address || "Address in app")
    const when = fmtWhen(ticket.scheduled_at as string | null)
    const inAppMsg =
      `New job: ${title}${cat ? ` · ${cat}` : ""} · ${addr} · ${when}. Tap My Jobs to open.`

    const { error: nErr } = await admin.from("notifications").insert({
      user_id: assignee,
      ticket_id: ticketId,
      message: inAppMsg,
      type: "job_assigned",
      read: false,
    })
    if (nErr) {
      console.error("notifications insert", nErr)
      return new Response(JSON.stringify({ error: nErr.message }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } })
    }

    const phone10 = normalizeIndiaPhone(tech?.phone || null)
    const smsBody =
      `Casa Care: New job — ${title}. ${when}. Open app: ${appUrl}/my-jobs · Help 9810223963`

    let smsStatus: "sent" | "failed" | "pending" = "pending"
    let smsErr: string | null = null

    if (phone10) {
      const send = await tryMsg91Send(phone10, smsBody.slice(0, 480))
      if (send.ok) {
        smsStatus = "sent"
      } else if (send.err === "MSG91 not configured") {
        smsStatus = "pending"
        smsErr = null
      } else {
        smsStatus = "failed"
        smsErr = send.err || "SMS send failed"
      }
    } else {
      smsErr = "Technician phone not on file"
    }

    const { error: logErr } = await admin.from("booking_notifications").insert({
      booking_id: ticketId,
      user_id: assignee,
      notification_type: "sms",
      event_type: "technician_assigned",
      recipient: phone10 ? `+91${phone10}` : tech?.email || "no-phone",
      subject: null,
      template_name: "technician_assigned_sms",
      status: smsStatus,
      error_message: smsErr,
      sent_at: smsStatus === "sent" ? new Date().toISOString() : null,
    })
    if (logErr) console.error("booking_notifications sms log", logErr)

    return new Response(
      JSON.stringify({
        ok: true,
        in_app: true,
        sms: phone10 ? { status: smsStatus, detail: smsErr } : { status: "skipped", detail: "no_phone" },
      }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } })
  }
})
