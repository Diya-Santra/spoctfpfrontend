import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Banknote, Plus } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import Stepper from '../components/new-case/Stepper.jsx'
import { SectionHeading } from '../components/new-case/FormSection.jsx'
import PaymentSummary from '../components/new-case/PaymentSummary.jsx'
import PaymentRow from '../components/new-case/PaymentRow.jsx'
import { OutlineButton, PrimaryButton } from '../components/ui/FormControls.jsx'
import { EMPTY_PAYMENT } from '../data/cases.js'
import { apiGet } from '../lib/api.js'
import { useLookups } from '../lib/lookups.js'
import { nowLocal } from '../lib/newCase.js'

const STEPS = ['Details', 'Payment', 'Review']

const newPayment = () => ({ ...EMPTY_PAYMENT, key: crypto.randomUUID() })

// Query for GET /api/case/minimum-deposit, from the packs and destination picked in step 1
function quoteQuery(lead) {
  if (!lead) return null
  const query = {
    destination_country_id: lead.countryId,
    application_city_id: lead.cityId,
    service_pack_ids: lead.servicePackId,
  }
  if (lead.addOnPackId) query.add_on_pack_ids = lead.addOnPackId
  return new URLSearchParams(query).toString()
}

function NewCasePayment() {
  const navigate = useNavigate()
  const location = useLocation()
  const { from, draft } = location.state ?? {}
  const { lookups, error: lookupsError } = useLookups()

  const [search, setSearch] = useState('')
  const [payments, setPayments] = useState(() => (draft?.payments?.length ? draft.payments : [newPayment()]))
  // { minimum, currencyId, currencyCode } — the backend works it out from the chosen packs
  const [quote, setQuote] = useState(null)
  const [quoteError, setQuoteError] = useState('')

  const query = quoteQuery(draft?.lead)
  useEffect(() => {
    if (!query) return
    const controller = new AbortController()
    apiGet(`/api/case/minimum-deposit?${query}`, null, controller.signal)
      .then((data) =>
        setQuote({ minimum: data.minimum_deposit_amount, currencyId: data.currency_id, currencyCode: data.currency_code }),
      )
      .catch((err) => {
        if (err.name !== 'AbortError') setQuoteError(err.message)
      })
    return () => controller.abort()
  }, [query])

  // Reached without filling in the details step (e.g. direct URL / refresh) — start there.
  if (!draft) return <Navigate to="/spoc/cases/new" replace state={{ from }} />

  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const shortfall = quote && totalPaid < quote.minimum
  // Payments are compared with the minimum, so only accounts in the case currency can take them
  const bankOptions = quote && lookups ? lookups.bankAccounts.filter((b) => b.currencyId === quote.currencyId) : []
  const maxPaidAt = nowLocal()

  const updatePayment = (index, next) => setPayments((prev) => prev.map((p, i) => (i === index ? next : p)))

  // At least one payment row is always shown — removing the last one clears it instead
  const removePayment = (index) =>
    setPayments((prev) => (prev.length === 1 ? [newPayment()] : prev.filter((_, i) => i !== index)))

  // Keep everything entered so far when stepping back to the details form
  const backToDetails = () => navigate('/spoc/cases/new', { state: { from, draft: { ...draft, payments } } })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!quote) return
    navigate('/spoc/cases/new/review', { state: { from, draft: { ...draft, payments, quote } } })
  }

  const loadError = quoteError || lookupsError?.message

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-60">
        <Topbar search={search} onSearchChange={setSearch} userName="SPOC" />

        <main className="flex min-w-0 flex-1 flex-col px-4 pb-12 pt-9 sm:px-8">
          <button
            type="button"
            onClick={backToDetails}
            className="flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Back to details
          </button>

          <h2 className="mt-8 text-2xl font-semibold leading-tight text-primary sm:text-[32px]">Add new case</h2>
          <p className="mt-1.5 text-[15px] text-body">
            Configure a new visa application. Verify details against official visa application documentation.
          </p>

          <div className="mt-6">
            <Stepper steps={STEPS} current={1} />
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col">
            <PaymentSummary minimum={quote?.minimum ?? null} totalPaid={totalPaid} currencyCode={quote?.currencyCode} />

            {loadError && (
              <p role="alert" className="mt-4 text-sm text-alert">
                Couldn't load the deposit details: {loadError}
              </p>
            )}
            {quote && lookups && bankOptions.length === 0 && (
              <p role="alert" className="mt-4 text-sm text-alert">
                No enabled bank account takes {quote.currencyCode}, the currency of the selected packs.
              </p>
            )}

            <section className="mt-8 rounded-[2px] border border-line">
              <header className="flex h-14 items-center border-b border-line bg-neutral-50 px-6">
                <SectionHeading icon={Banknote}>Payment breakdown</SectionHeading>
              </header>
              <div className="divide-y divide-line-soft">
                {payments.map((payment, index) => (
                  <div key={payment.key} className="p-6">
                    <PaymentRow
                      payment={payment}
                      index={index}
                      bankOptions={bankOptions}
                      currencyCode={quote?.currencyCode}
                      maxPaidAt={maxPaidAt}
                      onChange={(next) => updatePayment(index, next)}
                      onRemove={() => removePayment(index)}
                    />
                  </div>
                ))}
              </div>
            </section>

            <OutlineButton
              type="button"
              onClick={() => setPayments((prev) => [...prev, newPayment()])}
              className="mt-8 h-12 w-fit px-5"
            >
              <Plus className="h-5 w-5" strokeWidth={1.5} />
              Add new payment
            </OutlineButton>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
              <button
                type="button"
                onClick={backToDetails}
                className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                Back to details
              </button>

              <div className="flex flex-wrap items-center justify-end gap-4">
                {shortfall && (
                  <p className="max-w-sm text-sm text-stage-created">
                    Below the minimum deposit — the case will go to Deposit Amount Review for a Lead Consultant.
                  </p>
                )}
                <OutlineButton type="button" onClick={() => navigate(from ?? '/spoc/dashboard')} className="h-12 px-6">
                  Cancel
                </OutlineButton>
                <PrimaryButton type="submit" disabled={!quote} className="h-12 px-6 disabled:cursor-not-allowed disabled:opacity-60">
                  Save &amp; continue
                </PrimaryButton>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

export default NewCasePayment
