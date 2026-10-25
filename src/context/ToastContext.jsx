import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)
const ICONS = {
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
  warning: 'bi-exclamation-circle-fill',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const show = useCallback(
    (message, type = 'info', ms = 4200) => {
      const id = nextId.current++
      setToasts((t) => [...t.slice(-3), { id, message, type }])
      setTimeout(() => dismiss(id), ms)
    },
    [dismiss],
  )

  const api = useMemo(
    () => ({
      success: (m) => show(m, 'success'),
      error: (m) => show(m, 'danger', 6500),
      info: (m) => show(m, 'info'),
      warning: (m) => show(m, 'warning'),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="ap-toasts" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`ap-toast ap-toast-${t.type}`} role="status">
            <i className={`bi ${ICONS[t.type]}`} />
            <span className="flex-grow-1">{t.message}</span>
            <button type="button" className="btn-close btn-sm" aria-label="Close" onClick={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
