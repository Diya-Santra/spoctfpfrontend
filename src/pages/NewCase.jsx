import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, UserCog, Users } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import Stepper from '../components/new-case/Stepper.jsx'
import { FormCard, SectionHeading } from '../components/new-case/FormSection.jsx'
import ApplicantCard from '../components/new-case/ApplicantCard.jsx'
import {
  DateField,
  Form,
  OutlineButton,
  PhoneField,
  PrimaryButton,
  SelectField,
  TextField,
} from '../components/ui/FormControls.jsx'
import { EMPTY_APPLICANT, EMPTY_LEAD } from '../data/cases.js'
import { useLookups } from '../lib/lookups.js'

const STEPS = ['Details', 'Payment', 'Review']

const BACK_LABELS = {
  '/spoc/cases': 'Back to cases',
  '/spoc/dashboard': 'Back to dashboard',
}

const newApplicant = () => ({ ...EMPTY_APPLICANT, key: crypto.randomUUID() })

function NewCase() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = BACK_LABELS[location.state?.from] ? location.state.from : '/spoc/dashboard'
  const { lookups, error: lookupsError } = useLookups()

  const [search, setSearch] = useState('')
  // Coming back from the payment step restores what was already entered
  const draft = location.state?.draft
  const [lead, setLead] = useState(draft?.lead ?? EMPTY_LEAD)
  const [applicants, setApplicants] = useState(() => draft?.applicants ?? [newApplicant()])
  // Checks the browser can't do on its own are only shown after the first "Save & continue"
  const [attempted, setAttempted] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const setLeadField = (key) => (value) => setLead((prev) => ({ ...prev, [key]: value }))

  // Application city depends on the destination country, so a new country clears it
  const setCountry = (countryId) => setLead((prev) => ({ ...prev, countryId, cityId: '' }))
  const cityOptions = lookups?.cities.filter((c) => c.countryId === lead.countryId) ?? []

  const updateApplicant = (index, next) =>
    setApplicants((prev) => prev.map((a, i) => (i === index ? next : a)))

  // Removes the card, even the last one; "Save & continue" then asks for a new applicant
  const removeApplicant = (index) => setApplicants((prev) => prev.filter((_, i) => i !== index))

  const noApplicants = applicants.length === 0 ? 'Add at least one applicant' : ''
  const missingDocuments = applicants.flatMap((a, i) => (a.document ? [] : [i + 1]))

  const handleSubmit = () => {
    setAttempted(true)
    if (noApplicants || missingDocuments.length) return

    navigate('/spoc/cases/new/payment', { state: { from, draft: { ...draft, lead, applicants } } })
  }

  const blockers = attempted
    ? [noApplicants, ...missingDocuments.map((n) => `Upload a travel document for applicant ${n}`)].filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-60">
        <Topbar search={search} onSearchChange={setSearch} userName="SPOC" />

        <main className="flex min-w-0 flex-1 flex-col px-4 pb-12 pt-9 sm:px-8">
          <Link to={from} className="flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            {BACK_LABELS[from]}
          </Link>

          <h2 className="mt-8 text-2xl font-semibold leading-tight text-primary sm:text-[32px]">Add new case</h2>
          <p className="mt-1.5 text-[15px] text-body">
            Configure a new visa application. Verify details against official visa application documentation.
          </p>

          <div className="mt-6">
            <Stepper steps={STEPS} current={0} />
          </div>

          {lookupsError && (
            <p role="alert" className="mt-8 text-sm text-alert">
              Couldn't load the form options: {lookupsError.message}
            </p>
          )}
          {!lookups && !lookupsError && <p className="mt-8 text-sm text-muted">Loading form options…</p>}

          {lookups && (
            <Form onSubmit={handleSubmit} className="mt-8 flex flex-col">
              <FormCard header={<SectionHeading icon={UserCog}>Customer lead information</SectionHeading>}>
                <TextField id="lead-name" label="Full name*" required value={lead.fullName} onChange={(e) => setLeadField('fullName')(e.target.value)} />
                <PhoneField
                  id="lead-phone"
                  label="WhatsApp number*"
                  required
                  code={lead.phoneCode}
                  onCodeChange={setLeadField('phoneCode')}
                  number={lead.phone}
                  onNumberChange={setLeadField('phone')}
                />
                <SelectField id="lead-country" label="Destination country*" required value={lead.countryId} onChange={setCountry} options={lookups.countries} placeholder="" />

                <SelectField
                  id="lead-city"
                  label="Application city*"
                  required
                  disabled={!lead.countryId}
                  value={lead.cityId}
                  onChange={setLeadField('cityId')}
                  options={cityOptions}
                  placeholder=""
                />
                <DateField id="lead-travel" label="Tentative travel date*" required min={today} value={lead.travelDate} onChange={setLeadField('travelDate')} />
                <SelectField id="lead-visa" label="Visa category*" required value={lead.visaCategoryId} onChange={setLeadField('visaCategoryId')} options={lookups.visaCategories} placeholder="" />

                <SelectField id="lead-pack" label="Services packs*" required value={lead.servicePackId} onChange={setLeadField('servicePackId')} options={lookups.servicePacks} placeholder="" />
                <SelectField id="lead-addon" label="Add-on packs" value={lead.addOnPackId} onChange={setLeadField('addOnPackId')} options={lookups.addOnPacks} placeholder="" />
                <SelectField id="lead-csr" label="Assigned CSR*" required value={lead.csrId} onChange={setLeadField('csrId')} options={lookups.csrs} placeholder="" />

                <SelectField id="lead-team-lead" label="Assigned team lead*" required value={lead.teamLeadId} onChange={setLeadField('teamLeadId')} options={lookups.teamLeads} placeholder="" />
              </FormCard>

              <div className="mt-10">
                <SectionHeading icon={Users}>Applicant details</SectionHeading>
              </div>

              <div className="mt-5 flex flex-col gap-6">
                {applicants.map((applicant, index) => (
                  <ApplicantCard
                    key={applicant.key}
                    applicant={applicant}
                    index={index}
                    total={applicants.length}
                    lookups={lookups}
                    documentError={attempted ? 'Travel document is required.' : ''}
                    onChange={(next) => updateApplicant(index, next)}
                    onRemove={() => removeApplicant(index)}
                  />
                ))}
              </div>

              <OutlineButton
                type="button"
                onClick={() => setApplicants((prev) => [...prev, newApplicant()])}
                className="mt-8 h-12 w-fit px-5"
              >
                <Plus className="h-5 w-5" strokeWidth={1.5} />
                Add new applicant
              </OutlineButton>

              <div className="mt-8 flex flex-wrap items-center justify-end gap-4 border-t border-line pt-8">
                {blockers.length > 0 && (
                  <ul role="alert" className="mr-auto text-sm text-alert">
                    {blockers.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                )}
                <OutlineButton type="button" onClick={() => navigate(from)} className="h-12 px-6">
                  Cancel
                </OutlineButton>
                <PrimaryButton type="submit" className="h-12 px-6">
                  Save &amp; continue
                </PrimaryButton>
              </div>
            </Form>
          )}
        </main>
      </div>
    </div>
  )
}

export default NewCase
