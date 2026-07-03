import { createClient } from '@supabase/supabase-js';

// We use the non-public env variables to ensure this client ONLY works on the server.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// The Service Role key bypasses RLS and should NEVER be exposed to the browser.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (typeof window !== 'undefined') {
  console.error("🚨 DANGER: Supabase Server client was imported in a client component!");
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
