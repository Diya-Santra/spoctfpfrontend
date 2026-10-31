import { useState } from 'react'
import { GripVertical, Lock, Plus, Search, Trash2, Upload } from 'lucide-react'
import { DIAL_CODES, formatDate } from '../../data/cases.js'
import { DateField, Form, FormFieldError, OutlineButton, PhoneField, SelectField, TextField } from '../ui/FormControls.jsx'
import { asDateInput, asOption } from './formValues.js'
import { Divider, FormActions, Label, NOT_STORED, Segmented, YesNo } from './PersonalInformationForm.jsx'

const grid = 'grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-3'

function useForm(initial) {
  const [form, setForm] = useState(initial)
  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))
  const text = (key) => (event) => set(key)(event.target.value)
  return { form, set, text }
}

const submitWith = (save, values) => () => save.submit(values())

// "+44 7700 900123" -> { code: '+44', number: '7700 900123' }; anything else keeps the default code
function splitPhone(value) {
  const phone = (value ?? '').trim()
  const dial = DIAL_CODES.find(({ code }) => phone.startsWith(code))
  return dial ? { code: dial.code, number: phone.slice(dial.code.length).trim() } : { code: DIAL_CODES[0].code, number: phone }
}

const joinPhone = ({ code, number }) => (number.trim() ? `${code} ${number.trim()}` : '')

/** Phone input bound to a { code, number } value. */
function PhoneInput({ label, id, value, onChange }) {
  return (
    <div>
      <Label htmlFor={id} required>{label}</Label>
      <PhoneField
        id={id}
        required
        code={value.code}
        number={value.number}
        onCodeChange={(code) => onChange({ ...value, code })}
        onNumberChange={(number) => onChange({ ...value, number })}
      />
    </div>
  )
}

function RequiredText({ label, id, ...props }) {
  return (
    <div>
      <Label htmlFor={id} required>{label}</Label>
      <TextField id={id} required {...props} />
    </div>
  )
}

function RequiredSelect({ label, id, ...props }) {
  return (
    <div>
      <Label htmlFor={id} required>{label}</Label>
      <SelectField id={id} required placeholder="" {...props} />
    </div>
  )
}

function RequiredDate({ label, id, ...props }) {
  return (
    <div>
      <Label htmlFor={id} required>{label}</Label>
      <DateField id={id} required {...props} />
    </div>
  )
}

/** Radio buttons drawn as bordered cards. Options are { value, label }; `errorLabel` names them in the error message. */
function RadioCards({ name, legend, errorLabel, required, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-5 text-[15px] text-ink">
        {legend}
        {required && <span aria-hidden="true">*</span>}
      </legend>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {options.map((option) => {
          const checked = value === option.value
          return (
            <label
              key={option.value}
              className={`flex h-[43px] cursor-pointer items-center gap-3 rounded-[2px] border px-3 text-[15px] text-ink transition-colors focus-within:ring-2 focus-within:ring-primary/40 ${
                checked ? 'border-primary bg-neutral-100' : 'border-line bg-white hover:border-primary'
              }`}
            >
              <input type="radio" name={name} required={required} data-label={errorLabel} checked={checked} onChange={() => onChange(option.value)} className="sr-only" />
              <span className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border ${checked ? 'border-primary' : 'border-line'}`}>
                {checked && <span className="h-[18px] w-[18px] rounded-full bg-primary" />}
              </span>
              {option.label}
            </label>
          )
        })}
      </div>
      <FormFieldError id={name} />
    </fieldset>
  )
}

/** Edit form for the "Travel documents details" card. */
export function TravelDocumentsForm({ applicant, lookups, save }) {
  const { form, set, text } = useForm(() => ({
    travel_document_type: applicant.travel_document_type_code ?? '',
    travel_document_number: applicant.travel_document_number ?? '',
    issue_date: asDateInput(applicant.issue_date),
    expiry_date: asDateInput(applicant.expiry_date),
  }))

  return (
    <Form onSubmit={submitWith(save, () => form)}>
      <div className={grid}>
        <RequiredSelect label="Document type" id="td-type" value={form.travel_document_type} onChange={set('travel_document_type')} options={lookups.travelDocumentTypes} />
        <TextField label="Issuing country" id="td-country" disabled placeholder={NOT_STORED} />
        <RequiredText label="Document number" id="td-number" value={form.travel_document_number} onChange={text('travel_document_number')} />
        <RequiredDate label="Date of issue" id="td-issue" value={form.issue_date} onChange={set('issue_date')} />
        <RequiredDate label="Valid until" data-label="Expiry date" id="td-expiry" value={form.expiry_date} onChange={set('expiry_date')} min={form.issue_date || undefined} />
      </div>

      <Divider />
      <FormActions save={save} />
    </Form>
  )
}

/** Edit form for the "Address & contact information" card. */
export function AddressContactForm({ address, fallbackPhone, fallbackWhatsapp, fallbackEmail, lookups, save }) {
  const { form, set, text } = useForm(() => ({
    postcode: address.postcode ?? '',
    address_line1: address.address_line1 ?? '',
    address_line2: address.address_line2 ?? '',
    city: address.city ?? '',
    county: address.county ?? '',
    country_id: asOption(address.country_id),
    mobile: splitPhone(address.mobile_number || fallbackPhone),
    whatsapp: splitPhone(address.whatsapp_number || fallbackWhatsapp),
    email: address.email || fallbackEmail || '',
  }))

  const values = () => {
    const { mobile, whatsapp, ...rest } = form
    return { ...rest, mobile_number: joinPhone(mobile), whatsapp_number: joinPhone(whatsapp) }
  }

  return (
    <Form onSubmit={submitWith(save, values)}>
      <div className={grid}>
        <RequiredText label="Post code" id="ac-postcode" pattern="[A-Za-z0-9 \-]{3,10}" trailing={<Search className="h-[18px] w-[18px]" strokeWidth={1.5} />} value={form.postcode} onChange={text('postcode')} />
        <RequiredText label="Address line 1" id="ac-line1" value={form.address_line1} onChange={text('address_line1')} />
        <TextField label="Address line 2" id="ac-line2" value={form.address_line2} onChange={text('address_line2')} />
        <RequiredText label="City" id="ac-city" value={form.city} onChange={text('city')} />
        <RequiredText label="County" id="ac-county" value={form.county} onChange={text('county')} />
        <RequiredSelect label="Country" id="ac-country" value={form.country_id} onChange={set('country_id')} options={lookups.countries} />
      </div>

      <Divider />

      <div className={grid}>
        <PhoneInput label="Mobile number" id="ac-mobile" value={form.mobile} onChange={set('mobile')} />
        <PhoneInput label="WhatsApp number" id="ac-whatsapp" value={form.whatsapp} onChange={set('whatsapp')} />
        <RequiredText label="Email" id="ac-email" type="email" value={form.email} onChange={text('email')} />
      </div>

      <Divider />
      <FormActions save={save} />
    </Form>
  )
}

/** Edit form for the "Residence permit" card. */
export function ResidencePermitForm({ permit, lookups, save }) {
  const { form, set, text } = useForm(() => ({
    permit_number: permit.permit_number ?? '',
    permit_type_id: asOption(permit.permit_type_id),
    issue_date: asDateInput(permit.issue_date),
    expiry_date: asDateInput(permit.expiry_date),
  }))

  return (
    <Form onSubmit={submitWith(save, () => form)}>
      <div className={grid}>
        <RequiredText label="Residence permit no. / Share code" id="rp-number" value={form.permit_number} onChange={text('permit_number')} />
        <RequiredSelect label="Residence status / Visa type" id="rp-type" value={form.permit_type_id} onChange={set('permit_type_id')} options={lookups.permitTypes} />
        <DateField label="Date of issue" id="rp-issue" value={form.issue_date} onChange={set('issue_date')} />
        <RequiredDate label="Valid until" data-label="Expiry date" id="rp-expiry" value={form.expiry_date} onChange={set('expiry_date')} min={form.issue_date || undefined} />
      </div>

      <Divider />
      <FormActions save={save} />
    </Form>
  )
}

// Which fields each employment status asks for, matched on the status's label.
// occupation_info has one name and one role column: the employer, school or
// trader goes in employer_name, and a freelancer's field of work in job_title.
const OCCUPATION_LAYOUTS = [
  [/employee/i, { name: 'Employer name', role: 'Role / designation', joined: true, earningsFirst: true, address: true, contactLast: true }],
  [/student/i, { name: 'Education establishment name', contactFirst: true, address: true }],
  [/trader|self/i, { name: 'Trader name', contactFirst: true, address: true, earningsLast: true }],
  [/freelanc/i, { role: 'Field of work', earningsFirst: true }],
]

const occupationLayout = (label = '') => OCCUPATION_LAYOUTS.find(([pattern]) => pattern.test(label))?.[1] ?? {}

/** Edit form for the "Current occupation" card; the fields below the status depend on the status chosen. */
export function OccupationForm({ job, currencyCode = 'GBP', lookups, save }) {
  const { form, set, text } = useForm(() => ({
    occupation_category: job.occupation_category ?? '',
    employer_name: job.employer_name ?? '',
    job_title: job.job_title ?? '',
    start_date: asDateInput(job.start_date),
    employer_address: job.employer_address ?? '',
    employer_email: job.employer_email ?? '',
    employer_phone: splitPhone(job.employer_phone),
    gross_annual_earnings: job.gross_annual_earnings ?? '',
  }))
  const label = lookups.occupations.find((o) => o.value === form.occupation_category)?.label
  const layout = occupationLayout(label)
  const hasContact = layout.contactFirst || layout.contactLast
  const hasEarnings = layout.earningsFirst || layout.earningsLast

  // Anything this status doesn't ask for is cleared, not left behind from another status
  const values = () => ({
    occupation_category: form.occupation_category,
    employer_name: layout.name ? form.employer_name : '',
    job_title: layout.role ? form.job_title : '',
    start_date: layout.joined ? form.start_date : '',
    employer_address: layout.address ? form.employer_address : '',
    employer_email: hasContact ? form.employer_email : '',
    employer_phone: hasContact ? joinPhone(form.employer_phone) : '',
    gross_annual_earnings: hasEarnings ? form.gross_annual_earnings : '',
  })

  const earnings = (
    <RequiredText
      label={`Gross annual earnings (${currencyCode})`}
      id="oc-earnings"
      type="number"
      min="0"
      step="0.01"
      value={form.gross_annual_earnings}
      onChange={text('gross_annual_earnings')}
    />
  )
  const email = <RequiredText label="Email" id="oc-email" type="email" value={form.employer_email} onChange={text('employer_email')} />
  const phone = <PhoneInput label="Contact number" id="oc-phone" value={form.employer_phone} onChange={set('employer_phone')} />

  return (
    <Form onSubmit={submitWith(save, values)}>
      <RadioCards
        name="oc-status"
        legend="Select your current employment status"
        errorLabel="Employment status"
        required
        options={lookups.occupations}
        value={form.occupation_category}
        onChange={set('occupation_category')}
      />

      {(layout.name || layout.role) && (
        <>
          <Divider />
          <div className={grid}>
            {layout.name && <RequiredText label={layout.name} id="oc-name" value={form.employer_name} onChange={text('employer_name')} />}
            {layout.role && <RequiredText label={layout.role} id="oc-role" value={form.job_title} onChange={text('job_title')} />}
            {layout.joined && <RequiredDate label="Date of joining" id="oc-start" value={form.start_date} onChange={set('start_date')} />}
            {layout.contactFirst && email}
            {layout.contactFirst && phone}
            {layout.earningsFirst && earnings}
          </div>
        </>
      )}

      {layout.address && (
        <>
          <Divider />
          <RequiredText label="Address" id="oc-address" value={form.employer_address} onChange={text('employer_address')} />
        </>
      )}

      {layout.contactLast && (
        <>
          <Divider />
          <div className={grid}>
            {email}
            {phone}
          </div>
        </>
      )}

      {layout.earningsLast && (
        <>
          <Divider />
          <div className={grid}>{earnings}</div>
        </>
      )}

      <Divider />
      <FormActions save={save} />
    </Form>
  )
}

/** Two date inputs side by side, for a from / to range. */
function DateRange({ id, from, to, onFromChange, onToChange, required }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <DateField id={`${id}-from`} aria-label="From" data-label="Start date" required={required} value={from} onChange={onFromChange} />
      <DateField id={`${id}-to`} aria-label="To" data-label="End date" required={required} value={to} onChange={onToChange} min={from || undefined} />
    </div>
  )
}

function AddButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[46px] w-full max-w-[370px] items-center justify-center gap-2 rounded-full border-2 border-primary bg-white text-[15px] text-primary transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} />
      {children}
    </button>
  )
}

function SectionRule({ children }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <h4 className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{children}</h4>
      <span className="flex-1 border-t border-dotted border-line" aria-hidden="true" />
    </div>
  )
}

const EMPTY_PLAN = { travel_date: '', travel_end_date: '', country_id: '', other_countries: [], notes: '' }
const EMPTY_PREFERENCE = { destination_country_id: '', application_city_id: '' }

const valueByLabel = (options, label) => options.find((o) => o.label === label)?.value ?? ''

/**
 * Edit form for the "Travel information" card. `plans` / `preferences` are the rows currently shown;
 * rows made from the case only have names, so those are matched to the dropdowns' ids here.
 */
export function TravelInformationForm({ visaCode, visaName, plans, preferences, lookups, save }) {
  const { form, set } = useForm(() => ({
    visa_type: visaCode ?? valueByLabel(lookups.visaTypes, visaName),
    plans: (plans.length ? plans : [EMPTY_PLAN]).map((plan) => {
      const [first, ...others] = plan.countries_to_visit?.map(String) ?? (plan.countries_to_visit_names ?? []).map((name) => valueByLabel(lookups.countries, name))
      return {
        travel_date: asDateInput(plan.travel_date),
        travel_end_date: asDateInput(plan.travel_end_date),
        country_id: first ?? '',
        // The dropdown picks one country; any others on the plan are kept
        other_countries: others,
        notes: plan.notes ?? '',
      }
    }),
    preferences: (preferences.length ? preferences : [EMPTY_PREFERENCE]).map((preference) => ({
      destination_country_id: asOption(preference.destination_country_id) || valueByLabel(lookups.countries, preference.destination_country_name),
      application_city_id: asOption(preference.application_city_id) || valueByLabel(lookups.cities, preference.application_city_name),
    })),
  }))
  const updateRow = (list, index, patch) => set(list)(form[list].map((row, i) => (i === index ? { ...row, ...patch } : row)))
  const removeRow = (list, index) => set(list)(form[list].filter((_, i) => i !== index))

  const values = () => ({
    visa_type: form.visa_type,
    travel_dates: form.plans.map(({ country_id, other_countries, ...plan }) => ({
      ...plan,
      countries_to_visit: [country_id, ...other_countries].map(Number),
    })),
    destination_preferences: form.preferences.map((preference) => ({
      destination_country_id: Number(preference.destination_country_id),
      application_city_id: Number(preference.application_city_id),
    })),
  })

  return (
    <Form onSubmit={submitWith(save, values)}>
      <div className="max-w-[380px]">
        <RequiredSelect label="Visa type" id="ti-visa" value={form.visa_type} onChange={set('visa_type')} options={lookups.visaTypes} />
      </div>

      <div className="mt-10">
        <SectionRule>Travel plan</SectionRule>
        <div className="flex flex-col gap-4">
          {form.plans.map((plan, index) => (
            <div key={index} className="relative rounded-[12px] border border-line bg-neutral-50 p-[18px]">
              <div className={grid}>
                <div>
                  <Label htmlFor={`ti-dates-${index}-from`} required>Travel dates</Label>
                  <DateRange
                    id={`ti-dates-${index}`}
                    required
                    from={plan.travel_date}
                    to={plan.travel_end_date}
                    onFromChange={(value) => updateRow('plans', index, { travel_date: value })}
                    onToChange={(value) => updateRow('plans', index, { travel_end_date: value })}
                  />
                </div>
                <RequiredSelect label="Country(ies) to be visited" id={`ti-country-${index}`} value={plan.country_id} onChange={(value) => updateRow('plans', index, { country_id: value })} options={lookups.countries} />
                <TextField label="Notes" id={`ti-notes-${index}`} value={plan.notes} onChange={(event) => updateRow('plans', index, { notes: event.target.value })} />
              </div>
              {form.plans.length > 1 && (
                <button type="button" onClick={() => removeRow('plans', index)} aria-label={`Remove travel plan ${index + 1}`} className="absolute right-3 top-3 text-muted hover:text-alert">
                  <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5">
          <AddButton onClick={() => set('plans')([...form.plans, EMPTY_PLAN])}>Add another travel plan</AddButton>
        </div>
      </div>

      <div className="mt-10">
        <SectionRule>Application preferences</SectionRule>
        <div className="flex flex-col gap-4">
          {form.preferences.map((preference, index) => {
            // Cities of the chosen country, plus the saved one if it's elsewhere
            const cities = lookups.cities.filter((c) => c.countryId === preference.destination_country_id || c.value === preference.application_city_id)
            return (
              <div key={index} className="max-w-[830px] rounded-[12px] border border-line bg-neutral-50 p-[26px]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted">
                    <GripVertical className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    Preference {index + 1}
                  </p>
                  {form.preferences.length > 1 && (
                    <button type="button" onClick={() => removeRow('preferences', index)} aria-label={`Remove preference ${index + 1}`} className="text-muted hover:text-alert">
                      <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
                  <RequiredSelect label="Destination country" id={`ti-dest-${index}`} value={preference.destination_country_id} onChange={(value) => updateRow('preferences', index, { destination_country_id: value, application_city_id: '' })} options={lookups.countries} />
                  <RequiredSelect label="Application city" id={`ti-city-${index}`} value={preference.application_city_id} onChange={(value) => updateRow('preferences', index, { application_city_id: value })} options={cities} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-5">
          <AddButton onClick={() => set('preferences')([...form.preferences, EMPTY_PREFERENCE])}>Add another application preference</AddButton>
        </div>
      </div>

      <Divider />
      <FormActions save={save} />
    </Form>
  )
}

/** Edit form for the "Previous visa" card; the visa details only apply when the answer is Yes. */
export function PreviousVisaForm({ visa, lookups, save }) {
  const { form, set, text } = useForm(() => ({
    had_schengen_visa_last_59_months: Boolean(Number(visa.had_schengen_visa_last_59_months)),
    previous_biometrics_date: asDateInput(visa.previous_biometrics_date),
    visa_sticker_number: visa.visa_sticker_number ?? '',
    visa_valid_from: asDateInput(visa.visa_valid_from),
    visa_valid_to: asDateInput(visa.visa_valid_to),
    issuing_country_id: asOption(visa.issuing_country_id),
  }))

  return (
    <Form onSubmit={submitWith(save, () => ({ ...form, had_schengen_visa_last_59_months: form.had_schengen_visa_last_59_months ? 1 : 0 }))}>
      <fieldset>
        <legend className="mb-5 text-[15px] text-ink">Have you obtained a Schengen visa in past 59 Months?</legend>
        <YesNo name="pv-schengen" required errorLabel="An answer" value={form.had_schengen_visa_last_59_months} onChange={set('had_schengen_visa_last_59_months')} />
      </fieldset>

      {form.had_schengen_visa_last_59_months && (
        <>
          <Divider />
          <div className={grid}>
            <RequiredDate label="Previous biometric date" id="pv-biometrics" value={form.previous_biometrics_date} onChange={set('previous_biometrics_date')} />
            <RequiredText label="Visa sticker number" id="pv-sticker" value={form.visa_sticker_number} onChange={text('visa_sticker_number')} />
            <div>
              <Label htmlFor="pv-dates-from" required>Visa dates</Label>
              <DateRange id="pv-dates" required from={form.visa_valid_from} to={form.visa_valid_to} onFromChange={set('visa_valid_from')} onToChange={set('visa_valid_to')} />
            </div>
            <RequiredSelect label="Issuing country" id="pv-country" value={form.issuing_country_id} onChange={set('issuing_country_id')} options={lookups.countries} />
          </div>
        </>
      )}

      <Divider />
      <FormActions save={save} />
    </Form>
  )
}

const SPONSOR_GENDERS = ['Male', 'Female', 'Other'].map((gender) => ({ value: gender, label: gender }))

/** Edit form for the "Financing of stay" card; sponsor details apply to everyone but the applicant. */
export function FinancingForm({ funding, lookups, save }) {
  const { form, set, text } = useForm(() => ({
    funding_source: funding.funding_source_code ?? '',
    sponsor_first_name: funding.sponsor_first_name ?? '',
    sponsor_surname: funding.sponsor_surname ?? '',
    sponsor_gender: funding.sponsor_gender ?? '',
    sponsor_address: funding.sponsor_address ?? '',
    sponsor_country_id: asOption(funding.sponsor_country_id),
    sponsor_contact_number: splitPhone(funding.sponsor_contact_number),
    sponsor_email: funding.sponsor_email ?? '',
    sponsor_occupation_category: funding.sponsor_occupation_category ?? '',
  }))
  const source = lookups.fundingSources.find((f) => f.value === form.funding_source)
  const hasSponsor = Boolean(source) && !/applicant/i.test(source.label)

  const values = () =>
    hasSponsor
      ? { ...form, sponsor_contact_number: joinPhone(form.sponsor_contact_number) }
      : { funding_source: form.funding_source }

  return (
    <Form onSubmit={submitWith(save, values)}>
      <RadioCards name="fs-source" legend="Who will fund the trip?" errorLabel="Funding source" required options={lookups.fundingSources} value={form.funding_source} onChange={set('funding_source')} />

      {hasSponsor && (
        <>
          <Divider />
          <div className={grid}>
            <RequiredText label="First name" id="fs-first" value={form.sponsor_first_name} onChange={text('sponsor_first_name')} />
            <TextField label="Surname" id="fs-surname" value={form.sponsor_surname} onChange={text('sponsor_surname')} />
            <div>
              <Label required>Gender</Label>
              <Segmented id="fs-gender" required ariaLabel="Gender" options={SPONSOR_GENDERS} value={form.sponsor_gender} onChange={set('sponsor_gender')} />
            </div>
          </div>

          <Divider />
          <div className={grid}>
            <div className="md:col-span-2">
              <RequiredText label="Address" id="fs-address" value={form.sponsor_address} onChange={text('sponsor_address')} />
            </div>
            <RequiredSelect label="Country" id="fs-country" value={form.sponsor_country_id} onChange={set('sponsor_country_id')} options={lookups.countries} />
          </div>

          <Divider />
          <div className={grid}>
            <PhoneInput label="Mobile number" id="fs-phone" value={form.sponsor_contact_number} onChange={set('sponsor_contact_number')} />
            <RequiredText label="Email" id="fs-email" type="email" value={form.sponsor_email} onChange={text('sponsor_email')} />
            <SelectField label="Current profession" id="fs-profession" value={form.sponsor_occupation_category} onChange={set('sponsor_occupation_category')} options={lookups.occupations} placeholder="" />
          </div>
        </>
      )}

      <Divider />
      <FormActions save={save} />
    </Form>
  )
}

/** Edit form for the "Additional information" card. */
export function AdditionalInformationForm({ joinsEuFamilyMember, otherNotes, save }) {
  const { form, set, text } = useForm(() => ({
    joins_eu_family_member: joinsEuFamilyMember == null ? null : Boolean(Number(joinsEuFamilyMember)),
    notes: otherNotes ?? '',
  }))

  return (
    <Form onSubmit={submitWith(save, () => ({ joins_eu_family_member: form.joins_eu_family_member ? 1 : 0, notes: form.notes }))}>
      <fieldset>
        <legend className="mb-5 max-w-3xl text-[15px] text-ink">
          Do you join or travel with a family member from an EU country, the EEA, the Swiss Confederation, or a family member who is a UK national beneficiary of the withdrawal agreement?
          <span aria-hidden="true">*</span>
        </legend>
        <YesNo name="ai-eu-family" required errorLabel="An answer" value={form.joins_eu_family_member} onChange={set('joins_eu_family_member')} />
      </fieldset>

      <Divider />

      <div>
        <Label htmlFor="ai-notes">Other notes</Label>
        <textarea
          id="ai-notes"
          rows={4}
          value={form.notes}
          onChange={text('notes')}
          className="w-full rounded-[2px] border border-line bg-white px-3.5 py-3 text-[15px] text-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <Divider />
      <FormActions save={save} />
    </Form>
  )
}

const FILE_ACCEPT = '.pdf,.jpg,.jpeg,.png'
const MAX_FILE_BYTES = 10 * 1024 * 1024

const fileSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

// A travel document's name and type come from the contact: only its file can be replaced
const isTravelDocument = (row) => row.document_key?.startsWith('travel-document-')

function LockedField({ label, value }) {
  return (
    <div>
      <Label required>{label}</Label>
      <div className="flex h-11 w-full items-center justify-between rounded-[2px] border border-line bg-neutral-50 px-3.5 text-[15px] text-muted">
        <span className="truncate">{value || '-'}</span>
        <Lock className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
      </div>
    </div>
  )
}

/**
 * Edit form for the "Documents repository" card. Nothing is changed until Save, which hands
 * `save.submit` the keys to delete plus every row left, each with a `file` if one was chosen.
 */
export function DocumentsForm({ documents, lookups, onPreview, save }) {
  const [rows, setRows] = useState(() => documents.map((doc) => ({ ...doc, document_type_id: asOption(doc.document_type_id), file: null })))
  const [deleted, setDeleted] = useState([])
  const [fileError, setFileError] = useState('')
  const update = (index, patch) => setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  const pickFile = (index, file) => {
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setFileError(`${file.name} is larger than 10 MB.`)
      return
    }
    setFileError('')
    update(index, { file, document_name: rows[index].document_name || file.name.replace(/\.[^.]+$/, '') })
  }

  const remove = (index) => {
    const key = rows[index].document_key
    if (key) setDeleted((prev) => [...prev, key])
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Form onSubmit={submitWith(save, () => ({ deleted, rows, original: documents }))} className="-m-6">
      {rows.map((row, index) => {
        const fixed = isTravelDocument(row)
        return (
          <div key={row.document_key ?? `new-${index}`} className="border-b border-line p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="w-full max-w-xs">
                {fixed ? (
                  <LockedField label="Document name" value={row.document_name} />
                ) : (
                  <RequiredText label="Document name" id={`dr-name-${index}`} value={row.document_name ?? ''} onChange={(event) => update(index, { document_name: event.target.value })} />
                )}
              </div>
              {!fixed && (
                <button type="button" onClick={() => remove(index)} className="mt-1 flex items-center gap-1.5 text-sm text-alert hover:underline">
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  Delete
                </button>
              )}
            </div>

            <hr className="my-6 border-line-soft" />

            <div className={grid}>
              {fixed ? (
                <LockedField label="Document type" value={row.document_category} />
              ) : (
                <RequiredSelect label="Document type" id={`dr-type-${index}`} value={row.document_type_id} onChange={(value) => update(index, { document_type_id: value })} options={lookups.documentTypes} />
              )}
              <LockedField label="Uploader" value={row.uploader || 'You'} />
              <LockedField label="Upload date" value={formatDate((row.uploaded_at ?? new Date().toISOString()).slice(0, 10))} />
            </div>

            <hr className="my-6 border-line-soft" />

            {row.document_key || row.file ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3 text-sm text-body">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {row.file ? row.file.name.split('.').pop().toUpperCase() : 'FILE'}
                  </span>
                  <span className="truncate">{row.file?.name ?? row.document_name}</span>
                  {row.file && <span className="text-muted">• {fileSize(row.file.size)}</span>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <label className="inline-flex h-9 cursor-pointer items-center rounded-[2px] bg-primary px-3.5 text-[13px] text-white transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:bg-primary/90">
                    Replace
                    <input type="file" accept={FILE_ACCEPT} className="sr-only" onChange={(event) => pickFile(index, event.target.files?.[0])} />
                  </label>
                  {row.document_key && !row.file && (
                    <OutlineButton type="button" onClick={() => onPreview(row.document_key)} className="h-9 border-ink px-3.5 text-[13px] text-ink">
                      Preview
                    </OutlineButton>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 rounded-[2px] border border-dashed border-line bg-neutral-50 px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200/70 text-muted">
                    <Upload className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="text-[13px] text-ink">Click to upload</p>
                    <p className="text-xs text-muted">Accepted file types: PDF, JPG, PNG; maximum file size: 10 MB.</p>
                  </div>
                </div>
                <label className="inline-flex h-9 cursor-pointer items-center rounded-[2px] border border-ink bg-white px-3.5 text-[13px] text-ink transition-colors hover:bg-primary/5">
                  Choose file
                  <input id={`dr-file-${index}`} type="file" accept={FILE_ACCEPT} required data-label="Document file" className="sr-only" onChange={(event) => pickFile(index, event.target.files?.[0])} />
                </label>
              </div>
            )}
            <FormFieldError id={`dr-file-${index}`} />
          </div>
        )
      })}

      <div className="border-b border-line p-6">
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, { document_key: null, document_name: '', document_type_id: '', uploader: '', uploaded_at: null, file: null }])}
          className="inline-flex h-11 items-center gap-2 rounded-[2px] border border-primary bg-white px-5 text-[15px] text-primary transition-colors hover:bg-primary/5"
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Upload new document
        </button>
      </div>

      <div className="p-6">
        {fileError && (
          <p role="alert" className="mb-4 text-sm text-alert">
            {fileError}
          </p>
        )}
        <FormActions save={save} />
      </div>
    </Form>
  )
}
