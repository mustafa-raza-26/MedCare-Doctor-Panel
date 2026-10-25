import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useClinic } from '../context/ClinicContext'
import { useToast } from '../context/ToastContext'
import { PHONE_RE, formatDate, initials, withDr } from '../lib/clinic'
import { Field, PasswordInput, StrengthBar } from '../components/FormBits'
import { PageTitle } from '../components/PageBits'

export default function Profile() {
  const { profile, updateProfile, updatePassword, signOut } = useAuth()
  const { appointments, stats } = useClinic()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: profile?.name || '', specialty: profile?.specialty || '', number: profile?.number || '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [pw, setPw] = useState({ next: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwBusy, setPwBusy] = useState(false)

  const dirty =
    form.name.trim() !== (profile?.name || '') ||
    form.specialty.trim() !== (profile?.specialty || '') ||
    form.number.trim() !== (profile?.number || '')

  async function saveProfile(e) {
    e.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (form.specialty.trim().length < 2) next.specialty = 'Enter your specialty.'
    if (form.number && !PHONE_RE.test(form.number.trim())) next.number = 'Enter a valid phone number.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    const { error } = await updateProfile({ name: form.name.trim(), specialty: form.specialty.trim(), number: form.number.trim() })
    setSaving(false)
    if (error) toast.error(error.message)
    else toast.success('Profile updated.')
  }

  async function savePassword(e) {
    e.preventDefault()
    const next = {}
    if (pw.next.length < 6) next.next = 'Use at least 6 characters.'
    if (pw.confirm !== pw.next) next.confirm = 'Passwords do not match.'
    setPwErrors(next)
    if (Object.keys(next).length) return
    setPwBusy(true)
    const { error } = await updatePassword(pw.next)
    setPwBusy(false)
    if (error) return toast.error(error.message)
    setPw({ next: '', confirm: '' })
    toast.success('Password changed.')
  }

  async function logout() {
    const { error } = await signOut()
    if (error) return toast.error(error.message)
    toast.success('You have been logged out.')
    navigate('/login')
  }

  return (
    <>
      <PageTitle title="My Profile" subtitle="Manage your personal details and account security." />
      <div className="row g-4">
        <aside className="col-xl-4">
          <div className="ap-card p-4 text-center">
            <span className="ap-avatar ap-avatar-xl mx-auto">{initials(profile?.name)}</span>
            <h4 className="mt-3 mb-1">{withDr(profile?.name || '')}</h4>
            <span className="ap-spec">{profile?.specialty || 'Administrator'}</span>
            <p className="ap-muted mt-2 mb-0">{profile?.email}</p>

            <div className="ap-stats-mini">
              <div><strong>{appointments.length}</strong><span>Clinic bookings</span></div>
              <div><strong>{stats.total}</strong><span>My patients’ visits</span></div>
            </div>

            <dl className="ap-dl text-start mt-3 mb-0">
              {profile?.createdAt && <div><dt>Member since</dt><dd>{formatDate(profile.createdAt)}</dd></div>}
              {profile?.lastSignIn && <div><dt>Last sign-in</dt><dd>{formatDate(profile.lastSignIn)}</dd></div>}
            </dl>

            <button type="button" className="btn btn-ap btn-ap-danger-outline w-100 mt-4" onClick={logout}>
              <i className="bi bi-box-arrow-right me-2" /> Logout
            </button>
          </div>
        </aside>

        <div className="col-xl-8">
          <form className="ap-card p-4 p-md-5 mb-4" onSubmit={saveProfile} noValidate>
            <h5 className="ap-card-title">Personal information</h5>
            <div className="row">
              <Field className="col-md-6" label="Full name" id="pname" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
              <Field className="col-md-6" label="Specialty" id="pspec" value={form.specialty}
                onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} error={errors.specialty} />
              <Field className="col-md-6" label="Phone number" id="pnum" type="tel" value={form.number}
                onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} error={errors.number} />
              <Field className="col-md-6" label="Email address" id="pmail" value={profile?.email || ''} readOnly disabled
                hint="Your email is your login and can't be changed here." />
            </div>
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-ap btn-ap-primary px-4" disabled={!dirty || saving}>
                {saving && <span className="spinner-border spinner-border-sm me-2" />}
                Save changes
              </button>
            </div>
          </form>

          <form className="ap-card p-4 p-md-5" onSubmit={savePassword} noValidate>
            <h5 className="ap-card-title">Change password</h5>
            <div className="row">
              <PasswordInput className="col-md-6" id="newpw" label="New password" value={pw.next} autoComplete="new-password"
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} error={pwErrors.next} />
              <PasswordInput className="col-md-6" id="confpw" label="Confirm password" value={pw.confirm} autoComplete="new-password"
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} error={pwErrors.confirm} />
            </div>
            <StrengthBar password={pw.next} />
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-ap btn-ap-outline px-4" disabled={pwBusy || !pw.next}>
                {pwBusy && <span className="spinner-border spinner-border-sm me-2" />}
                Update password
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}