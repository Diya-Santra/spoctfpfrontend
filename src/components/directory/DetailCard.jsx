import { useId, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

/**
 * Bordered card with an uppercase title (and optional `icon`); `collapsible` adds a chevron that
 * hides the body.
 */
export function DetailCard({ title, icon: Icon, collapsible = false, actions, children }) {
  const [open, setOpen] = useState(true)
  const bodyId = useId()
  const Chevron = open ? ChevronUp : ChevronDown

  return (
    <section className="rounded-[2px] border border-line">
      <header
        className={`flex h-14 items-center justify-between gap-4 bg-neutral-50 px-6 ${open ? 'border-b border-line' : ''}`}
      >
        <h3 className="flex items-center gap-2.5 text-[13px] font-medium uppercase tracking-[0.12em] text-body">
          {Icon && <Icon className="h-[18px] w-[18px] text-muted" strokeWidth={1.75} />}
          {title}
        </h3>
        <div className="flex items-center gap-3">
          {actions}
          {collapsible && (
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-[2px] text-muted transition-colors hover:bg-neutral-200/60 hover:text-ink"
              aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
              aria-controls={bodyId}
              aria-expanded={open}
            >
              <Chevron className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </header>
      <div id={bodyId} className={open ? 'p-6' : 'hidden'}>
        {children}
      </div>
    </section>
  )
}

/**
 * 4-column label / value grid. `fields` is a list of { label, value, span? } where span 2 widens
 * a field to two columns; empty values show "-".
 */
export function DetailFields({ fields }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
      {fields.map(({ label, value, span }) => (
        <div key={label} className={`min-w-0 ${span === 2 ? 'sm:col-span-2' : ''}`}>
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="mt-1 break-words text-[15px] text-ink">{value || '-'}</dd>
        </div>
      ))}
    </dl>
  )
}
