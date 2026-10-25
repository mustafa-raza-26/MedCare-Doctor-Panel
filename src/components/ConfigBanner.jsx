import { isConfigured } from '../lib/supabase'

export default function ConfigBanner() {
  if (isConfigured) return null
  return (
    <div className="ap-config-banner" role="alert">
      <i className="bi bi-plug me-2" />
      Supabase is not connected. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your{' '}
      <code>.env</code> file to enable login and live data.
    </div>
  )
}
