import { Fragment, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Banknote, UserCog, Users } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import Stepper from '../components/new-case/Stepper.jsx'
import { ReviewCard, ReviewFields } from '../components/new-case/ReviewCard.jsx'
import { OutlineButton, PrimaryButton } from '../components/ui/FormControls.jsx'
import { formatDate, formatDateTime, formatMoney } from '../data/cases.js'
import { labelOf, useLookups } from '../lib/lookups.js'
import { createFullCase, describeFieldError, toE164 } from '../lib/newCase.js'

const STEPS = ['Details', 'Payment', 'Review']

function NewCaseReview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { from, draft } = location.state ?? {}
  const { lookups, error: lookupsError } = useLookups()

  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Reached without going through the earlier steps (e.g. direct URL / refresh) — start over.
  if (!draft?.payments || !draft.quote) return <Navigate to="/spoc/cases/new" replace state={{ from }} />

  const { lead, applicants, payments, quote } = draft

  // Edits go back to the owning step with everything entered so far
  const editDetails = () => navigate('/spoc/cases/new', { state: { from, draft } })
  const backToPayment = () => navigate('/spoc/cases/new/payment', { state: { from, draft } })

  // The only step that writes to the database: the whole case is created in one request.
  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createFullCase(draft)
    } catch (err) {
      setSubmitError(err)
      setSubmitting(false)
      return
    }

    // There's no case detail page yet; the list it was started from reloads and shows the new case.
    // Replace, so the browser's back button can't land on this page and submit the case twice
    navigate(from ?? '/spoc/dashboard', { replace: true })
  }

  const backLink = (
    <button
      type="button"
      onClick={backToPayment}
      className="flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
      Back to payment
    </button>
  )

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const money = (amount) => formatMoney(amount, quote.currencyCode)

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-60">
        <Topbar search={search} onSearchChange={setSearch} userName="SPOC" />

        <main className="flex min-w-0 flex-1 flex-col px-4 pb-12 pt-9 sm:px-8">
          {backLink}

          <h2 className="mt-8 text-2xl font-semibold leading-tight text-primary sm:text-[32px]">Add new case</h2>
          <p className="mt-1.5 text-[15px] text-body">
            Configure a new visa application. Verify details against official visa application documentation.
          </p>

          <div className="mt-6">
            <Stepper steps={STEPS} current={2} />
          </div>

          {lookupsError && (
            <p role="alert" className="mt-8 text-sm text-alert">
              Couldn't load the form options: {lookupsError.message}
            </p>
          )}
          {!lookups && !lookupsError && <p className="mt-8 text-sm text-muted">Loading…</p>}

          {lookups && (
            <>
              <div className="mt-8 flex flex-col gap-8">
                <ReviewCard icon={UserCog} title="Customer lead information" onEdit={editDetails} editLabel="Edit customer lead information">
                  <ReviewFields
                    fields={[
                      ['Full name', lead.fullName],
                      ['WhatsApp number', toE164(lead.phoneCode, lead.phone)],
                      ['Destination country', labelOf(lookups.countries, lead.countryId)],
                      ['Application city', labelOf(lookups.cities, lead.cityId)],
                      ['Tentative travel date', formatDate(lead.travelDate)],
                      ['Visa category', labelOf(lookups.visaCategories, lead.visaCategoryId)],
                      ['Services packs', labelOf(lookups.servicePacks, lead.servicePackId)],
                      ['Add-on packs', labelOf(lookups.addOnPacks, lead.addOnPackId)],
                      ['Assigned CSR', labelOf(lookups.csrs, lead.csrId)],
                      ['Assigned team lead', labelOf(lookups.teamLeads, lead.teamLeadId)],
                    ]}
                  />
                </ReviewCard>

                <ReviewCard icon={Users} title="Applicant details summary" onEdit={editDetails} editLabel="Edit applicant details">
                  <div className="flex flex-col gap-6">
                    {applicants.map((applicant, index) => (
                      <Fragment key={applicant.key}>
                        {index > 0 && <hr className="border-line-soft" />}
                        <div>
                          <span className="inline-flex rounded-full bg-priority-bg px-3 py-1 text-xs font-medium text-priority">
                            Applicant {index + 1}
                          </span>
                          <div className="mt-5">
                            <ReviewFields
                              fields={[
                                ['First name', applicant.firstName],
                                ['Surname', applicant.surname],
                                ['Sex', labelOf(lookups.genders, applicant.genderId)],
                                ['Date of birth', formatDate(applicant.dateOfBirth)],
                                ['Document type', labelOf(lookups.documentTypes, applicant.documentType)],
                                ['Document number', applicant.documentNumber],
                                ['Issue date', formatDate(applicant.issueDate)],
                                ['Expiry date', formatDate(applicant.expiryDate)],
                                ['Nationality', labelOf(lookups.countries, applicant.nationalityId)],
                                ['Place of birth', labelOf(lookups.birthPlaces, applicant.placeOfBirthId)],
                                ['Phone number', toE164(applicant.phoneCode, applicant.phone)],
                                ['Upload travel document', applicant.document?.name],
                              ]}
                            />
                          </div>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </ReviewCard>

                <ReviewCard icon={Banknote} title="Payment breakdown" onEdit={backToPayment} editLabel="Edit payments">
                  <div className="flex flex-col gap-6">
                    <ReviewFields
                      fields={[
                        ['Minimum deposit required', money(quote.minimum)],
                        ['Total amount paid', money(totalPaid)],
                      ]}
                    />
                    {payments.map((payment) => (
                      <Fragment key={payment.key}>
                        <hr className="border-line-soft" />
                        <ReviewFields
                          fields={[
                            ['Payment amount', money(Number(payment.amount))],
                            ['Bank account', labelOf(lookups.bankAccounts, payment.bankAccountId)],
                            ['Payment date and time', formatDateTime(payment.paidAt)],
                            ['Payment reference', payment.reference],
                          ]}
                        />
                      </Fragment>
                    ))}
                  </div>
                </ReviewCard>
              </div>

              {submitError && (
                <div role="alert" className="mt-8 rounded-[2px] border border-alert px-6 py-4 text-sm text-alert">
                  <p className="font-medium">The case wasn't saved. {submitError.details?.length ? 'Fix these and try again:' : submitError.message}</p>
                  {submitError.details?.length > 0 && (
                    <ul className="mt-2 list-disc pl-5">
                      {submitError.details.map((detail) => (
                        <li key={`${detail.field}-${detail.message}`}>{describeFieldError(detail)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
                {backLink}

                <div className="flex flex-wrap items-center justify-end gap-4">
                  <OutlineButton type="button" disabled={submitting} onClick={() => navigate(from ?? '/spoc/dashboard')} className="h-12 px-6">
                    Cancel
                  </OutlineButton>
                  <PrimaryButton
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="h-12 px-6 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Submitting…' : <>Confirm &amp; submit</>}
                  </PrimaryButton>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default NewCaseReview
