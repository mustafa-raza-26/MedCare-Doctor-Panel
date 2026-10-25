import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isConfigured, NOT_CONFIGURED_MESSAGE, TABLES } from '../lib/supabase'

const AuthContext = createContext(null)
const notConfigured = () => ({ error: { message: NOT_CONFIGURED_MESSAGE } })

/**
 * Admin auth.
 *
 * The patient site and this portal can share one Supabase project, so a valid login alone is NOT
 * enough: the user must also have a row in `Admin_Portal_User` (matched by email). Otherwise
 * any patient account could open the admin panel. (For real protection also use Row Level Security.)
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [booting, setBooting] = useState(isConfigured)
  const [member, setMember] = useState(null) // the Admin_Portal_User row
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!supabase) return undefined
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setBooting(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setBooting(false)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const user = session?.user ?? null
  const email = user?.email

  // Look up (or, on first login after signup, create) the admin row.
  useEffect(() => {
    if (!supabase || !email) {
      setMember(null)
      setChecking(false)
      return undefined
    }
    let active = true
    setChecking(true)
    ;(async () => {
      const { data, error } = await supabase
        .from(TABLES.doctors)
        .select('name,specialty,email,number')
        .eq('email', email)
        .limit(1)
      if (!active) return
      if (error) {
        console.warn('Admin lookup failed:', error.message)
        setMember(null)
      } else if (data && data.length) {
        setMember(data[0])
      } else if (user.user_metadata?.portal === 'admin') {
        // Signed up through this portal but the row insert was blocked before login (e.g. email
        // confirmation on). Create it now that the user is authenticated. Never stores a password.
        const m = user.user_metadata
        const row = { name: m.full_name || email, specialty: m.specialty || '', email, number: m.phone_number || '' }
        const { error: insErr } = await supabase.from(TABLES.doctors).insert(row)
        if (insErr) {
          console.warn('Could not create admin row:', insErr.message)
          setMember(null)
        } else setMember(row)
      } else {
        setMember(null)
      }
      if (active) setChecking(false)
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  const signIn = useCallback(async (mail, password) => {
    if (!supabase) return notConfigured()
    return supabase.auth.signInWithPassword({ email: mail, password })
  }, [])

  const signUp = useCallback(async ({ name, specialty, email: mail, number, password }) => {
    if (!supabase) return notConfigured()
    const { data, error } = await supabase.auth.signUp({
      email: mail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: name, phone_number: number, specialty, portal: 'admin' },
      },
    })
    if (error) return { error }
    // NOTE: the password is NOT copied into the table (the original stored it in plain text).
    const { error: dbError } = await supabase
      .from(TABLES.doctors)
      .insert({ name, specialty, email: mail, number })
    if (dbError) console.warn('Admin row will be created at first login:', dbError.message)
    return { error: null, hasSession: Boolean(data?.session) }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return notConfigured()
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [])

  const sendReset = useCallback(async (mail) => {
    if (!supabase) return notConfigured()
    return supabase.auth.resetPasswordForEmail(mail, { redirectTo: `${window.location.origin}/update-password` })
  }, [])

  const updatePassword = useCallback(async (password) => {
    if (!supabase) return notConfigured()
    return supabase.auth.updateUser({ password })
  }, [])

  const updateProfile = useCallback(
    async ({ name, specialty, number }) => {
      if (!supabase) return notConfigured()
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name, phone_number: number, specialty },
      })
      if (error) return { error }
      const { error: dbError } = await supabase
        .from(TABLES.doctors)
        .update({ name, specialty, number })
        .eq('email', email)
      if (dbError) return { error: dbError }
      setMember((m) => ({ ...(m || {}), name, specialty, number, email }))
      return { error: null }
    },
    [email],
  )

  const profile = user
    ? {
        id: user.id,
        email,
        name: member?.name || user.user_metadata?.full_name || email?.split('@')[0] || '',
        specialty: member?.specialty ?? user.user_metadata?.specialty ?? '',
        number: member?.number || user.user_metadata?.phone_number || '',
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
      }
    : null

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin: Boolean(member),
      loading: booting || (Boolean(email) && checking),
      isConfigured,
      signIn,
      signUp,
      signOut,
      sendReset,
      updatePassword,
      updateProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, member, booting, checking, signIn, signUp, signOut, sendReset, updatePassword, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
