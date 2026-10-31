import { createContext, useContext } from 'react'

/** Errors of the surrounding <Form>, keyed by input id (or name, for radio groups). */
export const FormErrorsContext = createContext({})

export const useFieldError = (id) => useContext(FormErrorsContext)[id] ?? ''

// What the message calls a field: its `data-label`, else the text of its label.
// The design words these three the same way whatever the field's own heading says.
function fieldName(input) {
  if (input.type === 'tel') return 'Phone number'
  if (input.type === 'email') return 'Email address'
  const label = input.dataset.label ?? input.form.querySelector(`label[for="${input.id}"]`)?.textContent ?? 'This field'
  const name = label.replace(/\*/g, '').trim()
  return /^post ?code$/i.test(name) ? 'Postcode' : name
}

const lowerFirst = (text) => text[0].toLowerCase() + text.slice(1)

function messageFor(input) {
  const name = fieldName(input)
  return input.validity.valueMissing ? `${name} is required` : `Please enter a valid ${lowerFirst(name)}`
}

/** Runs the browser's own checks on every field. Returns `{ errors, first }`, in page order. */
export function validateForm(form) {
  const errors = {}
  let first = null

  for (const input of form.elements) {
    if (!input.willValidate || input.checkValidity()) continue
    const key = input.id || input.name
    if (errors[key]) continue
    errors[key] = messageFor(input)
    first ??= input
  }
  return { errors, first }
}
