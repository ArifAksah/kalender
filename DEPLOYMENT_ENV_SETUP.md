# Environment Variables Setup for Deployment

## Important: .env files are NOT deployed

Your `.env` and `client/.env` files are in `.gitignore` and won't be pushed to your deployment platform. You must set environment variables directly on your hosting platform.

## Step 1: Configure Supabase OAuth Redirect URLs

**This is CRITICAL for Google SSO to work on Vercel!**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers** → **Google**
4. In the "Redirect URLs" section, add your Vercel domain:
   - `https://your-vercel-domain.vercel.app/`
   - `https://your-vercel-domain.vercel.app`
   - `http://localhost:3000/` (for local development)
5. Click **Save**

## Step 2: For Vercel (Frontend - client/)

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SUPABASE_URL=https://vgadhedwyjsybqafqwkr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYWRoZWR3eWpzeWJxYWZxd2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzIwNTEsImV4cCI6MjA3Nzc0ODA1MX0.SzeionPpcLVZTb0ASu3fwKzf6qbFp7MDNL6WB7Tv-BM
```

4. Redeploy your project

## For Backend (Node.js)

If deploying on Heroku, Railway, or similar:

1. Set environment variables via CLI or dashboard:

```bash
# Heroku example
heroku config:set SUPABASE_URL=https://vgadhedwyjsybqafqwkr.supabase.co
heroku config:set SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
heroku config:set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
heroku config:set JWT_SECRET=your-secret-key
heroku config:set RESEND_API_KEY=re_aWjWqy8r_7aeEG7ru4s6cr7sVCkVo8ZFz
heroku config:set FROM_EMAIL=onboarding@resend.dev
heroku config:set APP_URL=https://your-frontend-url.com
```

## For Netlify

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add the same variables as Vercel

## Important Notes

- **REACT_APP_API_URL** should point to your deployed backend (not localhost:5000)
- Keep your API keys secure - never commit them to git
- Use different keys for development and production if possible
- Update APP_URL to your actual deployed frontend URL

## Troubleshooting

If auth still fails after setting env vars:

1. Check that REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set
2. Verify your backend is running and accessible
3. Check browser console for specific error messages
4. Ensure Supabase Google OAuth redirect URL includes your deployed domain
