import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import ListToolbar from '../components/ui/ListToolbar.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import CasesTable from '../components/cases/CasesTable.jsx'
import FilterDrawer from '../components/dashboard/FilterDrawer.jsx'
import { downloadCsv } from '../lib/csv.js'
import { filterOptions, toListCase, useCaseRows } from '../lib/cases.js'
import {
  CASE_STATES,
  EMPTY_FILTERS,
  countActiveFilters,
  formatDate,
  matchesFilters,
  matchesSearch,
} from '../data/cases.js'

const PAGE_SIZE = 7

const SORTERS = {
  travelDate: { label: 'Travel dates', fn: (a, b) => a.travelDate.localeCompare(b.travelDate) },
  name: { label: 'Applicant name', fn: (a, b) => a.name.localeCompare(b.name) },
  updated: { label: 'Last updated', fn: (a, b) => b.updatedAt.localeCompare(a.updatedAt) },
}

function exportCases(rows) {
  const stateLabel = (row) => row.stateLabel ?? CASE_STATES.find((s) => s.id === row.state)?.label ?? row.state
  downloadCsv(
    'active-cases.csv',
    ['Applicant name', 'Customer lead', 'Destination country', 'Visa category', 'Travel date', 'Assigned CSR', 'State', 'Last updated'],
    rows.map((r) => [r.name, r.customerLead, r.country, r.visa, formatDate(r.travelDate), r.csr, stateLabel(r), r.updatedAt]),
  )
}

function Cases() {
  const navigate = useNavigate()
  // Straight from the database, so a case saved on "Add new case" shows up here too
  const loadState = useCaseRows()
  const cases = useMemo(() => loadState.rows.map(toListCase), [loadState.rows])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState('travelDate')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  const closeFilter = useCallback(() => setFilterOpen(false), [])

  const options = useMemo(() => filterOptions(cases), [cases])

  // Any change to what's listed sends the user back to the first page
  const resetPage = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const visibleCases = useMemo(
    () =>
      cases
        .filter((c) => matchesSearch(c, search) && matchesFilters(c, filters))
        .sort(SORTERS[sortBy].fn),
    [cases, search, filters, sortBy],
  )

  const pageCount = Math.max(1, Math.ceil(visibleCases.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageCases = visibleCases.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-60">
        <Topbar search={search} onSearchChange={resetPage(setSearch)} userName="SPOC" />

        <main className="flex min-w-0 flex-1 flex-col px-4 pb-12 pt-9 sm:px-8">
          <PageHeader
            title="Active cases"
            onDownload={() => exportCases(visibleCases)}
            onCreate={() => navigate('/spoc/cases/new', { state: { from: '/spoc/cases' } })}
          />

          <ListToolbar
            className="mt-16"
            onOpenFilters={() => setFilterOpen(true)}
            activeFilterCount={countActiveFilters(filters)}
            sorters={SORTERS}
            sortBy={sortBy}
            onSortChange={resetPage(setSortBy)}
          />

          <div className="mt-8">
            <CasesTable
              cases={pageCases}
              emptyMessage={
                loadState.loading
                  ? 'Loading cases…'
                  : loadState.error
                    ? `Couldn't load cases: ${loadState.error.message}`
                    : cases.length === 0
                      ? 'No cases yet'
                      : undefined
              }
            />
          </div>

          <div className="mt-24">
            <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
          </div>
        </main>
      </div>

      <FilterDrawer open={filterOpen} onClose={closeFilter} filters={filters} onApply={resetPage(setFilters)} options={options} />
    </div>
  )
}

export default Cases
