import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import ListToolbar from '../components/ui/ListToolbar.jsx'
import StageColumn from '../components/dashboard/StageColumn.jsx'
import FilterDrawer from '../components/dashboard/FilterDrawer.jsx'
import { downloadCsv } from '../lib/csv.js'
import { STAGES, EMPTY_FILTERS, countActiveFilters, matchesFilters, matchesSearch } from '../data/cases.js'
import { filterOptions, toBoardCards, useCaseRows } from '../lib/cases.js'

const SORTERS = {
  travelDate: { label: 'Travel dates', fn: (a, b) => a.travelDate.localeCompare(b.travelDate) },
  name: { label: 'Applicant name', fn: (a, b) => a.name.localeCompare(b.name) },
  priority: { label: 'Priority', fn: (a, b) => Number(b.highPriority) - Number(a.highPriority) },
}

function exportCsv(rows) {
  downloadCsv(
    'cases.csv',
    ['Name', 'City', 'Country', 'Visa', 'Travel date', 'CSR', 'Team lead', 'Stage', 'High priority'],
    rows.map((r) => [r.name, r.city, r.country, r.visa, r.travelDate, r.csr, r.teamLead, r.stage, r.highPriority ? 'Yes' : 'No']),
  )
}

function Dashboard() {
  const navigate = useNavigate()
  // One card per applicant, straight from the database, so a case saved on "Add new case" shows up too
  const { rows, loading, error } = useCaseRows()
  const cases = useMemo(() => rows.flatMap(toBoardCards), [rows])
  const options = useMemo(() => filterOptions(cases), [cases])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState('travelDate')
  const [filterOpen, setFilterOpen] = useState(false)

  const closeFilter = useCallback(() => setFilterOpen(false), [])

  const visibleCases = useMemo(
    () =>
      cases
        .filter((c) => matchesSearch(c, search) && matchesFilters(c, filters))
        .sort(SORTERS[sortBy].fn),
    [cases, search, filters, sortBy],
  )

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-60">
        <Topbar search={search} onSearchChange={setSearch} userName="SPOC" />

        <main className="flex min-w-0 flex-1 flex-col px-4 pb-12 pt-9 sm:px-8">
          <PageHeader
            eyebrow="Operational overview"
            title="Dashboard"
            onDownload={() => exportCsv(visibleCases)}
            onCreate={() => navigate('/spoc/cases/new', { state: { from: '/spoc/dashboard' } })}
          />

          <ListToolbar
            className="mt-16"
            onOpenFilters={() => setFilterOpen(true)}
            activeFilterCount={countActiveFilters(filters)}
            sorters={SORTERS}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {(loading || error) && (
            <p role={error ? 'alert' : undefined} className={`mt-6 text-sm ${error ? 'text-alert' : 'text-muted'}`}>
              {error ? `Couldn't load cases: ${error.message}` : 'Loading cases…'}
            </p>
          )}

          {/* Kanban board */}
          <div className="scrollbar-board mt-8 flex flex-1 gap-[18px] overflow-x-auto pb-10">
            {STAGES.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                cases={visibleCases.filter((c) => c.stage === stage.id)}
              />
            ))}
          </div>
        </main>
      </div>

      <FilterDrawer open={filterOpen} onClose={closeFilter} filters={filters} onApply={setFilters} options={options} />
    </div>
  )
}

export default Dashboard
