# Database Setup Guide

## Step 1: Create Tables

1. Go to your Supabase project: https://supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `backend/database/schema.sql` and paste it into the SQL editor
5. Click **Run** to create all tables

## Step 2: Enable Row Level Security (RLS)

1. Go to **SQL Editor** → **New Query**
2. Copy the contents of `backend/database/rls_policies.sql` and paste it
3. Click **Run** to apply all RLS policies

**Important:** These policies allow:
- Public users to view public/approved courses
- Authenticated users to create and manage their own content
- Backend (service role) to manage user profiles during signup

## Step 3: Seed Sample Data (Optional)

1. Go to **SQL Editor** → **New Query**
2. Copy the contents of `backend/database/seed.sql` and paste it
3. Click **Run** to populate sample tags and other data

## Step 4: Configure Environment Variables

Create a `.env` file in the `backend` folder with:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**How to get these from Supabase:**
1. Go to **Settings** → **API**
2. Copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

## Step 5: Start Backend

```bash
cd backend
npm install
npm run dev
```

Server will run on `http://localhost:5001`

## Step 6: Test Authentication

### Signup
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123!",
    "full_name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123!"
  }'
```

The login response will include an `access_token` that you can use for authenticated requests.

## Troubleshooting

### "Database error saving new user"
- Check that schema.sql has been run
- Check that RLS policies have been run
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly

### "Invalid login credentials"
- Confirm the user was successfully created during signup
- Check that the email/password are correct

### "Authentication required"
- Make sure to include the `Authorization: Bearer <token>` header for protected routes
