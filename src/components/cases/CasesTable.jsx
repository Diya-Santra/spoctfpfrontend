import { ChevronRight } from 'lucide-react'
import StateBadge from './StateBadge.jsx'
import { formatDate, formatRelativeTime } from '../../data/cases.js'

const COLUMNS = [
  'Applicant name',
  'Customer lead',
  <>
    Destination country
    <br />
    (Visa category)
  </>,
  'Travel date',
  'Assigned CSR',
  'State',
  'Last updated',
]

function CasesTable({ cases, emptyMessage = 'No cases match your search or filters' }) {
  return (
    <div className="overflow-x-auto rounded-[2px] border border-line">
      <table className="w-full min-w-[900px] border-collapse text-left text-[15px]">
        <thead>
          <tr className="border-b border-line">
            {COLUMNS.map((column, index) => (
              <th key={index} scope="col" className="whitespace-nowrap px-4 py-5 align-middle text-[15px] font-medium leading-snug text-ink first:pl-6">
                {column}
              </th>
            ))}
            <th scope="col" className="w-12">
              <span className="sr-only">Open case</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {cases.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length + 1} className="px-6 py-16 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            cases.map((item) => (
              <tr
                key={item.id}
                className="border-b border-line text-body transition-colors last:border-b-0 hover:bg-primary/[0.03]"
              >
                <td className="whitespace-nowrap py-7 pl-6 pr-4">{item.name}</td>
                <td className="whitespace-nowrap px-4 py-7">{item.customerLead}</td>
                <td className="whitespace-nowrap px-4 py-7">
                  {item.country} ({item.visa})
                </td>
                <td className="whitespace-nowrap px-4 py-7">{formatDate(item.travelDate)}</td>
                <td className="whitespace-nowrap px-4 py-7">{item.csr}</td>
                <td className="px-4 py-7">
                  <StateBadge state={item.state} label={item.stateLabel} />
                </td>
                <td className="whitespace-nowrap px-4 py-7">{item.updatedAt ? formatRelativeTime(item.updatedAt) : '-'}</td>
                <td className="pr-5 text-right">
                  <ChevronRight className="ml-auto h-5 w-5 text-muted" strokeWidth={1.5} aria-hidden="true" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default CasesTable
