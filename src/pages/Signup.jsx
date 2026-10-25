import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { EMAIL_RE, PHONE_RE } from '../lib/clinic'
import AuthShell from '../components/AuthShell'
import { Field, PasswordInput, StrengthBar } from '../components/FormBits'

export default function Signup() {
  const { user, loading, signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [f, setF] = useState({ name: '', specialty: '', email: '', number: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const next = {}
    if (f.name.trim().length < 2) next.name = 'Enter your full name.'
    if (f.specialty.trim().length < 2) next.specialty = 'Enter your specialty.'
    if (!EMAIL_RE.test(f.email.trim())) next.email = 'Enter a valid email address.'
    if (!PHONE_RE.test(f.number.trim())) next.number = 'Enter a valid phone number.'
    if (f.password.length < 6) next.password = 'Use at least 6 characters.'
    if (f.confirm !== f.password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    const { error, hasSession } = await signUp({
      name: f.name.trim(),
      specialty: f.specialty.trim(),
      email: f.email.trim(),
      number: f.number.trim(),
      password: f.password,
    })
    setBusy(false)
    if (error) return toast.error(`Signup error: ${error.message}`)
    if (hasSession) {
      toast.success('Account created successfully!')
      navigate('/', { replace: true })
    } else {
      toast.success('Account created! Check your email to confirm it, then sign in.')
      navigate('/login', { replace: true })
    }
  }

  return (
    <AuthShell
      wide
      title="Join the care team"
      text="Create your admin account and start managing appointments, doctors and patients efficiently."
      icon="bi-person-plus-fill"
    >
      <h2 className="ap-auth-title">Create account</h2>
      <p className="ap-muted mb-4">Register your admin account.</p>
      <form onSubmit={submit} noValidate>
        <div className="row">
          <Field className="col-md-6" label="Full name" id="name" placeholder="Enter full name" autoComplete="name"
            value={f.name} onChange={set('name')} error={errors.name} />
          <Field className="col-md-6" label="Specialty" id="specialty" placeholder="e.g. Chest Specialist"
            value={f.specialty} onChange={set('specialty')} error={errors.specialty} />
          <Field className="col-md-6" label="Email address" id="email" type="email" placeholder="admin@example.com"
            autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} />
          <Field className="col-md-6" label="Phone number" id="number" type="tel" placeholder="+92 300 1234567"
            autoComplete="tel" value={f.number} onChange={set('number')} error={errors.number} />
          <PasswordInput className="col-md-6" value={f.password} onChange={set('password')} error={errors.password}
            autoComplete="new-password" />
          <PasswordInput className="col-md-6" id="confirm" label="Confirm password" value={f.confirm}
            onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
        </div>
        <StrengthBar password={f.password} />
        <button type="submit" className="btn btn-ap btn-ap-primary w-100 mt-2" disabled={busy}>
          {busy && <span className="spinner-border spinner-border-sm me-2" />}
          Create account
        </button>
      </form>
      <p className="text-center ap-muted mt-4 mb-0">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthShell>
  )
}
