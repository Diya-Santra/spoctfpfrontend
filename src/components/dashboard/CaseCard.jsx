import { MapPin, Flag, Plane, Calendar, Phone } from 'lucide-react'
import { formatDate, initials } from '../../data/cases.js'

// Long values (e.g. "United Arab Emirates") are cut with "…"; the full text shows on hover
function Meta({ icon: Icon, children }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5" title={typeof children === 'string' ? children : undefined}>
      <Icon className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} />
      <span className="truncate">{children}</span>
    </span>
  )
}

function Divider() {
  return <span className="h-3.5 w-px bg-line" aria-hidden="true" />
}

function Person({ name, role }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 text-sm text-muted">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[9px] font-medium text-muted">
        {initials(name)}
      </span>
      <span className="truncate" title={`${role}: ${name}`}>
        {role}: {name}
      </span>
    </div>
  )
}

function CaseCard({ item }) {
  return (
    <article className="relative min-w-0 rounded-[3px] border border-line bg-white px-3.5 pb-3.5 pt-4 transition-shadow hover:shadow-[0_4px_14px_rgba(1,30,65,0.08)]">
      {item.highPriority && (
        <span className="absolute right-2 top-2 rounded-full bg-priority-bg px-1.5 py-0.5 text-[11px] font-medium text-priority">
          High priority
        </span>
      )}

      <div className={`flex items-center gap-2 ${item.highPriority ? 'pr-20' : ''}`}>
        <h3 className="min-w-0 break-words text-lg font-medium text-ink">{item.name}</h3>
        <a
          href="#"
          onClick={(event) => event.preventDefault()}
          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-whatsapp"
          aria-label={`Message ${item.name} on WhatsApp`}
        >
          <Phone className="h-2.5 w-2.5 fill-white text-white" strokeWidth={1.5} />
        </a>
      </div>

      <div className="mt-3 space-y-2 text-sm text-body">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Meta icon={MapPin}>{item.city}</Meta>
          <Divider />
          <Meta icon={Flag}>{item.country}</Meta>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Meta icon={Plane}>{`${item.visa} visa`}</Meta>
          <Divider />
          <Meta icon={Calendar}>{formatDate(item.travelDate)}</Meta>
        </div>
      </div>

      <div className="mt-3.5 space-y-3 border-t border-line-soft pt-3.5">
        <Person name={item.csr} role="CSR" />
        <Person name={item.teamLead} role="Team lead" />
      </div>
    </article>
  )
}

export default CaseCard
