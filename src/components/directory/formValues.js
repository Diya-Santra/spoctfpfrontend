export const asDateInput = (value) => (/^\d{4}-\d{2}-\d{2}/.test(value ?? '') ? value.slice(0, 10) : '')

/** Database id or code -> what a <select> holds. */
export const asOption = (value) => (value == null ? '' : String(value))
