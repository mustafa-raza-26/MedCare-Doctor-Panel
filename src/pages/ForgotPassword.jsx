import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { EMAIL_RE } from '../lib/clinic'
import AuthShell from '../components/AuthShell'
import { Field } from '../components/FormBits'

export default function ForgotPassword() {
  const { sendReset } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    setError('')
    setBusy(true)
    const { error: err } = await sendReset(email.trim())
    setBusy(false)
    if (err) return toast.error(err.message)
    setSent(true)
  }

  return (
    <AuthShell
      title="Password recovery"
      text="Enter your registered email address and we'll send you a secure reset link."
      icon="bi-shield-lock-fill"
    >
      {sent ? (
        <div className="text-center">
          <div className="ap-auth-icon ap-auth-icon-ok mx-auto"><i className="bi bi-envelope-check-fill" /></div>
          <h2 className="ap-auth-title">Check your email</h2>
          <p className="ap-muted">
            We&apos;ve sent a password reset link to <strong>{email}</strong>. It can take a minute to arrive.
          </p>
          <Link to="/login" className="btn btn-ap btn-ap-primary w-100">Back to login</Link>
        </div>
      ) : (
        <>
          <h2 className="ap-auth-title">Forgot password?</h2>
          <p className="ap-muted mb-4">Enter your email to receive a reset link.</p>
          <form onSubmit={submit} noValidate>
            <Field label="Email address" id="email" type="email" placeholder="admin@example.com" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
            <button type="submit" className="btn btn-ap btn-ap-primary w-100" disabled={busy}>
              {busy && <span className="spinner-border spinner-border-sm me-2" />}
              Send reset link
            </button>
          </form>
          <p className="text-center mt-4 mb-0">
            <Link to="/login"><i className="bi bi-arrow-left me-1" /> Back to login</Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}
