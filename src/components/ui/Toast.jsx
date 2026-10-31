import { useCallback, useRef, useState } from 'react'
import { Check, ShieldAlert, X } from 'lucide-react'
import { ToastContext } from '../../lib/toast.js'

const AUTO_DISMISS_MS = 6000

const TONES = {
  success: { box: 'border-success bg-success-bg', icon: 'bg-success/15', badge: 'bg-success', Icon: Check },
  error: { box: 'border-danger bg-danger-bg', icon: 'bg-danger/15', badge: 'bg-danger', Icon: ShieldAlert },
}

function Toast({ type, title, message, onClose }) {
  const tone = TONES[type]

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-[3px] border p-2.5 shadow-md ${tone.box}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] ${tone.icon}`}>
        <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-full ${tone.badge}`}>
          <tone.Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-primary">{title}</p>
        <p className="mt-0.5 break-words text-[13px] text-body">{message}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="p-1 text-muted transition-colors hover:text-ink">
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  )
}

/** Sits above the routes, so a toast stays up when the page changes after a save. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const toast = useCallback(
    (details) => {
      const id = (nextId.current += 1)
      setToasts((prev) => [...prev, { ...details, id }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2 px-4 lg:left-60">
        {toasts.map(({ id, ...details }) => (
          <Toast key={id} {...details} onClose={() => dismiss(id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
