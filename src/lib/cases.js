import { useEffect, useState } from 'react'
import { apiGet } from './api.js'

// Cases from GET /api/case/list, shaped for the Cases table and the Dashboard
// board. Database ids are only used as React keys — they are never shown.

const fullName = (first, last) => [first, last].filter(Boolean).join(' ')

// Dashboard column for an application status (app_status.status_code)
const STAGE_BY_STATUS = {
  created: 'created',
  application_information_for_review: 'review',
  vac_account_creation: 'vac',
  appointment_monitoring: 'appointment',
  appointment_booked: 'booked',
  documents_in_review: 'documents',
  customer_document_review: 'customerReview',
  pre_balance_dispatch: 'preBalance',
  awaiting_balance_payment: 'awaitingBalance',
  payment_completed: 'paymentCompleted',
  application_closed: 'closed',
}

// Statuses not listed above: a final one (visa granted, refused, …) closes the
// application; anything else comes after the appointment, i.e. documents in review.
function stageOf(application) {
  if (STAGE_BY_STATUS[application.status_code]) return STAGE_BY_STATUS[application.status_code]
  return application.is_terminal ? 'closed' : 'documents'
}

// Fields every row shares, taken from the case
function caseFields(row) {
  return {
    city: row.application_city ?? '',
    country: row.destination_country ?? '',
    visa: row.visa_category ?? '',
    travelDate: row.tentative_travel_date ?? '',
    csr: row.assigned_csr ?? '',
    teamLead: row.assigned_team_lead ?? '',
  }
}

/** One row per case, for the Cases table. */
export function toListCase(row) {
  const lead = fullName(row.lead_first_name, row.lead_surname)
  const others = row.applicant_count - 1
  return {
    ...caseFields(row),
    id: row.case_id,
    name: others > 0 ? `${lead} +${others}` : lead,
    customerLead: lead,
    state: row.status_code,
    stateLabel: row.status_label ?? row.status_code ?? 'Unknown',
    updatedAt: row.updated_at ?? '',
  }
}

/** One card per applicant, placed in the column of their application's status. */
export function toBoardCards(row) {
  return row.applications.map((application) => ({
    ...caseFields(row),
    id: application.application_id,
    name: fullName(application.first_name, application.surname),
    stage: stageOf(application),
    highPriority: false,
  }))
}

/** One row per customer lead, for the Directory. The id (lead contact) is only used in the link. */
export function toCustomer(row) {
  return {
    id: row.lead_contact_id,
    lead: fullName(row.lead_first_name, row.lead_surname),
    applicantCount: row.applicant_count,
    csr: row.assigned_csr ?? '',
    teamLead: row.assigned_team_lead ?? '',
    phone: row.lead_whatsapp_number ?? '',
  }
}

/** Filter drawer choices: the distinct values present in the loaded rows. */
export function filterOptions(rows) {
  const distinct = (key) => [...new Set(rows.map((r) => r[key]).filter(Boolean))].sort()
  return {
    cities: distinct('city'),
    countries: distinct('country'),
    csrs: distinct('csr'),
    teamLeads: distinct('teamLead'),
    visaCategories: distinct('visa'),
  }
}

/** `{ rows, loading, error }` — the raw case rows, fetched on mount. */
export function useCaseRows() {
  const [state, setState] = useState({ rows: [], loading: true, error: null })

  useEffect(() => {
    const controller = new AbortController()
    apiGet('/api/case/list', null, controller.signal)
      .then((rows) => setState({ rows, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ rows: [], loading: false, error })
      })
    return () => controller.abort()
  }, [])

  return state
}
