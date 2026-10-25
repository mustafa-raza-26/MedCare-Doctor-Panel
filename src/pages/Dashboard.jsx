import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useClinic } from '../context/ClinicContext'
import { formatDate, formatTime, initials, lastDays, statusOf, timeOf, withDr } from '../lib/clinic'
import { BarChart, Donut } from '../components/Charts'
import { EmptyState, PageTitle, ScopeSwitch, StatusBadge } from '../components/PageBits'
import Spinner from '../components/Spinner'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function StatCard({ label, value, icon, tone, note }) {
  return (
    <div className="ap-card ap-stat">
      <div className="d-flex justify-content-between align-items-start">
        <span className="ap-stat-label">{label}</span>
        <span className={`ap-stat-icon tone-${tone}`}><i className={`bi ${icon}`} /></span>
      </div>
      <div className="ap-stat-value">{value}</div>
      <div className="ap-stat-note">{note}</div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { scoped, stats, doctors, loading, reload, scope } = useClinic()

  const week = useMemo(() => lastDays(scoped, 7), [scoped])
  const weekTotal = week.reduce((s, d) => s + d.count, 0)

  const recent = useMemo(() => {
    const upcoming = scoped.filter((a) => statusOf(a) !== 'completed').sort((a, b) => timeOf(a) - timeOf(b))
    const past = scoped.filter((a) => statusOf(a) === 'completed')
    return [...upcoming, ...past].slice(0, 7)
  }, [scoped])

  const todayList = useMemo(
    () => scoped.filter((a) => statusOf(a) === 'today').sort((a, b) => timeOf(a) - timeOf(b)),
    [scoped],
  )

  const who = scope === 'mine' ? 'your' : 'the clinic’s'

  return (
    <>
      <PageTitle
        title={`${greeting()}, ${withDr(profile?.name?.split(' ')[0] || '')}`}
        subtitle={`Here's what's happening with ${who} patients today.`}
      >
        <ScopeSwitch />
        <button type="button" className="btn btn-ap btn-ap-outline btn-sm" onClick={reload} disabled={loading}>
          <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'ap-spin' : ''}`} /> Refresh
        </button>
      </PageTitle>

      {loading && scoped.length === 0 ? (
        <Spinner />
      ) : (
        <>
          <div className="row g-4">
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Total patients" value={stats.patients} icon="bi-people" tone="blue"
                note={`${stats.total} appointment${stats.total === 1 ? '' : 's'} on record`} />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Appointments today" value={stats.today} icon="bi-calendar2-check" tone="green"
                note={stats.today ? 'See today’s schedule below' : 'A clear day'} />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Upcoming" value={stats.upcoming} icon="bi-hourglass-split" tone="orange"
                note="Scheduled from now on" />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard label="Active doctors" value={doctors.length} icon="bi-heart-pulse" tone="purple"
                note="Registered in the portal" />
            </div>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-xl-8">
              <div className="ap-card h-100">
                <div className="ap-card-head">
                  <div>
                    <h5>Appointments · last 7 days</h5>
                    <small className="ap-muted">{weekTotal} total this week</small>
                  </div>
                </div>
                <BarChart data={week} />
              </div>
            </div>
            <div className="col-xl-4">
              <div className="ap-card h-100">
                <div className="ap-card-head"><h5>Status overview</h5></div>
                <Donut
                  centerLabel="appointments"
                  segments={[
                    { label: 'Upcoming', value: stats.upcoming, color: '#2f6fd0' },
                    { label: 'Completed', value: stats.completed, color: '#20b2a0' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-xl-8">
              <div className="ap-card h-100">
                <div className="ap-card-head">
                  <h5>Upcoming &amp; recent appointments</h5>
                  <Link to="/appointments" className="ap-more">View all <i className="bi bi-arrow-right" /></Link>
                </div>
                {recent.length === 0 ? (
                  <EmptyState icon="bi-calendar2-x" title="No appointments yet"
                    text={scope === 'mine' ? 'Appointments booked with you will appear here. Try “Whole clinic”.' : 'New bookings will appear here.'} />
                ) : (
                  <div className="table-responsive">
                    <table className="table ap-table align-middle mb-0">
                      <thead>
                        <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {recent.map((a) => (
                          <tr key={a.id}>
                            <td>
                              <div className="ap-person">
                                <span className="ap-avatar ap-avatar-sm">{initials(a.patient_Name)}</span>
                                <strong>{a.patient_Name}</strong>
                              </div>
                            </td>
                            <td>{a.doctor_Name}</td>
                            <td>{formatDate(a.date_time)}</td>
                            <td>{formatTime(a.date_time)}</td>
                            <td><StatusBadge status={statusOf(a)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="col-xl-4">
              <div className="ap-card h-100">
                <div className="ap-card-head"><h5>Today&apos;s schedule</h5></div>
                {todayList.length === 0 ? (
                  <EmptyState icon="bi-cup-hot" title="Nothing scheduled" text="No appointments left for today." />
                ) : (
                  <ul className="ap-timeline">
                    {todayList.map((a) => (
                      <li key={a.id}>
                        <time>{formatTime(a.date_time)}</time>
                        <div>
                          <strong>{a.patient_Name}</strong>
                          <small>{a.reason}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
