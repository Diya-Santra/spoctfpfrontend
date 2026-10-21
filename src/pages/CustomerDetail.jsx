import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Download,
  Eye,
  EyeOff,
  FileText,
  Flag,
  MapPin,
  Phone,
  ReceiptText,
  Stamp,
  Tag,
  User,
} from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import StateBadge from '../components/cases/StateBadge.jsx'
import { DetailCard, DetailFields } from '../components/directory/DetailCard.jsx'
import { formatDate, formatDateTime, formatMoney } from '../data/cases.js'
import { whatsappUrl } from '../data/customers.js'
import { apiGet } from '../lib/api.js'

const fullName = (...parts) => parts.filter(Boolean).join(' ')

/** 1 / 0 / null from the database -> "Yes" / "No" / "" */
const yesNo = (value) => (value == null ? '' : Number(value) ? 'Yes' : 'No')

/** Formats YYYY-MM-DD; older form rows may hold free text, which is shown as-is. */
const showDate = (value) => (/^\d{4}-\d{2}-\d{2}/.test(value ?? '') ? formatDate(value.slice(0, 10)) : value)

/** Inline "a | b" meta row under the customer name. */
function MetaRow({ items }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-body">
      {items.map(({ icon: Icon, text }, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && <span className="mr-1.5 h-4 w-px bg-line" aria-hidden="true" />}
          <Icon className="h-4 w-4 text-muted" strokeWidth={1.75} />
          {text || '-'}
        </span>
      ))}
    </p>
  )
}

/** Read-only name under a small uppercase label. */
function Assignee({ label, name }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 flex h-9 items-center text-[15px] text-ink">{name || '-'}</p>
    </div>
  )
}

/** Small uppercase heading splitting one card into parts, e.g. "Travel plan". */
function SubHeading({ children }) {
  return <h4 className="mb-5 border-b border-line-soft pb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted">{children}</h4>
}

// GET /api/case/customer/:id, then that case's payments. The case id is only
// used for the second request — it is never shown.
function useCustomer(contactId) {
  const [state, setState] = useState({ customer: null, payments: [], error: null })

  useEffect(() => {
    const controller = new AbortController()
    apiGet(`/api/case/customer/${encodeURIComponent(contactId)}`, null, controller.signal)
      .then(async (customer) => {
        const payments = await apiGet(`/api/cases/${customer.case_id}/deposit/payments`, null, controller.signal)
        setState({ customer, payments, error: null })
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ customer: null, payments: [], error })
      })
    return () => controller.abort()
  }, [contactId])

  return state
}

// Travel plan and destination preferences from GET /travel-info/:form_id.
// A 404 just means the customer hasn't filled that part of the form yet.
function useTravelInfo(formId) {
  const [state, setState] = useState({ formId: null, data: null })

  useEffect(() => {
    if (!formId) return
    const controller = new AbortController()
    apiGet(`/travel-info/${encodeURIComponent(formId)}`, null, controller.signal)
      .then((data) => setState({ formId, data }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ formId, data: null })
      })
    return () => controller.abort()
  }, [formId])

  // Ignore a previous applicant's result while the new one loads
  return state.formId === formId ? state.data : null
}

function VacAccount({ applicant }) {
  const [showPassword, setShowPassword] = useState(false)
  const required = Boolean(Number(applicant.vac_account_required))
  const password = applicant.vac_password

  return (
    <DetailCard title="VAC account">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm text-muted">Account status</dt>
          <dd className="mt-1.5 flex items-center gap-2 text-[15px] text-body">
            <span
              className={`flex h-[22px] w-[22px] items-center justify-center rounded-[3px] border ${
                required ? 'border-primary bg-primary' : 'border-line bg-white'
              }`}
              aria-hidden="true"
            >
              {required && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
            </span>
            {required ? 'VAC account required' : 'VAC account not required'}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sm text-muted">Username</dt>
          <dd className="mt-1 break-words text-[15px] text-ink">{applicant.vac_alias || '-'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sm text-muted">Password</dt>
          <dd className="mt-1 flex items-center gap-2 text-[15px] text-ink">
            {password ? (
              <>
                <span className="break-all font-mono">{showPassword ? password : '•'.repeat(password.length)}</span>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-muted transition-colors hover:text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </>
            ) : (
              '-'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Application status</dt>
          <dd className="mt-1 text-[15px] text-ink">{applicant.status_label || '-'}</dd>
        </div>
      </dl>
    </DetailCard>
  )
}

// Until the customer fills in the travel part of their form, show what the SPOC
// entered on "Add new case" (destination, application city, travel date, visa).
function TravelInformation({ applicant, caseInfo }) {
  const travel = useTravelInfo(applicant.form_id)
  const formPlans = travel?.travel_dates ?? []
  const formPreferences = travel?.destination_preferences ?? []

  const plans = formPlans.length
    ? formPlans
    : caseInfo.tentative_travel_date
      ? [{ travel_date: caseInfo.tentative_travel_date, countries_to_visit_names: [caseInfo.destination_country].filter(Boolean) }]
      : []
  const preferences = formPreferences.length
    ? formPreferences
    : caseInfo.destination_country
      ? [{ destination_country_name: caseInfo.destination_country, application_city_name: caseInfo.application_city }]
      : []

  return (
    <DetailCard title="Travel information" collapsible>
      <div className="flex flex-col gap-7">
        <DetailFields fields={[{ label: 'Visa type', value: applicant.travel_visa_type || caseInfo.visa_category }]} />

        <div>
          <SubHeading>Travel plan</SubHeading>
          {plans.length === 0 ? (
            <DetailFields fields={[{ label: 'Travel dates', value: '' }, { label: 'Country(ies) to be visited', value: '' }]} />
          ) : (
            <div className="flex flex-col gap-6">
              {plans.map((plan, index) => (
                <DetailFields
                  key={index}
                  fields={[
                    { label: 'Travel dates', value: showDate(plan.travel_date) },
                    {
                      label: 'Country(ies) to be visited',
                      value: [...(plan.countries_to_visit_names ?? []), ...(plan.countries_to_visit_unresolved ?? [])].join(', '),
                    },
                  ]}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <SubHeading>Destination preferences</SubHeading>
          {preferences.length === 0 ? (
            <DetailFields fields={[{ label: 'Destination country', value: '' }, { label: 'Application city', value: '' }]} />
          ) : (
            <div className="flex flex-col gap-6">
              {preferences.map((preference, index) => (
                <div key={index}>
                  <span className="inline-flex rounded-full bg-priority-bg px-3 py-1 text-xs font-medium text-priority">
                    Preference {index + 1}
                  </span>
                  <div className="mt-4">
                    <DetailFields
                      fields={[
                        { label: 'Destination country', value: preference.destination_country_name },
                        { label: 'Application city', value: preference.application_city_name },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DetailCard>
  )
}

function ApplicantSections({ applicant, caseInfo, currencyCode }) {
  const address = applicant.address ?? {}
  const permit = applicant.residence_permit ?? {}
  const job = applicant.occupation ?? {}
  const visa = applicant.visa_history ?? {}
  const funding = applicant.financing ?? {}

  return (
    <>
      <VacAccount applicant={applicant} />

      <DetailCard title="Personal information" collapsible>
        <DetailFields
          fields={[
            { label: 'Name', value: applicant.first_name },
            { label: 'Surname', value: applicant.surname },
            {
              label: 'Have you ever been known by a different name?',
              value:
                Number(applicant.had_different_name) && applicant.previous_name
                  ? `Yes — ${applicant.previous_name}`
                  : yesNo(applicant.had_different_name),
              span: 2,
            },
            { label: 'Date of birth', value: showDate(applicant.date_of_birth) },
            { label: 'Place of birth', value: applicant.place_of_birth },
            { label: 'Country of birth', value: applicant.country_of_birth },
            { label: 'Current nationality', value: applicant.nationality },
            { label: 'Gender', value: applicant.gender },
            { label: 'Marital status', value: applicant.marital_status },
          ]}
        />
      </DetailCard>

      <DetailCard title="Travel documents details" collapsible>
        <DetailFields
          fields={[
            { label: 'Document type', value: applicant.travel_document_type },
            { label: 'Document number', value: applicant.travel_document_number },
            { label: 'Date of issue', value: showDate(applicant.issue_date) },
            { label: 'Valid until', value: showDate(applicant.expiry_date) },
          ]}
        />
      </DetailCard>

      <DetailCard title="Address & contact information" collapsible>
        <DetailFields
          fields={[
            { label: 'Post code', value: address.postcode },
            { label: 'Address line 1', value: address.address_line1 },
            { label: 'City', value: address.city },
            { label: 'County', value: address.county },
            { label: 'Country', value: address.country },
            // Until the form is filled in, the numbers entered on "Add new case"
            { label: 'Mobile number', value: address.mobile_number || applicant.phone_number },
            { label: 'WhatsApp number', value: address.whatsapp_number || applicant.whatsapp_number },
            { label: 'Email', value: address.email || applicant.email },
          ]}
        />
      </DetailCard>

      <DetailCard title="Residence permit" collapsible>
        <DetailFields
          fields={[
            { label: 'Residence permit file / Share code', value: permit.permit_number },
            { label: 'Residence status / Visa type', value: permit.permit_type },
            { label: 'Date of issue', value: showDate(permit.issue_date) },
            { label: 'Valid until', value: showDate(permit.expiry_date) },
          ]}
        />
      </DetailCard>

      <DetailCard title="Current occupation" collapsible>
        <DetailFields
          fields={[
            { label: 'Current employment status', value: job.occupation },
            { label: 'Employer name', value: job.employer_name },
            { label: 'Role / Designation', value: job.job_title },
            { label: 'Date of joining', value: showDate(job.start_date) },
            { label: 'Employer address', value: job.employer_address, span: 2 },
            { label: 'Email', value: job.employer_email },
            { label: 'Contact number', value: job.employer_phone },
            {
              label: 'Gross annual earnings',
              value: job.gross_annual_earnings == null ? '' : formatMoney(Number(job.gross_annual_earnings), currencyCode),
            },
          ]}
        />
      </DetailCard>

      <TravelInformation applicant={applicant} caseInfo={caseInfo} />

      <DetailCard title="Previous visa" collapsible>
        <DetailFields
          fields={[
            { label: 'Schengen visa in the last 59 months?', value: yesNo(visa.had_schengen_visa_last_59_months) },
            { label: 'Previous biometrics date', value: showDate(visa.previous_biometrics_date) },
            { label: 'Visa sticker number', value: visa.visa_sticker_number },
            {
              label: 'Visa dates',
              value: visa.visa_valid_from || visa.visa_valid_to ? `${showDate(visa.visa_valid_from) || '-'} – ${showDate(visa.visa_valid_to) || '-'}` : '',
            },
          ]}
        />
      </DetailCard>

      <DetailCard title="Financing of stay" collapsible>
        <DetailFields
          fields={[
            { label: 'Who will fund the trip?', value: funding.funding_source },
            { label: 'Name', value: funding.sponsor_first_name },
            { label: 'Surname', value: funding.sponsor_surname },
            { label: 'Gender', value: funding.sponsor_gender },
            { label: 'Address', value: funding.sponsor_address, span: 2 },
            { label: 'Country', value: funding.sponsor_country },
            { label: 'Contact number', value: funding.sponsor_contact_number },
            { label: 'Email', value: funding.sponsor_email },
            { label: 'Current profession', value: funding.sponsor_occupation },
          ]}
        />
      </DetailCard>

      <DetailCard title="Additional information" collapsible>
        <DetailFields
          fields={[
            {
              label:
                'Do you join or travel with a family member from an EU country, the EEA, the Swiss Confederation, or a family member who is a UK national beneficiary of the withdrawal agreement?',
              value: yesNo(funding.joins_eu_family_member),
              span: 2,
            },
            { label: 'Other notes', value: applicant.other_notes, span: 2 },
          ]}
        />
      </DetailCard>
    </>
  )
}

// Asks the backend for a short-lived link to the file. Viewing opens it in a new
// tab (opened before the request, so the browser doesn't block it as a popup);
// downloading saves it without leaving the page.
async function openDocument(documentKey, download) {
  const tab = download ? null : window.open('', '_blank')
  try {
    const { url } = await apiGet(`/api/case/document/${encodeURIComponent(documentKey)}`, download ? { download: 1 } : null)
    if (tab) {
      tab.opener = null
      tab.location.href = url
    } else {
      window.location.assign(url)
    }
  } catch (err) {
    tab?.close()
    throw err
  }
}

function DocumentsRepository({ documents }) {
  const [error, setError] = useState('')

  const open = (documentKey, download) => {
    setError('')
    openDocument(documentKey, download).catch((err) => setError(err.message))
  }

  return (
    <DetailCard title="Documents repository" icon={FileText} collapsible>
      {documents.length === 0 ? (
        <p className="text-sm text-muted">No documents uploaded yet.</p>
      ) : (
        <>
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-line">
                  {['Document name', 'Document type', 'Uploader', 'Upload date'].map((column) => (
                    <th key={column} scope="col" className="whitespace-nowrap px-4 py-4 text-sm font-medium text-ink first:pl-6">
                      {column}
                    </th>
                  ))}
                  <th scope="col" className="w-24">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.document_key} className="border-b border-line-soft text-body last:border-b-0">
                    <td className="px-4 py-4 pl-6">{doc.document_name || '-'}</td>
                    <td className="px-4 py-4">{doc.document_category || '-'}</td>
                    <td className="px-4 py-4">{doc.uploader || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-4">{doc.uploaded_at ? formatDate(doc.uploaded_at.slice(0, 10)) : '-'}</td>
                    <td className="px-4 py-4 pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => open(doc.document_key, false)}
                          className="flex h-8 w-8 items-center justify-center rounded-[2px] text-muted transition-colors hover:bg-neutral-200/60 hover:text-primary"
                          aria-label={`View ${doc.document_name}`}
                          title="View"
                        >
                          <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => open(doc.document_key, true)}
                          className="flex h-8 w-8 items-center justify-center rounded-[2px] text-muted transition-colors hover:bg-neutral-200/60 hover:text-primary"
                          aria-label={`Download ${doc.document_name}`}
                          title="Download"
                        >
                          <Download className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error && (
            <p role="alert" className="mt-10 text-sm text-alert">
              Couldn't open the document: {error}
            </p>
          )}
        </>
      )}
    </DetailCard>
  )
}

function FinancialRecord({ payments, totalPrice, money }) {
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const balanceDue = Math.max(0, totalPrice - totalPaid)

  return (
    <DetailCard
      title="Financial record"
      icon={ReceiptText}
      collapsible
      actions={
        totalPrice > 0 && (
          <span className="text-sm text-body">
            Balance due: <span className={`font-medium ${balanceDue > 0 ? 'text-alert' : 'text-stage-submitted'}`}>{money(balanceDue)}</span>
          </span>
        )
      }
    >
      {payments.length === 0 ? (
        <p className="text-sm text-muted">No payments recorded.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map((p) => (
            <div key={p.payment_id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 rounded-[2px] border border-line px-5 py-4">
              <div className="min-w-0">
                <p className="break-words text-[15px] font-medium text-ink">{p.account_name || '-'}</p>
                <p className="mt-1 break-all text-xs text-muted">REF: {p.payment_reference}</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-medium text-ink">{money(Number(p.amount))}</p>
                <p className="mt-1 text-xs text-muted">{formatDateTime(p.local_payment_datetime)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DetailCard>
  )
}

function CustomerDetailView({ contactId }) {
  const { customer, payments, error } = useCustomer(contactId)

  const [search, setSearch] = useState('')
  const [applicantIndex, setApplicantIndex] = useState(0)

  let content
  if (error) {
    content = (
      <p role="alert" className="mt-8 text-sm text-alert">
        {error.status === 404 ? 'This customer could not be found.' : `Couldn't load this customer: ${error.message}`}
      </p>
    )
  } else if (!customer) {
    content = <p className="mt-8 text-sm text-muted">Loading customer…</p>
  } else {
    const lead = fullName(customer.lead_first_name, customer.lead_surname)
    const applicant = customer.applicants[applicantIndex]
    const packs = customer.packs.map((p) => p.name).filter(Boolean).join(', ')
    const currencyCode = customer.currency_code ?? 'GBP'
    const money = (amount) => formatMoney(amount, currencyCode)

    content = (
      <>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
          <div className="min-w-0">
            <StateBadge state={customer.status_code} label={customer.status_label ?? 'Unknown'} />

            <h2 className="mt-4 break-words text-2xl font-semibold leading-tight text-primary sm:text-[32px]">{lead}</h2>

            <div className="mt-3 flex flex-col gap-2">
              <MetaRow
                items={[
                  { icon: MapPin, text: customer.application_city },
                  { icon: Flag, text: customer.destination_country },
                ]}
              />
              <MetaRow
                items={[
                  { icon: Stamp, text: customer.visa_category && `${customer.visa_category} visa` },
                  { icon: Tag, text: packs },
                  { icon: CalendarDays, text: formatDate(customer.tentative_travel_date) },
                ]}
              />
              <p className="flex items-center gap-1.5 text-[15px] text-body">
                <User className="h-4 w-4 text-muted" strokeWidth={1.75} />
                {lead}
                {customer.lead_whatsapp_number && (
                  <a
                    href={whatsappUrl(customer.lead_whatsapp_number)}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-whatsapp transition-opacity hover:opacity-80"
                    aria-label={`Message ${lead} on WhatsApp (${customer.lead_whatsapp_number})`}
                  >
                    <Phone className="h-2.5 w-2.5 fill-white text-white" strokeWidth={1.5} />
                  </a>
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-10">
            <Assignee label="CSR" name={customer.assigned_csr} />
            <Assignee label="Lead" name={customer.assigned_team_lead} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          {customer.applicants.length > 1 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Applicants">
              {customer.applicants.map((a, index) => (
                <button
                  key={a.application_id}
                  type="button"
                  role="tab"
                  aria-selected={index === applicantIndex}
                  onClick={() => setApplicantIndex(index)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    index === applicantIndex
                      ? 'border-primary bg-primary text-white'
                      : 'border-line bg-white text-body hover:border-primary hover:text-primary'
                  }`}
                >
                  Applicant {index + 1} · {fullName(a.first_name, a.surname)}
                </button>
              ))}
            </div>
          )}

          {applicant ? (
            // Keyed so per-applicant state (e.g. a revealed password) resets on switching
            <ApplicantSections key={applicant.application_id} applicant={applicant} caseInfo={customer} currencyCode={currencyCode} />
          ) : (
            <p className="text-sm text-muted">No applicants on this case.</p>
          )}

          <DocumentsRepository documents={customer.documents} />
          <FinancialRecord payments={payments} totalPrice={customer.total_price} money={money} />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-60">
        <Topbar search={search} onSearchChange={setSearch} userName="SPOC" />

        <main className="flex min-w-0 flex-1 flex-col px-4 pb-12 pt-9 sm:px-8">
          <Link to="/spoc/directory" className="flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Back to directory
          </Link>
          {content}
        </main>
      </div>
    </div>
  )
}

// Keyed by id so the selected applicant doesn't leak between customers
function CustomerDetail() {
  const { customerId } = useParams()
  return <CustomerDetailView key={customerId} contactId={customerId} />
}

export default CustomerDetail
