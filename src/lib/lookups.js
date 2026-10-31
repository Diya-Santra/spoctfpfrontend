import { useEffect, useState } from 'react'
import { apiGet } from './api.js'

// Dropdown data for the "Add new case" wizard. Fetched once per page load and
// shared by all three steps. Every option is { value, label } with the id as a
// string, because that is what a <select> hands back.

const option = (id, label, extra) => ({ value: String(id), label, ...extra })
const fullName = (user) => [user.first_name, user.last_name].filter(Boolean).join(' ')

async function fetchLookups() {
  const [countries, cities, visaCategories, servicePacks, addOnPacks, csrs, teamLeads, genders, documentTypes, bankAccounts] =
    await Promise.all([
      apiGet('/api/countries'),
      apiGet('/api/cities'),
      apiGet('/api/visa-categories'),
      apiGet('/api/service-packs'),
      apiGet('/api/add-on-packs'),
      apiGet('/api/users', { role: 'CSR' }),
      apiGet('/api/users', { role: 'TeamLead' }),
      apiGet('/api/genders'),
      apiGet('/api/travel-document-types'),
      apiGet('/api/bank-accounts'),
    ])

  const countryName = new Map(countries.map((c) => [c.country_id, c.name]))

  return {
    countries: countries.map((c) => option(c.country_id, c.name)),
    // Application city options are narrowed to the chosen destination country
    cities: cities.map((c) => option(c.city_id, c.name, { countryId: String(c.country_id) })),
    // Place of birth is a city; the country tells same-named cities apart
    birthPlaces: cities.map((c) =>
      option(c.city_id, countryName.has(c.country_id) ? `${c.name}, ${countryName.get(c.country_id)}` : c.name),
    ),
    visaCategories: visaCategories.map((v) => option(v.visa_category_id, v.name)),
    servicePacks: servicePacks.map((p) => option(p.service_pack_id, p.name)),
    addOnPacks: addOnPacks.map((p) => option(p.add_on_pack_id, p.name)),
    csrs: csrs.map((u) => option(u.user_id, fullName(u))),
    teamLeads: teamLeads.map((u) => option(u.user_id, fullName(u))),
    genders: genders.map((g) => option(g.gender_id, g.label)),
    // The backend stores the document type's code, not an id
    documentTypes: documentTypes.map((d) => ({ value: d.code, label: d.label })),
    bankAccounts: bankAccounts.map((b) =>
      option(b.bank_account_id, `${b.account_name} (${b.currency_code})`, { currencyId: b.currency_id }),
    ),
  }
}

let cached = null

function loadLookups() {
  // A failed load isn't cached, so revisiting the page retries it
  cached ??= fetchLookups().catch((err) => {
    cached = null
    throw err
  })
  return cached
}

/** `{ lookups, error }` — both null while loading. */
export function useLookups() {
  const [state, setState] = useState({ lookups: null, error: null })

  useEffect(() => {
    let active = true
    loadLookups().then(
      (lookups) => active && setState({ lookups, error: null }),
      (error) => active && setState({ lookups: null, error }),
    )
    return () => {
      active = false
    }
  }, [])

  return state
}

async function fetchEditLookups() {
  const [countries, cities, visaCategories, genders, maritalStatuses, travelDocumentTypes, permitTypes, occupations, fundingSources, documentTypes] =
    await Promise.all([
      apiGet('/api/countries'),
      apiGet('/api/cities'),
      apiGet('/api/visa-categories'),
      apiGet('/api/genders'),
      apiGet('/api/marital-statuses'),
      apiGet('/api/travel-document-types'),
      apiGet('/api/permit-types'),
      apiGet('/api/occupation-categories'),
      apiGet('/api/funding-sources'),
      apiGet('/api/document-types'),
    ])

  return {
    countries: countries.map((c) => option(c.country_id, c.name)),
    cities: cities.map((c) => option(c.city_id, c.name, { countryId: String(c.country_id) })),
    // travel_info stores the category's code, not its id
    visaTypes: visaCategories.map((v) => ({ value: v.code, label: v.name })),
    genders: genders.map((g) => option(g.gender_id, g.label)),
    maritalStatuses: maritalStatuses.map((m) => option(m.marital_status_id, m.label)),
    travelDocumentTypes: travelDocumentTypes.map((d) => ({ value: d.code, label: d.label })),
    permitTypes: permitTypes.map((p) => option(p.permit_type_id, p.label)),
    occupations: occupations.map((o) => ({ value: o.code, label: o.label })),
    fundingSources: fundingSources.map((f) => ({ value: f.code, label: f.label })),
    documentTypes: documentTypes.map((d) => option(d.document_type_id, d.name)),
  }
}

let cachedEdit = null

/** Dropdown data for the customer page's edit forms, fetched once per page load. */
export function useEditLookups() {
  const [state, setState] = useState({ lookups: null, error: null })

  useEffect(() => {
    let active = true
    cachedEdit ??= fetchEditLookups().catch((err) => {
      cachedEdit = null
      throw err
    })
    cachedEdit.then(
      (lookups) => active && setState({ lookups, error: null }),
      (error) => active && setState({ lookups: null, error }),
    )
    return () => {
      active = false
    }
  }, [])

  return state
}

/** Label of the option with `value`, or '' when there is none. */
export function labelOf(options, value) {
  return options.find((o) => o.value === value)?.label ?? ''
}
