import { useState } from 'react'
import { flushSync } from 'react-dom'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { FormCard } from './FormSection.jsx'
import UploadField from './UploadField.jsx'
import { DateField, PhoneField, SelectField, TextField } from '../ui/FormControls.jsx'

const iconButtonBase = 'flex h-8 w-8 items-center justify-center rounded-[2px] transition-colors hover:bg-neutral-200/60'
const iconButton = `${iconButtonBase} text-body hover:text-ink`
// The chevron for the state the card is already in is shown faded
const idleIconButton = `${iconButtonBase} text-muted/60 hover:text-ink`

/** `lookups` holds the dropdown options; `documentError` is shown under the upload. */
function ApplicantCard({ applicant, index, total, lookups, documentError, onChange, onRemove }) {
  const [collapsed, setCollapsed] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const set = (key) => (value) => onChange({ ...applicant, [key]: value })
  const fieldId = (name) => `applicant-${applicant.key}-${name}`

  const bodyId = fieldId('body')
  const fullName = [applicant.firstName, applicant.surname].filter(Boolean).join(' ')

  return (
    <FormCard
      collapsed={collapsed}
      bodyId={bodyId}
      // A minimized card can't show its validation bubble — expand it synchronously
      // so the browser can focus the invalid field on submit.
      onInvalidCapture={() => collapsed && flushSync(() => setCollapsed(false))}
      header={
        <>
          <h4 className="text-[13px] font-medium uppercase tracking-[0.12em] text-body">
            Applicant {index + 1} of {total}
            {collapsed && fullName && <span className="ml-2 normal-case tracking-normal text-muted">· {fullName}</span>}
          </h4>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className={collapsed ? iconButton : idleIconButton}
              aria-label="Expand applicant"
              aria-controls={bodyId}
              aria-expanded={!collapsed}
            >
              <ChevronDown className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className={collapsed ? idleIconButton : iconButton}
              aria-label="Minimize applicant"
              aria-controls={bodyId}
              aria-expanded={!collapsed}
            >
              <ChevronUp className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            <span className="mx-2 h-5 w-px bg-line" aria-hidden="true" />
            <button
              type="button"
              onClick={onRemove}
              className={`${iconButtonBase} text-alert`}
              aria-label={`Remove applicant ${index + 1}`}
            >
              <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          </div>
        </>
      }
    >
      <TextField id={fieldId('first')} label="First name*" required value={applicant.firstName} onChange={(e) => set('firstName')(e.target.value)} />
      <TextField id={fieldId('surname')} label="Surname*" required value={applicant.surname} onChange={(e) => set('surname')(e.target.value)} />
      <SelectField id={fieldId('sex')} label="Sex*" required value={applicant.genderId} onChange={set('genderId')} options={lookups.genders} placeholder="" />

      <DateField id={fieldId('dob')} label="Date of birth*" required max={today} value={applicant.dateOfBirth} onChange={set('dateOfBirth')} />
      <SelectField id={fieldId('doc-type')} label="Travel document type*" required value={applicant.documentType} onChange={set('documentType')} options={lookups.documentTypes} placeholder="" />
      <TextField id={fieldId('doc-number')} label="Travel document number*" required value={applicant.documentNumber} onChange={(e) => set('documentNumber')(e.target.value)} />

      <DateField id={fieldId('issue')} label="Issue date*" required max={today} value={applicant.issueDate} onChange={set('issueDate')} />
      <DateField id={fieldId('expiry')} label="Expiry date*" required min={applicant.issueDate || today} value={applicant.expiryDate} onChange={set('expiryDate')} />
      <SelectField id={fieldId('nationality')} label="Nationality*" required value={applicant.nationalityId} onChange={set('nationalityId')} options={lookups.countries} placeholder="" />

      <SelectField id={fieldId('birthplace')} label="Place of birth*" required value={applicant.placeOfBirthId} onChange={set('placeOfBirthId')} options={lookups.birthPlaces} placeholder="" />
      <PhoneField
        id={fieldId('phone')}
        label="Phone number*"
        required
        code={applicant.phoneCode}
        onCodeChange={set('phoneCode')}
        number={applicant.phone}
        onNumberChange={set('phone')}
      />
      <div className="hidden md:block" aria-hidden="true" />

      <UploadField label="Upload travel document" file={applicant.document} onChange={set('document')} error={documentError} />
    </FormCard>
  )
}

export default ApplicantCard
