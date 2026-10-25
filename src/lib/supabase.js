import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client.
 *
 * Put your own project values in a `.env` file (see `.env.example`):
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 *
 * If they are missing the app still renders (so you can work on the UI),
 * `supabase` is `null` and every data call is skipped with a friendly message.
 */
const url = 'https://escflpzgeayghspqdkcr.supabase.co';
const key = 'sb_publishable_X3l_oYzwfdLDEfOVXIwB2w_wcYfCBn2';

export const isConfigured = Boolean(url && key)

export const supabase = isConfigured
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

export const NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'

/** Table names used by the original project, kept in one place. */
export const TABLES = {
  doctors: 'Admin_Portal_User',
  appointments: 'patientData',
}
