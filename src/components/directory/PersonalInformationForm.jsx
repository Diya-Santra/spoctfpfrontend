import { useState } from 'react'
import { DateField, Form, FormFieldError, OutlineButton, PrimaryButton, SelectField, TextField } from '../ui/FormControls.jsx'
import { asDateInput, asOption } from './formValues.js'

/** Marks a field that has no database column yet, so nothing typed into it could be saved. */
export const NOT_STORED = 'Not available yet'

const Required = () => <span aria-hidden="true">*</span>

export function Divider() {
  return <hr className="my-8 border-line-soft" />
}

export function Label({ htmlFor, required, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {children}
      {required && <Required />}
    </label>
  )
}

/** Yes / No radio pair. With `required`, `errorLabel` names it in the error message. */
export function YesNo({ name, value, onChange, required, errorLabel }) {
  return (
    <>
      <div className="flex items-center gap-10">
        {[
          ['Yes', true],
          ['No', false],
        ].map(([text, optionValue]) => {
          const checked = value === optionValue
          return (
            <label key={text} className="inline-flex cursor-pointer items-center gap-2.5 text-[15px] text-ink">
              <input
                type="radio"
                name={name}
                required={required}
                data-label={errorLabel}
                checked={checked}
                onChange={() => onChange(optionValue)}
                className="peer sr-only"
              />
              <span
                className={`flex h-[28px] w-[28px] items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 ${
                  checked ? 'border-primary' : 'border-line'
                }`}
              >
                {checked && <span className="h-[18px] w-[18px] rounded-full bg-primary" />}
              </span>
              {text}
            </label>
          )
        })}
      </div>
      <FormFieldError id={name} />
    </>
  )
}

/** Connected buttons, e.g. Male / Female / Other. Options are { value, label }. */
export function Segmented({ id, options, value, onChange, ariaLabel, required }) {
  return (
    <>
      {/* The buttons aren't form fields, so this carries the required check */}
      <input id={id} required={required} value={value ?? ''} readOnly tabIndex={-1} aria-hidden="true" data-label={ariaLabel} className="sr-only" />
      <div className="flex h-11 w-full overflow-hidden rounded-[2px] border border-line" role="radiogroup" aria-label={ariaLabel}>
        {options.map((option) => {
          const selected = String(value ?? '').toLowerCase() === option.value.toLowerCase()
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={`flex-1 text-[15px] transition-colors ${
                selected ? 'bg-primary text-white' : 'bg-white text-ink hover:bg-primary/5'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {/* Its error clears on picking: the hidden field gets no input event */}
      {!value && <FormFieldError id={id} />}
    </>
  )
}

export function FormActions({ save }) {
  return (
    <div className="flex gap-3">
      <PrimaryButton type="submit" disabled={save.saving} className="h-11 disabled:cursor-not-allowed disabled:opacity-60">
        {save.saving ? 'Saving…' : 'Save changes'}
      </PrimaryButton>
      <OutlineButton type="button" onClick={save.cancel} disabled={save.saving} className="h-11 border-ink text-ink">
        Cancel
      </OutlineButton>
    </div>
  )
}

/** Edit form for the "Personal information" card. */
export default function PersonalInformationForm({ applicant, lookups, save }) {
  const [form, setForm] = useState(() => ({
    first_name: applicant.first_name ?? '',
    surname: applicant.surname ?? '',
    had_different_name: Boolean(Number(applicant.had_different_name)),
    previous_name: applicant.previous_name ?? '',
    date_of_birth: asDateInput(applicant.date_of_birth),
    place_of_birth_id: asOption(applicant.place_of_birth_id),
    country_of_birth_id: asOption(applicant.country_of_birth_id),
    nationality_id: asOption(applicant.nationality_id),
    gender_id: asOption(applicant.gender_id),
    marital_status_id: asOption(applicant.marital_status_id),
  }))
  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))
  const text = (key) => (event) => set(key)(event.target.value)

  // Place of birth is a city, so it is chosen within the country of birth
  const birthPlaces = lookups.cities.filter((c) => c.countryId === form.country_of_birth_id)
  const setCountryOfBirth = (value) => setForm((prev) => ({ ...prev, country_of_birth_id: value, place_of_birth_id: '' }))

  const handleSubmit = () => {
    save.submit({ ...form, had_different_name: form.had_different_name ? 1 : 0 })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-3">
        <div>
          <Label htmlFor="pi-first-name" required>First name</Label>
          <TextField id="pi-first-name" required value={form.first_name} onChange={text('first_name')} />
        </div>
        <div>
          <Label htmlFor="pi-surname" required>Surname</Label>
          <TextField id="pi-surname" required value={form.surname} onChange={text('surname')} />
        </div>
        <TextField label="Surname at birth" id="pi-surname-birth" disabled placeholder={NOT_STORED} />
        <TextField label="Additional name" id="pi-additional-name" disabled placeholder={NOT_STORED} />
      </div>

      <Divider />

      <fieldset>
        <legend className="mb-5 text-[15px] text-ink">
          Have you ever been known by a different name?
          <Required />
        </legend>
        <YesNo name="pi-different-name" required errorLabel="An answer" value={form.had_different_name} onChange={set('had_different_name')} />
        {form.had_different_name && (
          <div className="mt-5 max-w-sm">
            <Label htmlFor="pi-previous-name" required>Previous name</Label>
            <TextField id="pi-previous-name" required value={form.previous_name} onChange={text('previous_name')} />
          </div>
        )}
      </fieldset>

      <Divider />

      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-3">
        <div>
          <Label htmlFor="pi-dob" required>Date of birth</Label>
          <DateField id="pi-dob" required value={form.date_of_birth} onChange={set('date_of_birth')} />
        </div>
        <div>
          <Label htmlFor="pi-cob" required>Country of birth</Label>
          <SelectField id="pi-cob" required value={form.country_of_birth_id} onChange={setCountryOfBirth} options={lookups.countries} placeholder="" />
        </div>
        <div>
          <Label htmlFor="pi-pob" required>Place of birth</Label>
          <SelectField id="pi-pob" required value={form.place_of_birth_id} onChange={set('place_of_birth_id')} options={birthPlaces} placeholder="" />
        </div>
        <div>
          <Label htmlFor="pi-nationality" required>Current nationality</Label>
          <SelectField id="pi-nationality" required value={form.nationality_id} onChange={set('nationality_id')} options={lookups.countries} placeholder="" />
        </div>
        <TextField label="Nationality at birth" id="pi-nationality-birth" disabled placeholder={NOT_STORED} />
        <TextField label="Other nationalities" id="pi-other-nationalities" disabled placeholder={NOT_STORED} />
      </div>

      <Divider />

      <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-3">
        <div>
          <Label required>Gender</Label>
          <Segmented id="pi-gender" required ariaLabel="Gender" options={lookups.genders} value={form.gender_id} onChange={set('gender_id')} />
        </div>
        <div>
          <Label htmlFor="pi-marital" required>Marital status</Label>
          <SelectField id="pi-marital" required value={form.marital_status_id} onChange={set('marital_status_id')} options={lookups.maritalStatuses} placeholder="" />
        </div>
      </div>

      <Divider />
      <FormActions save={save} />
    </Form>
  )
}
