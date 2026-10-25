/* Dependency-free SVG charts (no Chart.js needed). */

export function BarChart({ data, height = 220 }) {
  const w = 560
  const pad = { t: 28, r: 12, b: 34, l: 30 }
  const max = Math.max(1, ...data.map((d) => d.count))
  const niceMax = max <= 4 ? 4 : Math.ceil(max / 2) * 2
  const iw = w - pad.l - pad.r
  const ih = height - pad.t - pad.b
  const bw = Math.min(46, (iw / data.length) * 0.55)
  const step = iw / data.length
  const ticks = [0, 0.5, 1].map((f) => Math.round(niceMax * f))

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="ap-chart" role="img" aria-label="Appointments over the last 7 days">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f6fd0" />
          <stop offset="100%" stopColor="#20b2a0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => {
        const y = pad.t + ih - (t / niceMax) * ih
        return (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} className="ap-chart-grid" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" className="ap-chart-axis">{t}</text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const h = (d.count / niceMax) * ih
        const x = pad.l + step * i + (step - bw) / 2
        const y = pad.t + ih - h
        return (
          <g key={d.key}>
            <rect x={x} y={d.count ? y : pad.t + ih - 3} width={bw} height={d.count ? h : 3} rx="7"
              fill={d.count ? 'url(#barGrad)' : '#dfe6f1'} opacity={d.isToday || !d.count ? 1 : 0.85} />
            {d.count > 0 && <text x={x + bw / 2} y={y - 8} textAnchor="middle" className="ap-chart-val">{d.count}</text>}
            <text x={x + bw / 2} y={height - 12} textAnchor="middle" className={`ap-chart-axis ${d.isToday ? 'is-today' : ''}`}>
              {d.isToday ? 'Today' : d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function Donut({ segments, size = 180, centerLabel }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = 64
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="ap-donut">
      <svg viewBox="0 0 180 180" width={size} height={size} role="img" aria-label="Appointment status breakdown">
        <circle cx="90" cy="90" r={r} fill="none" stroke="#e8eef7" strokeWidth="22" />
        {total > 0 &&
          segments.map((s) => {
            const len = (s.value / total) * c
            const el = (
              <circle key={s.label} cx="90" cy="90" r={r} fill="none" stroke={s.color} strokeWidth="22"
                strokeDasharray={`${Math.max(len - 2, 0)} ${c - Math.max(len - 2, 0)}`} strokeDashoffset={-offset}
                transform="rotate(-90 90 90)" />
            )
            offset += len
            return el
          })}
        <text x="90" y="88" textAnchor="middle" className="ap-donut-num">{total}</text>
        <text x="90" y="108" textAnchor="middle" className="ap-donut-cap">{centerLabel}</text>
      </svg>
      <ul className="ap-legend">
        {segments.map((s) => (
          <li key={s.label}>
            <i style={{ background: s.color }} /> {s.label}
            <strong>{s.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
