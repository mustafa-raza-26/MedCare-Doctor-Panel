import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useClinic } from '../context/ClinicContext'
import { downloadCSV, formatDate, formatTime, initials, statusOf } from '../lib/clinic'
import { EmptyState, PageTitle, ScopeSwitch, StatusBadge } from '../components/PageBits'
import { Modal } from '../components/FormBits'
import Spinner from '../components/Spinner'

const PAGE = 10

export default function Patients() {
  const { scoped, loading, reload } = useClinic()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [gender, setGender] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    return scoped.filter((a) => {
      if (gender !== 'all' && (a.gender || '').toLowerCase() !== gender) return false
      if (!term) return true
      const hay = [`pt${a.id}`, a.id, a.patient_Name, a.email, a.contact_No, a.reason, a.doctor_Name]
        .filter((x) => x !== undefined && x !== null)
        .join(' ')
        .toLowerCase()
      return hay.includes(term)
    })
  }, [scoped, q, gender])

  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const current = Math.min(page, pages)
  const visible = rows.slice((current - 1) * PAGE, current * PAGE)

  function onSearch(v) {
    setQ(v)
    setPage(1)
    setParams(v ? { q: v } : {}, { replace: true })
  }

  function exportCsv() {
    downloadCSV('patients.csv', rows, [
      { label: 'ID', value: (a) => `PT${a.id}` },
      { label: 'Patient', value: (a) => a.patient_Name },
      { label: 'Email', value: (a) => a.email },
      { label: 'Age', value: (a) => a.age },
      { label: 'Gender', value: (a) => a.gender },
      { label: 'Contact', value: (a) => a.contact_No },
      { label: 'Reason', value: (a) => a.reason },
      { label: 'Doctor', value: (a) => a.doctor_Name },
      { label: 'Appointment', value: (a) => a.date_time },
      { label: 'Status', value: (a) => statusOf(a) },
    ])
  }

  return (
    <>
      <PageTitle title="Patients" subtitle="Everyone who has booked a visit, searchable and exportable.">
        <ScopeSwitch />
        <button type="button" className="btn btn-ap btn-ap-outline btn-sm" onClick={exportCsv} disabled={!rows.length}>
          <i className="bi bi-download me-1" /> Export CSV
        </button>
      </PageTitle>

      <div className="ap-card">
        <div className="ap-toolbar">
          <div className="ap-search ap-search-inline">
            <i className="bi bi-search" />
            <input type="search" value={q} onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by name, ID, phone, email or reason…" aria-label="Search patients" />
          </div>
          <select className="form-select ap-input ap-select-sm" value={gender}
            onChange={(e) => { setGender(e.target.value); setPage(1) }} aria-label="Filter by gender">
            <option value="all">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <button type="button" className="ap-icon-btn" onClick={reload} aria-label="Refresh" title="Refresh">
            <i className={`bi bi-arrow-clockwise ${loading ? 'ap-spin' : ''}`} />
          </button>
        </div>

        {loading && !scoped.length ? (
          <Spinner />
        ) : visible.length === 0 ? (
          <EmptyState icon="bi-person-x" title="No patients found"
            text={q ? 'Try a different search term.' : 'Patients appear here after they book an appointment.'} />
        ) : (
          <div className="table-responsive">
            <table className="table ap-table align-middle mb-0">
              <thead>
                <tr><th>ID</th><th>Patient</th><th>Age</th><th>Gender</th><th>Contact</th><th>Reason</th><th>Visit</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.id}>
                    <td className="text-nowrap"><code className="ap-code">PT{a.id}</code></td>
                    <td>
                      <div className="ap-person">
                        <span className="ap-avatar ap-avatar-sm">{initials(a.patient_Name)}</span>
                        <span><strong>{a.patient_Name}</strong><small>{a.email}</small></span>
                      </div>
                    </td>
                    <td>{a.age}</td>
                    <td>{a.gender}</td>
                    <td className="text-nowrap">{a.contact_No}</td>
                    <td className="ap-clip">{a.reason}</td>
                    <td className="text-nowrap">{formatDate(a.date_time)}</td>
                    <td><StatusBadge status={statusOf(a)} /></td>
                    <td className="text-end">
                      <button type="button" className="btn btn-ap btn-ap-outline btn-xs" onClick={() => setSelected(a)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > PAGE && (
          <div className="ap-pager">
            <small className="ap-muted">
              Showing {(current - 1) * PAGE + 1}–{Math.min(current * PAGE, rows.length)} of {rows.length}
            </small>
            <div className="btn-group">
              <button type="button" className="btn btn-ap btn-ap-outline btn-xs" disabled={current === 1} onClick={() => setPage(current - 1)}>
                <i className="bi bi-chevron-left" />
              </button>
              <span className="ap-pager-num">{current} / {pages}</span>
              <button type="button" className="btn btn-ap btn-ap-outline btn-xs" disabled={current === pages} onClick={() => setPage(current + 1)}>
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal show={Boolean(selected)} title="Patient details" onClose={() => setSelected(null)}
        footer={<button type="button" className="btn btn-ap btn-ap-outline" onClick={() => setSelected(null)}>Close</button>}>
        {selected && (
          <>
            <div className="ap-person ap-person-lg mb-3">
              <span className="ap-avatar">{initials(selected.patient_Name)}</span>
              <span><strong>{selected.patient_Name}</strong><small>PT{selected.id}</small></span>
              <span className="ms-auto"><StatusBadge status={statusOf(selected)} /></span>
            </div>
            <dl className="ap-dl">
              <div><dt>Email</dt><dd>{selected.email || '—'}</dd></div>
              <div><dt>Contact</dt><dd>{selected.contact_No || '—'}</dd></div>
              <div><dt>Age</dt><dd>{selected.age ?? '—'}</dd></div>
              <div><dt>Gender</dt><dd>{selected.gender || '—'}</dd></div>
              <div><dt>Doctor</dt><dd>{selected.doctor_Name || '—'}</dd></div>
              <div><dt>Appointment</dt><dd>{formatDate(selected.date_time)} · {formatTime(selected.date_time)}</dd></div>
              <div><dt>Reason</dt><dd>{selected.reason || '—'}</dd></div>
            </dl>
          </>
        )}
      </Modal>
    </>
  )
}
