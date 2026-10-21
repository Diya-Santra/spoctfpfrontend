import { SlidersHorizontal, ChevronDown } from 'lucide-react'

/** "Apply filters" button on the left, "Sort by" select on the right. */
function ListToolbar({ onOpenFilters, activeFilterCount, sorters, sortBy, onSortChange, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-line px-0 pb-4 sm:px-[18px] ${className}`}>
      <button
        type="button"
        onClick={onOpenFilters}
        className="flex h-10 items-center gap-2.5 rounded-[2px] border border-ink/70 px-4 text-[15px] text-ink transition-colors hover:border-primary hover:bg-primary/5"
      >
        <SlidersHorizontal className="h-[18px] w-[18px] text-muted" strokeWidth={1.5} />
        Apply filters
        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      <label className="flex items-center gap-2.5 text-[15px] text-muted">
        Sort by:
        <span className="relative">
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-10 cursor-pointer appearance-none rounded-[2px] border border-ink/70 bg-white pl-4 pr-11 text-[15px] text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {Object.entries(sorters).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
        </span>
      </label>
    </div>
  )
}

export default ListToolbar
