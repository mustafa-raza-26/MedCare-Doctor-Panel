import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useClinic } from '../context/ClinicContext'
import { belongsTo, initials, normName, withDr } from '../lib/clinic'
import { EmptyState, PageTitle } from '../components/PageBits'
import Spinner from '../components/Spinner'

export default function Doctors() {
  const { profile } = useAuth()
  const { doctors, appointments, loading, reload } = useClinic()
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return doctors
      .filter((d) => !term || `${d.name} ${d.specialty}`.toLowerCase().includes(term))
      .map((d) => ({ ...d, visits: appointments.filter((a) => belongsTo(a, d.name)).length }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [doctors, appointments, q])

  return (
    <>
      <PageTitle title="Doctors" subtitle="Everyone registered in the admin portal.">
        <button type="button" className="btn btn-ap btn-ap-outline btn-sm" onClick={reload} disabled={loading}>
          <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'ap-spin' : ''}`} /> Refresh
        </button>
      </PageTitle>

      <div className="ap-toolbar mb-4">
        <div className="ap-search ap-search-inline">
          <i className="bi bi-search" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or specialty…" aria-label="Search doctors" />
        </div>
      </div>

      {loading && !doctors.length ? (
        <Spinner />
      ) : list.length === 0 ? (
        <div className="ap-card"><EmptyState icon="bi-person-x" title="No doctors found" /></div>
      ) : (
        <div className="row g-4">
          {list.map((d) => {
            const you = normName(d.name) === normName(profile?.name)
            return (
              <div className="col-md-6 col-xl-4" key={d.email || d.name}>
                <article className="ap-card ap-doctor h-100">
                  <div className="d-flex align-items-center gap-3">
                    <span className="ap-avatar ap-avatar-lg">{initials(d.name)}</span>
                    <div className="min-w-0">
                      <h5 className="mb-0 text-truncate">{withDr(d.name)} {you && <span className="ap-you">You</span>}</h5>
                      <span className="ap-spec">{d.specialty || 'General'}</span>
                    </div>
                  </div>
                  <ul className="ap-contact">
                    {d.email && <li><i className="bi bi-envelope" /> <a href={`mailto:${d.email}`}>{d.email}</a></li>}
                    {d.number && <li><i className="bi bi-telephone" /> <a href={`tel:${d.number}`}>{d.number}</a></li>}
                  </ul>
                  <div className="ap-doctor-foot">
                    <strong>{d.visits}</strong> appointment{d.visits === 1 ? '' : 's'}
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
