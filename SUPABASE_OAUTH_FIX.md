# Fix Supabase Google OAuth Redirect Issue

## Problem
When you deploy to Vercel and try to login with Google, it redirects back to `localhost:3000` instead of your Vercel domain.

## Root Cause
Supabase doesn't know about your Vercel domain in the authorized redirect URLs.

## Solution

### Step 1: Get Your Vercel Domain
1. Go to your Vercel project dashboard
2. Find your deployment URL (e.g., `https://my-app.vercel.app`)

### Step 2: Add to Supabase Authorized Redirect URLs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vgadhedwyjsybqafqwkr`
3. Go to **Authentication** → **Providers** → **Google**
4. Scroll down to "Redirect URLs"
5. Add these URLs:
   ```
   https://your-vercel-domain.vercel.app/
   https://your-vercel-domain.vercel.app
   http://localhost:3000/
   http://localhost:3000
   ```
   Replace `your-vercel-domain` with your actual Vercel domain

6. Click **Save**

### Step 3: Verify Vercel Environment Variables

1. Go to your Vercel project **Settings** → **Environment Variables**
2. Make sure these are set:
   ```
   REACT_APP_SUPABASE_URL=https://vgadhedwyjsybqafqwkr.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYWRoZWR3eWpzeWJxYWZxd2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzIwNTEsImV4cCI6MjA3Nzc0ODA1MX0.SzeionPpcLVZTb0ASu3fwKzf6qbFp7MDNL6WB7Tv-BM
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

3. **Redeploy** your project (push to git or click "Redeploy")

### Step 4: Test

1. Go to your Vercel domain
2. Click "Continue with Google"
3. You should now be redirected back to your Vercel domain (not localhost)

## Troubleshooting

### Still redirecting to localhost?
- Clear browser cache and cookies
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check that Supabase redirect URLs are saved correctly

### "Invalid redirect_uri" error?
- Make sure the URL in Supabase exactly matches your Vercel domain
- Include the trailing slash: `https://domain.vercel.app/`

### OAuth still not working?
- Check browser console for errors
- Verify REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in Vercel
- Make sure you redeployed after setting environment variables
