import { useMemo, useState } from 'react'
import { useClinic } from '../context/ClinicContext'
import { formatDate, formatTime, initials, parseDate, statusOf, timeOf } from '../lib/clinic'
import { EmptyState, PageTitle, ScopeSwitch, StatusBadge } from '../components/PageBits'
import Spinner from '../components/Spinner'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
]

export default function Appointments() {
  const { scoped, loading, reload } = useClinic()
  const [filter, setFilter] = useState('upcoming')
  const [q, setQ] = useState('')

  const counts = useMemo(() => {
    const c = { all: scoped.length, today: 0, upcoming: 0, completed: 0 }
    scoped.forEach((a) => {
      const s = statusOf(a)
      if (s === 'today') c.today++
      if (s === 'upcoming') c.upcoming++
      if (s === 'completed') c.completed++
    })
    // "Upcoming" tab = everything from now on, today's remaining visits included.
    c.upcoming += c.today
    return c
  }, [scoped])

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = scoped.filter((a) => {
      const s = statusOf(a)
      if (filter === 'today' && s !== 'today') return false
      if (filter === 'upcoming' && s === 'completed') return false
      if (filter === 'completed' && s !== 'completed') return false
      if (!term) return true
      return [a.patient_Name, a.doctor_Name, a.reason, a.contact_No].join(' ').toLowerCase().includes(term)
    })
    // upcoming/today: soonest first; completed/all: newest first
    list.sort((x, y) => (filter === 'upcoming' || filter === 'today' ? timeOf(x) - timeOf(y) : timeOf(y) - timeOf(x)))
    const map = new Map()
    list.forEach((a) => {
      const d = parseDate(a.date_time)
      const key = d ? d.toDateString() : 'unknown'
      if (!map.has(key)) map.set(key, { key, date: d, items: [] })
      map.get(key).items.push(a)
    })
    return [...map.values()]
  }, [scoped, filter, q])

  return (
    <>
      <PageTitle title="Appointments" subtitle="Your schedule, grouped by day.">
        <ScopeSwitch />
        <button type="button" className="btn btn-ap btn-ap-outline btn-sm" onClick={reload} disabled={loading}>
          <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'ap-spin' : ''}`} /> Refresh
        </button>
      </PageTitle>

      <div className="ap-toolbar mb-4">
        <div className="ap-seg" role="tablist">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" role="tab" aria-selected={filter === f.id}
              className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)}>
              {f.label} <span>{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <div className="ap-search ap-search-inline">
          <i className="bi bi-search" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, doctor or reason…" aria-label="Search appointments" />
        </div>
      </div>

      {loading && !scoped.length ? (
        <Spinner />
      ) : groups.length === 0 ? (
        <div className="ap-card"><EmptyState icon="bi-calendar2-x" title="No appointments here" text="Try another filter or switch to “Whole clinic”." /></div>
      ) : (
        groups.map((g) => (
          <section key={g.key} className="mb-4">
            <h6 className="ap-day">
              {g.date ? formatDate(g.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'No date'}
              <span>{g.items.length}</span>
            </h6>
            <div className="ap-card p-0 overflow-hidden">
              {g.items.map((a) => (
                <article key={a.id} className="ap-appt-row">
                  <time>{formatTime(a.date_time)}</time>
                  <div className="ap-person flex-grow-1">
                    <span className="ap-avatar ap-avatar-sm">{initials(a.patient_Name)}</span>
                    <span>
                      <strong>{a.patient_Name}</strong>
                      <small>{a.reason}</small>
                    </span>
                  </div>
                  <span className="ap-appt-doc d-none d-md-block"><i className="bi bi-heart-pulse me-1" />{a.doctor_Name}</span>
                  <StatusBadge status={statusOf(a)} />
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}
