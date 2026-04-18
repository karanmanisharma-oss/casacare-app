# CasaCare — Email branding (Supabase + SendGrid)

This app is a **Vite + React** SPA. Auth emails are sent by **Supabase Auth**, not from the browser. To show **CasaCare** as the sender and use **branded HTML**, configure **SendGrid SMTP inside the Supabase project** and paste the templates from `supabase/email-templates/`.

## Security

- **Never commit** SendGrid API keys or paste them into client-side code.
- If an API key was shared in chat or committed, **rotate it** in SendGrid → API Keys.
- The React app only needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (already in `.env` / Vercel).

## 1. SendGrid

1. Create a SendGrid account and complete sender verification (single sender or domain authentication).
2. Create an API key (for SMTP password).
3. SMTP settings Supabase will use:
   - **Host:** `smtp.sendgrid.net`
   - **Port:** `587` (TLS) or `465` (SSL)
   - **Username:** `apikey`
   - **Password:** your SendGrid API key (the `SG.` secret)

## 2. Supabase Dashboard

**Authentication → Providers → Email**

- Ensure email confirmations are enabled as required by your product.

**Project Settings → Authentication → SMTP Settings**

- Enable **Custom SMTP**
- Enter host, port, user `apikey`, password = SendGrid API key
- **Sender email / name:** use a verified address and a **customer-facing name** (e.g. `support@casacare.in`, **`CasaCare`**). If you leave the default, inboxes may still show **“Supabase Auth”** as the sender display name until SMTP + name are set correctly.

**Authentication → URL Configuration**

- **Site URL:** `https://casacare-app.vercel.app` (must be your real app URL — **not** `http://localhost:3000`, or confirmation links opened on a phone will fail: the phone tries to reach *its own* localhost).
- **Redirect URLs:** add wildcard coverage so PKCE redirects always match, e.g.:
  - `https://casacare-app.vercel.app/**`
  - `http://localhost:5173/**` (Vite; adjust port if yours differs)
  - `http://127.0.0.1:5173/**`
  And explicitly if you prefer lists:
  - `https://casacare-app.vercel.app/verify`
  - `https://casacare-app.vercel.app/reset-password`

## 3. Email templates (subjects + bodies)

In **Authentication → Email Templates**, set **subjects** to CasaCare-style text, e.g.:

| Template        | Suggested subject                       |
|----------------|-----------------------------------------|
| Confirm signup | `Confirm your CasaCare email`           |
| Reset password | `Reset your CasaCare password`          |

Copy the HTML from:

- `supabase/email-templates/confirm_signup.html` → **Confirm signup**
- `supabase/email-templates/reset_password.html` → **Reset password**
- `supabase/email-templates/email_verified_welcome.html` → optional (custom automation / marketing; not wired by default)

Supabase replaces `{{ .ConfirmationURL }}`, `{{ .Email }}`, etc. (see [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)).

## 4. App behaviour (this repo)

- New signups use `emailRedirectTo: …/verify` via `getAuthSiteOrigin()` (`src/lib/authSiteUrl.js` + `src/hooks/useAuth.jsx`). **Production builds** use `https://casacare-app.vercel.app` so emailed links work on any device; local dev uses the current origin (e.g. `http://localhost:5173`).
- If the project requires **email confirmation**, users see an on-screen “check your email” step with **Resend** (`Register.jsx`, `Login.jsx`, `EmailVerificationBanner.jsx`).
- Route **`/verify`** (`src/pages/VerifyEmail.jsx`) completes the session and redirects to `/dashboard`.
- Password reset emails redirect to **`/reset-password`** using the same site origin helper (`Login.jsx`).

## 5. Why not `@sendgrid/client` in the frontend?

Calling SendGrid from the browser would **expose** the API key. For transactional auth mail, **Supabase + SMTP** is the correct pattern. Optional later: Supabase Edge Functions or a small serverless API with `SENDGRID_API_KEY` only on the server.

## 6. Production check

After SMTP is live, run through: **register → inbox (CasaCare sender + branding) → link → `/verify` → dashboard → forgot password → `/reset-password`.**

## 7. Technician job alerts (in-app + SMS)

- When an **admin assigns** a ticket, the app calls the Edge Function `notify-technician-assignment`: it inserts the **in-app** notification (service role, reliable) and logs / sends **SMS** when `MSG91_AUTHKEY` + `MSG91_SENDER_ID` are set on the function.
- Field technicians see a **real-time bell** update if **Realtime** is enabled for the `notifications` table (Supabase → **Database → Publications** / table Realtime toggle).
