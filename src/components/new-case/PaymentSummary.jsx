import { Coins } from 'lucide-react'
import { SectionHeading } from './FormSection.jsx'
import { formatMoney } from '../../data/cases.js'

/**
 * Minimum deposit vs. total paid so far — the total turns green once the minimum is covered.
 * `minimum` is null while the backend is still working it out.
 */
function PaymentSummary({ minimum, totalPaid, currencyCode }) {
  const covered = minimum != null && totalPaid >= minimum

  return (
    <section className="w-full max-w-[400px] rounded-[2px] border border-line">
      <header className="flex h-14 items-center border-b border-line bg-neutral-50 px-6">
        <SectionHeading icon={Coins}>Payment summary</SectionHeading>
      </header>
      <dl className="grid grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-1 border-r border-line px-4 py-5">
          <dt className="text-sm text-body">Minimum deposit required</dt>
          <dd className="text-xl font-semibold text-ink">{minimum == null ? '…' : formatMoney(minimum, currencyCode)}</dd>
        </div>
        <div
          className={`flex flex-col items-center justify-center gap-1 px-4 py-5 ${
            covered ? 'bg-stage-submitted-bg text-stage-submitted' : 'bg-stage-created-bg text-stage-created'
          }`}
        >
          <dt className="text-sm">Total amount paid</dt>
          <dd className="text-xl font-semibold">{formatMoney(totalPaid, currencyCode)}</dd>
        </div>
      </dl>
    </section>
  )
}

export default PaymentSummary
