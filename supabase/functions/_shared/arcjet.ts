import arcjet, { shield, tokenBucket } from "npm:@arcjet/deno@1.1.0"

type CorsHeaders = Record<string, string>

const arcjetKey = Deno.env.get("ARCJET_KEY")

const aj = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: "LIVE" }),
        tokenBucket({
          mode: "LIVE",
          refillRate: 20,
          interval: 10,
          capacity: 40,
        }),
      ],
    })
  : null

let missingKeyWarned = false

function json(
  body: Record<string, unknown>,
  status: number,
  cors: CorsHeaders,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })
}

export async function protectArcjetRequest(
  req: Request,
  cors: CorsHeaders,
): Promise<Response | null> {
  if (req.method === "OPTIONS") return null

  if (!aj) {
    if (!missingKeyWarned) {
      missingKeyWarned = true
      console.warn("ARCJET_KEY is not set. Arcjet protection is currently bypassed.")
    }
    return null
  }

  const decision = await aj.protect(req)

  if (decision.isDenied()) {
    const isRateLimit =
      typeof (decision.reason as { isRateLimit?: () => boolean })?.isRateLimit ===
        "function" &&
      (decision.reason as { isRateLimit: () => boolean }).isRateLimit()
    const reason = (decision.reason as { message?: string })?.message || "blocked"
    return json(
      { error: "Forbidden", code: "ARCJET_DENY", reason },
      isRateLimit ? 429 : 403,
      cors,
    )
  }

  if (decision.isErrored()) {
    const reason =
      (decision.reason as { message?: string })?.message || "Arcjet error"
    console.error("Arcjet protect errored:", reason)
  }

  return null
}

export function withArcjetProtection(
  handler: (req: Request) => Promise<Response> | Response,
  cors: CorsHeaders,
) {
  return async (req: Request): Promise<Response> => {
    const blocked = await protectArcjetRequest(req, cors)
    if (blocked) return blocked
    return await handler(req)
  }
}
