import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Phone } from 'lucide-react'
import { whatsappUrl } from '../../data/customers.js'

const COLUMNS = ['Customer lead', 'Total applicants', 'Assigned CSR', 'Assigned team lead', 'WhatsApp']

function CustomersTable({ customers, emptyMessage = 'No customers match your search' }) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto rounded-[2px] border border-line">
      <table className="w-full min-w-[820px] border-collapse text-left text-[15px]">
        <thead>
          <tr className="border-b border-line">
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="whitespace-nowrap px-4 py-5 text-[15px] font-medium text-ink first:pl-6">
                {column}
              </th>
            ))}
            <th scope="col" className="w-12">
              <span className="sr-only">Open customer</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length + 1} className="px-6 py-16 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => navigate(`/spoc/directory/${customer.id}`)}
                className="cursor-pointer border-b border-line text-body transition-colors last:border-b-0 hover:bg-primary/[0.03]"
              >
                <td className="whitespace-nowrap py-6 pl-6 pr-4">{customer.lead}</td>
                <td className="px-4 py-6">
                  <span className="inline-flex whitespace-nowrap rounded-full bg-neutral-100 px-2.5 py-1.5 text-[13px] leading-none text-body">
                    {customer.applicantCount} {customer.applicantCount === 1 ? 'Applicant' : 'Applicants'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-6">{customer.csr}</td>
                <td className="whitespace-nowrap px-4 py-6">{customer.teamLead}</td>
                <td className="px-4 py-6">
                  {customer.phone ? (
                    <a
                      href={whatsappUrl(customer.phone)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-whatsapp/15 py-1.5 pl-1.5 pr-3 text-sm text-whatsapp-ink transition-colors hover:bg-whatsapp/25"
                      aria-label={`Message ${customer.lead} on WhatsApp (${customer.phone})`}
                    >
                      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-whatsapp">
                        <Phone className="h-2.5 w-2.5 fill-white text-white" strokeWidth={1.5} />
                      </span>
                      {customer.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="pr-5 text-right">
                  <Link
                    to={`/spoc/directory/${customer.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-[2px] text-muted transition-colors hover:text-primary"
                    aria-label={`Open ${customer.lead}`}
                  >
                    <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default CustomersTable
