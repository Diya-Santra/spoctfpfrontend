import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import CustomersTable from '../components/directory/CustomersTable.jsx'
import { OutlineButton } from '../components/ui/FormControls.jsx'
import { downloadCsv } from '../lib/csv.js'
import { matchesCustomerSearch } from '../data/customers.js'
import { toCustomer, useCaseRows } from '../lib/cases.js'

const PAGE_SIZE = 7

function exportCustomers(rows) {
  downloadCsv(
    'customers.csv',
    ['Customer lead', 'Total applicants', 'Assigned CSR', 'Assigned team lead', 'WhatsApp'],
    rows.map((r) => [r.lead, r.applicantCount, r.csr, r.teamLead, r.phone]),
  )
}

function Directory() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  // Every customer lead with an open case, straight from the database
  const { rows, loading, error } = useCaseRows()
  const customers = useMemo(() => rows.map(toCustomer), [rows])

  const visibleCustomers = useMemo(
    () => customers.filter((c) => matchesCustomerSearch(c, search)),
    [customers, search],
  )

  const pageCount = Math.max(1, Math.ceil(visibleCustomers.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageCustomers = visibleCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-60">
        <Topbar
          search={search}
          onSearchChange={handleSearch}
          searchPlaceholder="Search customer lead, CSR or team lead..."
          userName="SPOC"
        />

        <main className="flex min-w-0 flex-1 flex-col px-4 pb-12 pt-9 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold leading-tight text-primary sm:text-[32px]">Customers directory</h2>
            <OutlineButton
              type="button"
              onClick={() => exportCustomers(visibleCustomers)}
              className="h-12 px-5"
            >
              <Download className="h-5 w-5" strokeWidth={1.5} />
              Download customer list
            </OutlineButton>
          </div>

          <div className="mt-10">
            <CustomersTable
              customers={pageCustomers}
              emptyMessage={
                loading
                  ? 'Loading customers…'
                  : error
                    ? `Couldn't load customers: ${error.message}`
                    : customers.length === 0
                      ? 'No customers yet'
                      : undefined
              }
            />
          </div>

          <div className="mt-24">
            <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Directory
