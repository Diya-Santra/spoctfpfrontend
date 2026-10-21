import { useRef, useState } from 'react'
import { Calendar } from 'lucide-react'

import Drawer from '../ui/Drawer.jsx'
import { Checkbox, SelectField, PrimaryButton, OutlineButton } from '../ui/FormControls.jsx'
import { CITIES, COUNTRIES, CSRS, TEAM_LEADS, VISA_CATEGORIES, EMPTY_FILTERS } from '../../data/cases.js'

const DEFAULT_OPTIONS = {
  cities: CITIES,
  countries: COUNTRIES,
  csrs: CSRS,
  teamLeads: TEAM_LEADS,
  visaCategories: VISA_CATEGORIES,
}

/** `options` lists the values each filter offers; defaults to the mock data. */
function FilterDrawer({ open, onClose, filters, onApply, options = DEFAULT_OPTIONS }) {
  // Draft state — only committed on "Apply filter"
  const [draft, setDraft] = useState(filters)
  const [wasOpen, setWasOpen] = useState(open)
  const dateRef = useRef(null)

  // Reset the draft to the applied filters each time the drawer opens
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setDraft(filters)
  }

  const set = (key) => (value) => setDraft((prev) => ({ ...prev, [key]: value }))

  const toggleCategory = (category, checked) =>
    setDraft((prev) => ({
      ...prev,
      visaCategories: checked
        ? [...prev.visaCategories, category]
        : prev.visaCategories.filter((c) => c !== category),
    }))

  const openCalendar = () => {
    const input = dateRef.current
    if (!input) return
    input.type = 'date'
    input.focus()
    input.showPicker?.()
  }

  const handleApply = (event) => {
    event.preventDefault()
    onApply(draft)
    onClose()
  }

  const handleReset = () => {
    setDraft(EMPTY_FILTERS)
    onApply(EMPTY_FILTERS)
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Refine your search"
    >
      <form id="filter-form" onSubmit={handleApply} className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-[15px] font-medium text-ink">Visa category</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {options.visaCategories.map((category) => (
              <Checkbox
                key={category}
                label={category}
                checked={draft.visaCategories.includes(category)}
                onChange={(checked) => toggleCategory(category, checked)}
              />
            ))}
          </div>
        </fieldset>

        <SelectField id="f-city" value={draft.city} onChange={set('city')} options={options.cities} placeholder="Application city" />
        <SelectField id="f-country" value={draft.country} onChange={set('country')} options={options.countries} placeholder="Destination country" />
        <SelectField id="f-visa-catagory" value={draft.visaCategories} onChange={set('visaCategories')} options={options.visaCategories} placeholder="Visa category" />
        <SelectField id="f-csr" value={draft.csr} onChange={set('csr')} options={options.csrs} placeholder="Assigned CSR" />
        <SelectField id="f-lead" value={draft.teamLead} onChange={set('teamLead')} options={options.teamLeads} placeholder="Assigned team lead" />

        <div className="relative">
          <label htmlFor="f-travel-date" className="sr-only">Travel dates</label>
          <input
            id="f-travel-date"
            ref={dateRef}
            type={draft.travelDate ? 'date' : 'text'}
            onBlur={(event) => !event.target.value && (event.target.type = 'text')}
            value={draft.travelDate}
            onChange={(event) => set('travelDate')(event.target.value)}
            placeholder="Travel dates"
            className="h-11 w-full rounded-[2px] border border-line bg-white px-3.5 pr-10 text-[15px] text-body outline-none placeholder:text-body/90 focus:border-primary focus:ring-1 focus:ring-primary [&::-webkit-calendar-picker-indicator]:hidden"
          />
          <button
            type="button"
            aria-label="Open calendar"
            onClick={openCalendar}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          >
            <Calendar className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex gap-3 border-t border-line pt-4">
          <PrimaryButton type="submit" form="filter-form" className="h-12 flex-1">
            Apply filter
          </PrimaryButton>
          <OutlineButton type="button" onClick={handleReset} className="h-12 flex-1">
            Reset
          </OutlineButton>
        </div>
      </form>
    </Drawer>
  )
}

export default FilterDrawer
