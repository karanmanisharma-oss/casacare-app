# CasaCare App — Setup Guide
# Follow these steps IN ORDER. Takes about 30 minutes total.

## ✅ STEP 1 — Set up the database in Supabase (5 mins)

1. Go to https://supabase.com and log into your account
2. Open your project
3. Click **SQL Editor** in the left menu
4. Click **New query** (top right)
5. Open the file `SUPABASE_SETUP.sql` from this folder
6. Copy ALL the text inside it
7. Paste it into the SQL Editor
8. Click the **Run** button (green button, bottom right)
9. You should see "Success. No rows returned"

## ✅ STEP 2 — Get your Supabase keys (2 mins)

1. In Supabase, click **Project Settings** (gear icon, left menu)
2. Click **API**
3. Copy the **Project URL** — looks like: https://xxxxx.supabase.co
4. Copy the **anon public** key — a long string starting with "eyJ..."
5. Keep these handy for Step 4

## ✅ STEP 3 — Upload code to GitHub (10 mins)

Option A — Easy way (GitHub Desktop):
1. Download GitHub Desktop from https://desktop.github.com
2. Install and sign into your GitHub account
3. Click File > Add Local Repository
4. Browse to the casacare-app folder you extracted
5. Click "create a repository" link
6. Name it "casacare-app", click Create Repository
7. Click "Publish repository" (top bar)
8. Uncheck "Keep this code private" if you want (either is fine)
9. Click Publish Repository

Option B — Command line (if you're comfortable):
```
cd casacare-app
git init
git add .
git commit -m "Initial CasaCare MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/casacare-app.git
git push -u origin main
```

## ✅ STEP 4 — Deploy to Vercel (5 mins)

1. Go to https://vercel.com and log in
2. Click **Add New Project**
3. Find your casacare-app repository and click **Import**
4. Under **Environment Variables**, add these three:

   Variable name: VITE_SUPABASE_URL
   Value: (paste your Supabase Project URL from Step 2)

   Variable name: VITE_SUPABASE_ANON_KEY
   Value: (paste your Supabase anon key from Step 2)

   Variable name: VITE_RAZORPAY_KEY_ID
   Value: (your Razorpay key — get from razorpay.com dashboard, leave blank for now)

5. Click **Deploy**
6. Wait 2-3 minutes
7. Vercel will give you a live URL like: https://casacare-app.vercel.app

## ✅ STEP 5 — Enable Email Auth in Supabase (2 mins)

1. In Supabase, go to **Authentication** > **Providers**
2. Make sure **Email** is enabled (it is by default)
3. Go to **Authentication** > **URL Configuration**
4. Set Site URL to your Vercel URL: https://casacare-app.vercel.app

## ✅ STEP 6 — Test your live app!

1. Open your Vercel URL in a browser
2. Click **Register**
3. Create a test account — choose any role
4. Check your email and click the verification link
5. Sign in and explore your dashboard

---

## 🔧 Running locally (for development)

1. Copy .env.example to .env:
   - On Windows: copy .env.example .env
   - On Mac: cp .env.example .env

2. Open .env in Notepad and fill in your Supabase values

3. Open Command Prompt in the casacare-app folder and run:
   npm install
   npm run dev

4. Open http://localhost:5173 in your browser

---

## 📞 Help
Business contact: 9810223963
