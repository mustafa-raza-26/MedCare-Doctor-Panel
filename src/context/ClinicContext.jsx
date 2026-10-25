import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, TABLES } from '../lib/supabase'
import { belongsTo, computeStats, timeOf } from '../lib/clinic'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const ClinicContext = createContext(null)
const SCOPE_KEY = 'ap_scope'

/**
 * Loads appointments (`patientData`) and doctors (`Admin_Portal_User`) once for every admin page.
 * `scope`: "mine" = only the signed-in doctor's patients, "all" = whole clinic.
 */
export function ClinicProvider({ children }) {
  const { profile } = useAuth()
  const toast = useToast()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [scope, setScopeState] = useState(() => {
    try {
      return localStorage.getItem(SCOPE_KEY) === 'all' ? 'all' : 'mine'
    } catch {
      return 'mine'
    }
  })

  const setScope = useCallback((s) => {
    setScopeState(s)
    try {
      localStorage.setItem(SCOPE_KEY, s)
    } catch {
      /* ignore */
    }
  }, [])

  const reload = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    const [a, d] = await Promise.all([
      supabase.from(TABLES.appointments).select('*'),
      // Explicit columns: never pull anything sensitive (like a stored password) into the browser.
      supabase.from(TABLES.doctors).select('name,specialty,email,number'),
    ])
    if (a.error) toast.error(`Could not load appointments: ${a.error.message}`)
    else setAppointments((a.data || []).sort((x, y) => timeOf(y) - timeOf(x)))
    if (d.error) toast.error(`Could not load doctors: ${d.error.message}`)
    else setDoctors(d.data || [])
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const scoped = useMemo(
    () => (scope === 'all' ? appointments : appointments.filter((a) => belongsTo(a, profile?.name))),
    [appointments, scope, profile?.name],
  )
  const stats = useMemo(() => computeStats(scoped), [scoped])

  const value = useMemo(
    () => ({ appointments, scoped, doctors, stats, loading, reload, scope, setScope }),
    [appointments, scoped, doctors, stats, loading, reload, scope, setScope],
  )
  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
}

export function useClinic() {
  const ctx = useContext(ClinicContext)
  if (!ctx) throw new Error('useClinic must be used inside <ClinicProvider>')
  return ctx
}
