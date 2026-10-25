import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { ClinicProvider, useClinic } from '../context/ClinicContext'
import { useToast } from '../context/ToastContext'
import { formatTime, initials, statusOf, timeOf, withDr } from '../lib/clinic'
import ConfigBanner from './ConfigBanner'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'bi-grid-1x2', end: true },
  { to: '/patients', label: 'Patients', icon: 'bi-people' },
  { to: '/appointments', label: 'Appointments', icon: 'bi-calendar2-check' },
  { to: '/doctors', label: 'Doctors', icon: 'bi-heart-pulse' },
  { to: '/profile', label: 'My Profile', icon: 'bi-person-circle' },
]

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [ref, onClose])
}

function Topbar({ onMenu }) {
  const { profile, signOut } = useAuth()
  const { scoped } = useClinic()
  const toast = useToast()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [bell, setBell] = useState(false)
  const [menu, setMenu] = useState(false)
  const bellRef = useRef(null)
  const menuRef = useRef(null)
  useOutsideClose(bellRef, () => setBell(false))
  useOutsideClose(menuRef, () => setMenu(false))

  const todayList = scoped
    .filter((a) => statusOf(a) === 'today')
    .sort((a, b) => timeOf(a) - timeOf(b))

  function search(e) {
    e.preventDefault()
    navigate(`/patients${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
  }

  async function logout() {
    const { error } = await signOut()
    if (error) return toast.error(error.message)
    toast.success('You have been logged out.')
    navigate('/login')
  }

  return (
    <header className="ap-topbar">
      <button type="button" className="ap-icon-btn d-lg-none" onClick={onMenu} aria-label="Open menu">
        <i className="bi bi-list" />
      </button>

      <form className="ap-search" onSubmit={search} role="search">
        <i className="bi bi-search" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients by name, ID, phone or reason…" aria-label="Search patients" />
      </form>

      <div className="ap-topbar-right">
        <div className="position-relative" ref={bellRef}>
          <button type="button" className="ap-icon-btn" onClick={() => { setBell((b) => !b); setMenu(false) }} aria-label="Today's appointments">
            <i className="bi bi-bell" />
            {todayList.length > 0 && <span className="ap-dot">{todayList.length}</span>}
          </button>
          {bell && (
            <div className="ap-pop ap-pop-wide">
              <div className="ap-pop-head">Today&apos;s appointments</div>
              {todayList.length === 0 ? (
                <p className="ap-muted px-3 pb-3 mb-0">Nothing left on the schedule today.</p>
              ) : (
                todayList.slice(0, 6).map((a) => (
                  <Link key={a.id} to="/appointments" className="ap-pop-item" onClick={() => setBell(false)}>
                    <span className="ap-avatar ap-avatar-sm">{initials(a.patient_Name)}</span>
                    <span className="flex-grow-1">
                      <strong>{a.patient_Name}</strong>
                      <small>{a.doctor_Name}</small>
                    </span>
                    <time>{formatTime(a.date_time)}</time>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <div className="position-relative" ref={menuRef}>
          <button type="button" className="ap-user" onClick={() => { setMenu((m) => !m); setBell(false) }} aria-expanded={menu}>
            <span className="ap-avatar">{initials(profile?.name)}</span>
            <span className="ap-user-text d-none d-md-flex">
              <strong>{withDr(profile?.name || '')}</strong>
              <small>{profile?.specialty || 'Administrator'}</small>
            </span>
            <i className="bi bi-chevron-down small d-none d-md-inline" />
          </button>
          {menu && (
            <div className="ap-pop">
              <div className="ap-pop-head">
                <strong className="d-block">{profile?.name}</strong>
                <small className="ap-muted">{profile?.email}</small>
              </div>
              <Link to="/profile" className="ap-pop-link" onClick={() => setMenu(false)}>
                <i className="bi bi-person-circle" /> My profile
              </Link>
              <button type="button" className="ap-pop-link text-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function Shell() {
  const { profile, signOut } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  async function logout() {
    const { error } = await signOut()
    if (error) return toast.error(error.message)
    toast.success('You have been logged out.')
    navigate('/login')
  }

  return (
    <div className="ap-shell">
      {open && <div className="ap-overlay" onClick={() => setOpen(false)} />}
      <aside className={`ap-sidebar ${open ? 'is-open' : ''}`}>
        <Link to="/" className="ap-side-brand">
          <span className="ap-side-logo"><img src={logo} alt="" width="30" height="30" /></span>
          <span>
            <strong>MedCare</strong>
            <small>Admin Portal</small>
          </span>
        </Link>

        <nav className="ap-nav" aria-label="Main">
          <span className="ap-nav-label">Menu</span>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="ap-nav-link">
              <i className={`bi ${n.icon}`} /> {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="ap-side-card">
          <span className="ap-avatar">{initials(profile?.name)}</span>
          <span className="ap-side-card-text">
            <strong>{withDr(profile?.name || '')}</strong>
            <small>{profile?.specialty || 'Administrator'}</small>
          </span>
          <button type="button" className="ap-side-logout" onClick={logout} aria-label="Logout" title="Logout">
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </aside>

      <div className="ap-main">
        <ConfigBanner />
        <Topbar onMenu={() => setOpen(true)} />
        <div className="ap-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <ClinicProvider>
      <Shell />
    </ClinicProvider>
  )
}
