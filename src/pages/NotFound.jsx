import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="ap-notfound">
      <div className="ap-404">404</div>
      <h1>Page not found</h1>
      <p className="ap-muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn-ap btn-ap-primary">Back to dashboard</Link>
    </div>
  )
}
