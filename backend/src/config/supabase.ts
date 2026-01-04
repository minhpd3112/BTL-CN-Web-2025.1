import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Security options for Supabase clients
const supabaseOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'EduLearn-Backend/1.0.0',
    },
  },
};

// Client for regular operations (uses anon key)
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, supabaseOptions);

// Service role client for admin operations (bypasses RLS)
export const supabaseAdmin = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, supabaseOptions)
  : supabase;