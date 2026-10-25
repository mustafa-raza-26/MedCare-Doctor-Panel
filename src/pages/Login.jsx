import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { EMAIL_RE } from '../lib/clinic'
import AuthShell from '../components/AuthShell'
import { Field, PasswordInput } from '../components/FormBits'

export default function Login() {
  const { user, loading, signIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to={redirectTo} replace />

  async function submit(e) {
    e.preventDefault()
    const next = {}
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) return toast.error(error.message)
    toast.success('Welcome back! Login successful.')
    navigate(redirectTo, { replace: true })
  }

  return (
    <AuthShell
      title="Welcome back, Doctor"
      text="Sign in to manage your appointments, patients and schedule."
      icon="bi-heart-pulse-fill"
    >
      <h2 className="ap-auth-title">Sign in</h2>
      <p className="ap-muted mb-4">Use your admin portal account.</p>
      <form onSubmit={submit} noValidate>
        <Field label="Email address" id="email" type="email" placeholder="admin@example.com" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password}
          autoComplete="current-password" />
        <div className="text-end mb-3">
          <Link to="/forgot-password" className="small fw-semibold">Forgot password?</Link>
        </div>
        <button type="submit" className="btn btn-ap btn-ap-primary w-100" disabled={busy}>
          {busy && <span className="spinner-border spinner-border-sm me-2" />}
          Login
        </button>
      </form>
      <p className="text-center ap-muted mt-4 mb-0">
        Don&apos;t have an account? <Link to="/signup">Create one</Link>
      </p>
    </AuthShell>
  )
}
