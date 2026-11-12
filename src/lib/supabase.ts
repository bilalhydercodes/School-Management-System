import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kxtdvzyftfhryvbpbohb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseAnonKey.includes('placeholder')
);

// Client-side / public Supabase instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Server-side admin client using service role key (for privileged operations if configured)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  !supabaseServiceKey.includes('placeholder')
);

export const supabaseAdmin = isSupabaseAdminConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Initiates Google OAuth via Supabase if configured.
 */
export async function signInWithGoogleSupabase(redirectTo?: string) {
  if (!supabase) {
    throw new Error('Supabase client is not configured with valid public keys.');
  }

  const callbackUrl =
    redirectTo ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth/callback/supabase`
      : '/api/auth/callback/supabase');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return data;
}

