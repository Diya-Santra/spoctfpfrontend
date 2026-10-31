import { useRef, useState } from 'react'
import { ChevronDown, Check, Calendar } from 'lucide-react'
import { DIAL_CODES } from '../../data/cases.js'
import { FormErrorsContext, useFieldError, validateForm } from '../../lib/formErrors.js'

const fieldBase = 'h-11 w-full rounded-[2px] border px-3.5 text-[15px] text-body outline-none transition-colors focus:ring-1'
const fieldTone = (error) =>
  error ? 'border-danger bg-danger-bg focus:border-danger focus:ring-danger' : 'border-line bg-white focus:border-primary focus:ring-primary'
const wrapperTone = (error) =>
  error
    ? 'border-danger bg-danger-bg focus-within:ring-1 focus-within:ring-danger'
    : 'border-line bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'

const errorProps = (id, error) => (error ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {})

/** The message under a field in its error state. */
export function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
      {message}
    </p>
  )
}

/** Shows a field's error from the surrounding <Form>, for controls without their own (e.g. radios). */
export function FormFieldError({ id }) {
  return <FieldError id={id} message={useFieldError(id)} />
}

/**
 * <form> whose required / format checks show as error states on the fields instead of the
 * browser's popups. `onSubmit` only runs once every field is valid. An error clears as its
 * field is changed.
 */
export function Form({ onSubmit, children, ...props }) {
  const [errors, setErrors] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()
    const { errors: found, first } = validateForm(event.currentTarget)
    setErrors(found)
    if (first) first.focus()
    else onSubmit(event)
  }

  const clearError = ({ target }) => {
    const key = target.id || target.name
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit} onInput={clearError} onChange={clearError} {...props}>
      <FormErrorsContext.Provider value={errors}>{children}</FormErrorsContext.Provider>
    </form>
  )
}

// Options are plain strings, or { value, label } when the shown text differs from the value
const optionValue = (option) => (typeof option === 'string' ? option : option.value)
const optionLabel = (option) => (typeof option === 'string' ? option : option.label)

/** Native select styled to match the design (placeholder shown when value is empty). */
export function SelectField({ label, value, onChange, options, placeholder, id, required, disabled }) {
  const error = useFieldError(id)

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          required={required}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldBase} ${fieldTone(error)} cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed disabled:bg-neutral-50 ${value ? 'text-body' : 'text-body/90'}`}
          {...errorProps(id, error)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={optionValue(option)} value={optionValue(option)}>
              {optionLabel(option)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
      <FieldError id={id} message={error} />
    </div>
  )
}

/** `trailing` is an icon drawn inside the right edge of the input. */
export function TextField({ label, id, className = '', trailing, ...props }) {
  const error = useFieldError(id)

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={`${fieldBase} ${fieldTone(error)} placeholder:text-body/90 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:placeholder:text-muted ${trailing ? 'pr-10' : ''} ${className}`}
          {...errorProps(id, error)}
          {...props}
        />
        {trailing && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">{trailing}</span>}
      </div>
      <FieldError id={id} message={error} />
    </div>
  )
}

function FieldLabel({ id, children }) {
  return (
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
      {children}
    </label>
  )
}

/** Date input with our own calendar button in place of the native indicator. */
export function DateField({ label, id, value, onChange, ...props }) {
  const inputRef = useRef(null)
  const error = useFieldError(id)

  return (
    <div>
      {label && <FieldLabel id={id}>{label}</FieldLabel>}
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldBase} ${fieldTone(error)} pr-10 ${value ? 'text-body' : 'text-muted'} [&::-webkit-calendar-picker-indicator]:hidden`}
          {...errorProps(id, error)}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Open calendar"
          onClick={() => inputRef.current?.showPicker?.()}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
        >
          <Calendar className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </div>
      <FieldError id={id} message={error} />
    </div>
  )
}

/** Dial-code select (flag + code) joined to a phone number input. */
export function PhoneField({ label, id, code, onCodeChange, number, onNumberChange, required }) {
  const error = useFieldError(id)

  return (
    <div>
      {label && <FieldLabel id={id}>{label}</FieldLabel>}
      <div className={`flex h-11 rounded-[2px] border transition-colors ${error ? 'border-line' : wrapperTone(false)}`}>
        <span className="relative flex shrink-0 items-center border-r border-line bg-white">
          <select
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            aria-label="Country dialling code"
            className="h-full cursor-pointer appearance-none bg-transparent pl-3 pr-8 text-[15px] text-ink outline-none"
          >
            {DIAL_CODES.map((dial) => (
              <option key={dial.code} value={dial.code}>
                {dial.flag} {dial.code}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-muted" aria-hidden="true" />
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          required={required}
          value={number}
          onChange={(event) => onNumberChange(event.target.value)}
          pattern="[0-9 ]{6,15}"
          title="6–15 digits"
          className={`min-w-0 flex-1 px-3.5 text-[15px] text-body outline-none ${error ? 'bg-danger-bg ring-1 ring-inset ring-danger' : 'bg-transparent'}`}
          {...errorProps(id, error)}
        />
      </div>
      <FieldError id={id} message={error} />
    </div>
  )
}

/** Amount input with a fixed currency symbol on the left. */
export function CurrencyField({ label, id, symbol = '£', value, onChange, ...props }) {
  const error = useFieldError(id)

  return (
    <div>
      {label && <FieldLabel id={id}>{label}</FieldLabel>}
      <div className={`flex h-11 items-center rounded-[2px] border transition-colors ${wrapperTone(error)}`}>
        <span className="pl-3.5 text-[15px] font-medium text-ink" aria-hidden="true">
          {symbol}
        </span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-[15px] text-body outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...errorProps(id, error)}
          {...props}
        />
      </div>
      <FieldError id={id} message={error} />
    </div>
  )
}

/** Square checkbox with navy fill when checked. */
export function Checkbox({ label, checked, onChange }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[15px] text-body">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 ${
          checked ? 'border-primary bg-primary' : 'border-line bg-white'
        }`}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      {label}
    </label>
  )
}

export function PrimaryButton({ className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[2px] bg-primary px-6 text-[15px] font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function OutlineButton({ className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[2px] border border-primary bg-white px-6 text-[15px] font-medium text-primary transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
