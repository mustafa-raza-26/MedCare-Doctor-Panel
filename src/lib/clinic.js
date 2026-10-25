/* Helpers that turn raw `patientData` rows into things the admin screens show. */

export function parseDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export const timeOf = (a) => parseDate(a.date_time)?.getTime() ?? 0

export function formatDate(value, opts) {
  const d = parseDate(value)
  if (!d) return value || '—'
  return d.toLocaleDateString(undefined, opts || { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(value) {
  const d = parseDate(value)
  if (!d) return '—'
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function initials(name = '') {
  const parts = name.replace(/^dr\.?\s+/i, '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/** "Dr. Ali  (Cardiology)" -> "ali" */
export function normName(s = '') {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/^\s*dr\.?\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export const withDr = (name = '') => (/^\s*dr\.?\s/i.test(name) ? name.trim() : `Dr. ${name.trim()}`)

export function belongsTo(appt, doctorName) {
  const mine = normName(doctorName)
  if (!mine) return false
  const theirs = normName(appt.doctor_Name || '')
  if (!theirs) return false
  return theirs === mine || theirs.includes(mine) || mine.includes(theirs)
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** 'today' | 'upcoming' | 'completed' */
export function statusOf(appt, now = new Date()) {
  const d = parseDate(appt.date_time)
  if (!d) return 'completed'
  if (d.getTime() >= now.getTime()) return isSameDay(d, now) ? 'today' : 'upcoming'
  return 'completed'
}

export const STATUS_LABEL = { today: 'Today', upcoming: 'Upcoming', completed: 'Completed' }

export function computeStats(list, now = new Date()) {
  const people = new Set()
  let today = 0
  let upcoming = 0
  let completed = 0
  for (const a of list) {
    people.add((a.email || a.contact_No || `id-${a.id}`).toString().toLowerCase())
    const s = statusOf(a, now)
    const d = parseDate(a.date_time)
    if (d && isSameDay(d, now)) today++
    if (s === 'completed') completed++
    else upcoming++
  }
  return { patients: people.size, total: list.length, today, upcoming, completed }
}

/** Counts per day for the last `days` days (oldest first). */
export function lastDays(list, days = 7, now = new Date()) {
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    out.push({
      key: d.toDateString(),
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      date: d,
      count: 0,
      isToday: i === 0,
    })
  }
  for (const a of list) {
    const d = parseDate(a.date_time)
    if (!d) continue
    const slot = out.find((o) => isSameDay(o.date, d))
    if (slot) slot.count++
  }
  return out
}

function csvCell(v) {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function downloadCSV(filename, rows, columns) {
  const head = columns.map((c) => csvCell(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => csvCell(c.value(r))).join(',')).join('\n')
  const blob = new Blob([`${head}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_RE = /^[+\d][\d\s-]{6,}$/
