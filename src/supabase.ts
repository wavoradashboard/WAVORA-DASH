import { createClient } from '@supabase/supabase-js';

const getEnvValue = (value: any, fallback: string): string => {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  return fallback;
};

const SUPABASE_URL = getEnvValue(import.meta.env.VITE_SUPABASE_URL, 'https://piqzvuooqdrobqqewgtx.supabase.co');
const SUPABASE_ANON_KEY = getEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY, 'sb_publishable_3N-9cM8hyEkVV2sPaDqm0g_eA2PkYR9');

// Provide a custom fetch implementation that safely handles network errors (e.g. offline mode, invalid dummy URL)
const customFetch = async (url: RequestInfo | URL, init?: RequestInit) => {
  const urlString = typeof url === 'string' ? url : (url && 'href' in url ? (url as URL).href : String(url));
  try {
    const res = await fetch(url, init);
    // If Supabase auth endpoint returns 5xx status, rewrite response to prevent Gotrue from throwing AuthRetryableFetchError
    if (!res.ok && res.status >= 500 && urlString.includes('/auth/v1/')) {
      if (urlString.includes('/user') || urlString.includes('refresh_token') || urlString.includes('/session')) {
        return new Response(JSON.stringify({ access_token: null, user: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: 'server_error', error_description: 'Supabase server temporarily unavailable' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return res;
  } catch (e) {
    console.warn('Supabase network request failed (offline mode fallback active):', urlString, e);
    
    // For auth calls, returning 200 or 400 avoids AuthRetryableFetchError uncaught exceptions
    if (urlString.includes('/auth/v1/')) {
      if (urlString.includes('/user') || urlString.includes('refresh_token') || urlString.includes('/session')) {
        return new Response(JSON.stringify({ access_token: null, user: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: 'offline', error_description: 'Database connection offline' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'offline', message: 'Offline mode active - database unreachable' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Main client used for standard authentication (login, logout, active user sessions)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: false, // Prevent unhandled background token refresh errors when offline
    detectSessionInUrl: false
  },
  global: {
    fetch: customFetch
  }
});

// Secondary client with session storage disabled, specifically used by the Administrator to provision 
// new user accounts without triggering automatic session updates or logging the admin out.
export const isolatedAdminSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    fetch: customFetch
  }
});

// Helper function to safely fetch session without throwing unhandled exceptions
export const safeGetSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { session: null, error };
    return { session: data?.session || null, error: null };
  } catch (e: any) {
    console.warn("Safely handled Supabase session fetch exception:", e);
    return { session: null, error: e };
  }
};

