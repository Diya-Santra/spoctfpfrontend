import { Trash2 } from 'lucide-react'
import { CurrencyField, DateField, SelectField, TextField } from '../ui/FormControls.jsx'
import { currencySymbol } from '../../data/cases.js'

/**
 * One payment line: amount, receiving account, when it was paid and its reference.
 * `bankOptions` are the enabled accounts in the case currency; `maxPaidAt` stops future times.
 */
function PaymentRow({ payment, index, bankOptions, currencyCode, maxPaidAt, onChange, onRemove }) {
  const set = (key) => (value) => onChange({ ...payment, [key]: value })
  const fieldId = (name) => `payment-${payment.key}-${name}`

  return (
    <div className="grid grid-cols-1 items-start gap-x-4 gap-y-5 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
      <CurrencyField id={fieldId('amount')} label="Payment amount*" symbol={currencySymbol(currencyCode)} required value={payment.amount} onChange={set('amount')} />
      <SelectField id={fieldId('bank')} label="Bank account*" required value={payment.bankAccountId} onChange={set('bankAccountId')} options={bankOptions} placeholder="" />
      <div>
        <DateField id={fieldId('paid-at')} label="Payment date & time*" type="datetime-local" required max={maxPaidAt} value={payment.paidAt} onChange={set('paidAt')} />
        <p className="mt-1.5 text-xs text-muted">Entered in local timezone. Saved as UTC</p>
      </div>
      <TextField id={fieldId('reference')} label="Payment reference*" required maxLength={100} value={payment.reference} onChange={(e) => set('reference')(e.target.value)} />

      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-[2px] text-alert transition-colors hover:bg-neutral-200/60 md:mt-8"
        aria-label={`Remove payment ${index + 1}`}
      >
        <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>
    </div>
  )
}

export default PaymentRow
