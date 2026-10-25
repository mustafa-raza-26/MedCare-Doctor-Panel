import { useClinic } from '../context/ClinicContext'
import { useAuth } from '../context/AuthContext'

export function PageTitle({ title, subtitle, children }) {
  return (
    <div className="ap-page-title">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="ap-page-actions">{children}</div>}
    </div>
  )
}

/** "My patients" / "Whole clinic" switch, shared by the data pages. */
export function ScopeSwitch() {
  const { scope, setScope } = useClinic()
  const { profile } = useAuth()
  return (
    <div className="ap-seg" role="group" aria-label="Data scope" title={`"My patients" = appointments booked with ${profile?.name || 'you'}`}>
      <button type="button" className={scope === 'mine' ? 'active' : ''} onClick={() => setScope('mine')}>
        My patients
      </button>
      <button type="button" className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>
        Whole clinic
      </button>
    </div>
  )
}

export function StatusBadge({ status }) {
  const label = { today: 'Today', upcoming: 'Upcoming', completed: 'Completed' }[status] || status
  return <span className={`ap-badge ap-badge-${status}`}>{label}</span>
}

export function EmptyState({ icon = 'bi-inbox', title, text }) {
  return (
    <div className="ap-empty">
      <i className={`bi ${icon}`} />
      <h5>{title}</h5>
      {text && <p className="ap-muted mb-0">{text}</p>}
    </div>
  )
}
