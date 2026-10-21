import { CASE_STATES } from '../../data/cases.js'

// Full class names so Tailwind can detect them (tokens live in index.css)
const TONES = {
  created: 'bg-stage-created-badge/70 text-stage-created',
  review: 'bg-stage-review-badge/70 text-stage-review',
  vac: 'bg-stage-vac-badge/70 text-stage-vac',
  appointment: 'bg-stage-appointment-badge/70 text-stage-appointment',
  booked: 'bg-state-booked-badge text-state-booked',
  submitted: 'bg-stage-submitted-badge/70 text-stage-submitted',
  customer: 'bg-state-customer-badge text-state-customer',
}

// Backend case_status codes that need a colour other than the default
const STATUS_TONES = {
  pending_initial_deposit: 'review',
  deposit_amount_review: 'review',
}

/** Mock cases pass a CASE_STATES id; backend cases pass their status code plus its `label`. */
function StateBadge({ state, label }) {
  const config = label
    ? { label, tone: STATUS_TONES[state] ?? 'created' }
    : (CASE_STATES.find((s) => s.id === state) ?? CASE_STATES[0])

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] leading-none ${TONES[config.tone]}`}>
      {config.label}
    </span>
  )
}

export default StateBadge
