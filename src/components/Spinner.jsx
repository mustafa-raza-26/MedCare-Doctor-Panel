export default function Spinner({ full = false, label = 'Loading…' }) {
  return (
    <div className={`ap-spinner ${full ? 'ap-spinner-full' : ''}`} role="status">
      <div className="spinner-border text-primary" />
      <span>{label}</span>
    </div>
  )
}
