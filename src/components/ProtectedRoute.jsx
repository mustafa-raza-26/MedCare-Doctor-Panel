import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from './Spinner'
import AuthShell from './AuthShell'

/** Needs a signed-in user who is ALSO registered in Admin_Portal_User. */
export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading, signOut } = useAuth()
  const toast = useToast()
  const location = useLocation()

  if (loading) return <Spinner full />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (!isAdmin) {
    return (
      <AuthShell
        title="Access restricted"
        text="This portal is for registered doctors and administrators only."
        icon="bi-shield-exclamation"
      >
        <div className="text-center">
          <div className="ap-auth-icon ap-auth-icon-warn mx-auto"><i className="bi bi-person-lock" /></div>
          <h2 className="ap-auth-title">Not an admin account</h2>
          <p className="ap-muted">
            <strong>{user.email}</strong> is signed in, but it isn&apos;t registered in the admin portal. Create an admin
            account, or sign in with a different one.
          </p>
          <button
            type="button"
            className="btn btn-ap btn-ap-primary w-100"
            onClick={async () => {
              const { error } = await signOut()
              if (error) toast.error(error.message)
            }}
          >
            Sign out
          </button>
        </div>
      </AuthShell>
    )
  }
  return children
}
