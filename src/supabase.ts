import { createClient } from '@supabase/supabase-js';

const getEnvValue = (value: any, fallback: string): string => {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  return fallback;
};

const SUPABASE_URL = getEnvValue(import.meta.env.VITE_SUPABASE_URL, 'https://piqzvuooqdrobqqewgtx.supabase.co');
const SUPABASE_ANON_KEY = getEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY, 'sb_publishable_3N-9cM8hyEkVV2sPaDqm0g_eA2PkYR9');

// Main client used for standard authentication (login, logout, active user sessions)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Secondary client with session storage disabled, specifically used by the Administrator to provision 
// new user accounts without triggering automatic session updates or logging the admin out.
export const isolatedAdminSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
