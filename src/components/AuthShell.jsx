import logo from '../assets/logo.png'
import ConfigBanner from './ConfigBanner'

/** Split-screen layout shared by login / signup / forgot / update-password. */
export default function AuthShell({ title, text, icon = 'bi-shield-lock-fill', children, wide = false }) {
  return (
    <div className="ap-auth">
      <ConfigBanner />
      <div className="ap-auth-grid">
        <aside className="ap-auth-side">
          <div className="ap-auth-side-inner">
            <div className="ap-auth-brand">
              <img src={logo} alt="" width="46" height="46" />
              <span>
                Med<b>Care</b> <small>Admin Portal</small>
              </span>
            </div>
            <div className="ap-auth-icon">
              <i className={`bi ${icon}`} />
            </div>
            <h1>{title}</h1>
            <p>{text}</p>
            <ul className="ap-auth-points">
              <li><i className="bi bi-check2-circle" /> Live patient and appointment data</li>
              <li><i className="bi bi-check2-circle" /> Your schedule at a glance</li>
              <li><i className="bi bi-check2-circle" /> Secure, role-checked access</li>
            </ul>
          </div>
        </aside>
        <main className="ap-auth-main">
          <div className={`ap-auth-card ${wide ? 'ap-auth-card-wide' : ''}`}>{children}</div>
        </main>
      </div>
    </div>
  )
}
