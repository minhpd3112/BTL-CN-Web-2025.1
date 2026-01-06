# Supabase Local Development Setup

## Issue: Redirecting to Deployed Site Instead of Localhost

If you're being redirected to the deployed domain (e.g., `edulearn.id.vn`) after login instead of staying on `http://localhost:3000`, it's because **Supabase OAuth doesn't recognize localhost as a valid redirect URL**.

## Solution: Add Localhost to Supabase Allowed Redirects

### Step 1: Go to Supabase Dashboard
- Visit: https://app.supabase.com
- Select your project (tfdqmenqfwbuuzxlrekm)

### Step 2: Navigate to Authentication Settings
- In the left sidebar, go to **Authentication** → **Providers**
- Or go to **Authentication** → **Settings**

### Step 3: Add Redirect URLs
Look for a section called **"Redirect URLs"** or **"Additional Redirect URLs"**

Add the following URLs:
```
http://localhost:3000
http://localhost:3000/
http://localhost:5173
http://localhost:5173/
```

### Step 4: Save Changes
Click **Save** or **Update** to apply the changes.

## What These URLs Are For

- `http://localhost:3000` - Your frontend dev server (if running on port 3000)
- `http://localhost:5173` - Vite default port (alternative)
- Email password reset redirects
- Google OAuth redirects
- Magic link authentication

## Verification

After adding these URLs:

1. Clear browser cookies for localhost
2. Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)
3. Try logging in again
4. You should stay on `http://localhost:3000` instead of being redirected

## Frontend Configuration

The frontend code already uses:
- `VITE_API_URL=http://localhost:5001/api` for backend API
- `VITE_SUPABASE_URL=https://tfdqmenqfwbuuzxlrekm.supabase.co` for Supabase
- `window.location.origin` for OAuth redirects (automatically uses current origin)

## If Still Redirecting

1. **Check Supabase Project Settings**:
   - Verify you're editing the correct project
   - Make sure changes are saved
   - Wait a minute for changes to propagate

2. **Check Auth Providers Configuration**:
   - Go to **Authentication** → **Providers**
   - Ensure Google OAuth is enabled
   - Verify the credentials are correct

3. **Clear All Cookies**:
   - DevTools → Application → Cookies → Delete all cookies
   - Hard refresh the page

4. **Check Console for Errors**:
   - Open DevTools → Console
   - Look for any Supabase auth errors
   - Check Network tab for OAuth redirect responses

## Production vs Development

When you deploy to production:
- Add your production domain to allowed redirect URLs
- Example: `https://edulearn.id.vn`
- Keep localhost URLs for development

The frontend code handles this automatically by using `window.location.origin`.
