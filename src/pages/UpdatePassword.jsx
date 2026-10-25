import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthShell from '../components/AuthShell'
import Spinner from '../components/Spinner'
import { PasswordInput, StrengthBar } from '../components/FormBits'

/**
 * Landing page of the password-reset email link. Supabase turns the link into a temporary session
 * automatically; we only update the Auth password. (The original also wrote the plain-text
 * password into a table; that is intentionally gone.)
 */
export default function UpdatePassword() {
  const { user, loading, updatePassword } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  if (loading) return <Spinner full />

  async function submit(e) {
    e.preventDefault()
    const next = {}
    if (pw.length < 6) next.pw = 'Use at least 6 characters.'
    if (confirm !== pw) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    const { error } = await updatePassword(pw)
    setBusy(false)
    if (error) return toast.error(error.message)
    toast.success('Password updated successfully.')
    navigate('/', { replace: true })
  }

  return (
    <AuthShell
      title="Update password"
      text="Create a new secure password for your MedCare admin account."
      icon="bi-shield-lock-fill"
    >
      {!user ? (
        <div className="text-center">
          <div className="ap-auth-icon ap-auth-icon-warn mx-auto"><i className="bi bi-link-45deg" /></div>
          <h2 className="ap-auth-title">Link expired</h2>
          <p className="ap-muted">This reset link is invalid or has expired. Request a new one to continue.</p>
          <Link to="/forgot-password" className="btn btn-ap btn-ap-primary w-100">Request a new link</Link>
        </div>
      ) : (
        <>
          <h2 className="ap-auth-title">Create new password</h2>
          <p className="ap-muted mb-4">Enter and confirm your new password.</p>
          <form onSubmit={submit} noValidate>
            <PasswordInput id="pw" label="New password" value={pw} onChange={(e) => setPw(e.target.value)}
              error={errors.pw} autoComplete="new-password" />
            <StrengthBar password={pw} />
            <PasswordInput id="confirm" label="Confirm password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} autoComplete="new-password" />
            <button type="submit" className="btn btn-ap btn-ap-primary w-100 mt-2" disabled={busy}>
              {busy && <span className="spinner-border spinner-border-sm me-2" />}
              Update password
            </button>
          </form>
        </>
      )}
    </AuthShell>
  )
}
