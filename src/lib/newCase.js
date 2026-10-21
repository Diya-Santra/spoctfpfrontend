import { apiPost } from './api.js'

// Turns the wizard's draft into the request POST /api/case/create-full expects,
// and the backend's field errors back into wording the SPOC can act on.

/** "+44" + "07900 000000" -> "+447900000000" (the national trunk 0 is dropped). */
export function toE164(code, number) {
  return `${code}${number.replace(/\D/g, '').replace(/^0/, '')}`
}

/** Current local time as a datetime-local value, e.g. "2026-10-21T14:05". */
export function nowLocal() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

// The answers go as JSON in the `data` field; applicant i's travel document
// goes in the `travel_document_i` file field.
function toFormData({ lead, applicants, payments }) {
  const data = {
    // Payment times are entered in this zone; the backend converts them to UTC
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    lead: {
      full_name: lead.fullName,
      whatsapp_number: toE164(lead.phoneCode, lead.phone),
      destination_country_id: Number(lead.countryId),
      application_city_id: Number(lead.cityId),
      tentative_travel_date: lead.travelDate,
      visa_category_id: Number(lead.visaCategoryId),
      // One of each can be picked; the backend takes lists
      service_pack_ids: [Number(lead.servicePackId)],
      add_on_pack_ids: lead.addOnPackId ? [Number(lead.addOnPackId)] : [],
      assigned_csr_user_id: Number(lead.csrId),
      assigned_team_lead_user_id: Number(lead.teamLeadId),
    },
    applicants: applicants.map((a) => ({
      first_name: a.firstName,
      surname: a.surname,
      gender_id: Number(a.genderId),
      date_of_birth: a.dateOfBirth,
      travel_document_type: a.documentType,
      travel_document_number: a.documentNumber,
      issue_date: a.issueDate,
      expiry_date: a.expiryDate,
      nationality_id: Number(a.nationalityId),
      place_of_birth_id: Number(a.placeOfBirthId),
      phone_number: toE164(a.phoneCode, a.phone),
    })),
    payments: payments.map((p) => ({
      amount: String(p.amount),
      bank_account_id: Number(p.bankAccountId),
      local_payment_datetime: p.paidAt,
      payment_reference: p.reference,
    })),
  }

  const form = new FormData()
  form.append('data', JSON.stringify(data))
  applicants.forEach((a, i) => form.append(`travel_document_${i}`, a.document))
  return form
}

/** Saves the whole case. Resolves with the created case. */
export function createFullCase(draft) {
  return apiPost('/api/case/create-full', toFormData(draft))
}

/** "applicants[1].surname" + "Surname is required" -> "Applicant 2: Surname is required" */
export function describeFieldError({ field = '', message }) {
  const [, section, index] = field.match(/^(applicants|payments|travel_document_)\[?(\d+)/) ?? []
  if (section === 'payments') return `Payment ${Number(index) + 1}: ${message}`
  if (section) return `Applicant ${Number(index) + 1}: ${message}`
  if (field.startsWith('lead.')) return `Customer lead: ${message}`
  return message
}
