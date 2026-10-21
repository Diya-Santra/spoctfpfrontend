// Helpers for the customers directory.

/** True when a customer matches the search term (customer lead, CSR or team lead). */
export function matchesCustomerSearch(customer, search) {
  const term = search.trim().toLowerCase()
  return !term || [customer.lead, customer.csr, customer.teamLead].some((v) => v.toLowerCase().includes(term))
}

/** wa.me link for a phone number like "+44 6987654334". */
export function whatsappUrl(phone) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}
