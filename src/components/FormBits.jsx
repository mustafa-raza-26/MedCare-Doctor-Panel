import { useState } from 'react'

export function Field({ label, id, error, hint, className = '', children, ...input }) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label ap-label">
          {label}
        </label>
      )}
      {children || <input id={id} className={`form-control ap-input ${error ? 'is-invalid' : ''}`} {...input} />}
      {error ? <div className="invalid-feedback d-block">{error}</div> : hint ? <div className="form-text">{hint}</div> : null}
    </div>
  )
}

export function PasswordInput({ label = 'Password', id = 'password', error, value, onChange, autoComplete, placeholder, className = '' }) {
  const [show, setShow] = useState(false)
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={id} className="form-label ap-label">
        {label}
      </label>
      <div className="ap-pass">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`form-control ap-input ${error ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder || label}
        />
        <button type="button" className="ap-pass-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
          <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`} />
        </button>
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  )
}

export function strength(pw) {
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export function StrengthBar({ password }) {
  if (!password) return null
  const score = strength(password)
  return (
    <div className="ap-strength" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={n <= score ? `on s${score}` : ''} />
      ))}
    </div>
  )
}

/** Bootstrap modal driven by React state (no bootstrap JS needed). */
export function Modal({ show, title, onClose, children, footer, size = '' }) {
  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" onClick={onClose}>
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size}`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content ap-modal">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer border-0 pt-0">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  )
}
