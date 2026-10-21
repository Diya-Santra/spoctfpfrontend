// Shared constants and formatting helpers. The filter-drawer lists (CITIES, CSRS, …) are only
// fallbacks; pages pass the real values from the backend.

export const STAGES = [
  { id: 'created', label: 'Application created', tone: 'created' },
  { id: 'review', label: 'Information for review', tone: 'review' },
  { id: 'vac', label: 'VAC account creation', tone: 'vac' },
  { id: 'appointment', label: 'Appointment monitoring', tone: 'appointment' },
  { id: 'submitted', label: 'Documents submitted', tone: 'submitted' },
  { id: 'decision', label: 'Visa decision', tone: 'decision' },
]

export const VISA_CATEGORIES = ['Work', 'Tourist', 'Travel']
export const CITIES = ['London', 'Manchester', 'Birmingham', 'Edinburgh']
export const COUNTRIES = ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Belgium', 'Poland', 'Croatia']
export const CSRS = ['Tanvi Joshi', 'Rohan Mehta', 'Priya Nair', 'Neha Sharma', 'Ananya Gupta', 'Siddharth Rao']
export const TEAM_LEADS = ['Akanksha Sharma', 'Kunal Verma']

// "Add new case" dropdowns come from the backend — see lib/lookups.js
export const DIAL_CODES = [
  { code: '+44', flag: '🇬🇧' },
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+971', flag: '🇦🇪' },
  { code: '+61', flag: '🇦🇺' },
]

// Case states shown in the "Active cases" table
export const CASE_STATES = [
  { id: 'created', label: 'Application created', tone: 'created' },
  { id: 'review', label: 'Information for review', tone: 'review' },
  { id: 'vac', label: 'VAC account creation', tone: 'vac' },
  { id: 'appointment', label: 'Appointment monitoring', tone: 'appointment' },
  { id: 'booked', label: 'Appointment booked', tone: 'booked' },
  { id: 'documents', label: 'Documents in review', tone: 'submitted' },
  { id: 'customerReview', label: 'Customer document review', tone: 'customer' },
]

// "Add new case" → Details step. Dropdown fields hold the backend id as a string.
export const EMPTY_LEAD = {
  fullName: '',
  phoneCode: '+44',
  phone: '',
  countryId: '',
  cityId: '',
  travelDate: '',
  visaCategoryId: '',
  servicePackId: '',
  addOnPackId: '', // optional
  csrId: '',
  teamLeadId: '',
}

export const EMPTY_APPLICANT = {
  firstName: '',
  surname: '',
  genderId: '',
  dateOfBirth: '',
  documentType: '', // travel document type code, e.g. ORDINARY_PASSPORT
  documentNumber: '',
  issueDate: '',
  expiryDate: '',
  nationalityId: '', // country id
  placeOfBirthId: '', // city id
  phoneCode: '+44',
  phone: '',
  document: null,
}

export const EMPTY_PAYMENT = {
  amount: '',
  bankAccountId: '',
  paidAt: '', // datetime-local value, in the user's timezone
  reference: '',
}

/** formatMoney(10000, 'EUR') -> "€10,000.00" */
export function formatMoney(amount, currencyCode = 'GBP') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currencyCode }).format(amount)
}

/** currencySymbol('GBP') -> "£" */
export function currencySymbol(currencyCode = 'GBP') {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currencyCode })
    .formatToParts(0)
    .find((part) => part.type === 'currency').value
}

export const EMPTY_FILTERS = {
  visaCategories: [],
  city: '',
  country: '',
  csr: '',
  teamLead: '',
  travelDate: '',
}

const SINGLE_FILTER_KEYS = ['city', 'country', 'csr', 'teamLead', 'travelDate']

export function countActiveFilters(filters) {
  return filters.visaCategories.length + SINGLE_FILTER_KEYS.filter((key) => filters[key]).length
}

/** True when a case matches the search term (applicant name or visa category). */
export function matchesSearch(item, search) {
  const term = search.trim().toLowerCase()
  return !term || item.name.toLowerCase().includes(term) || item.visa.toLowerCase().includes(term)
}

/** True when a case matches every filter set in the filter drawer. */
export function matchesFilters(item, filters) {
  return (
    (!filters.visaCategories.length || filters.visaCategories.includes(item.visa)) &&
    SINGLE_FILTER_KEYS.every((key) => !filters[key] || item[key] === filters[key])
  )
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** "24 May 2026 · 14:00" from a datetime-local value (local time) */
export function formatDateTime(local) {
  if (!local) return ''
  const date = new Date(local)
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${time}`
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** "2 mins ago", "1 hour ago", "3 days ago" */
export function formatRelativeTime(iso, now = Date.now()) {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000))
  const plural = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'} ago`
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return plural(minutes, 'min')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return plural(hours, 'hour')
  return plural(Math.floor(hours / 24), 'day')
}
