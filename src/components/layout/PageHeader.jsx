import { Download, Plus } from 'lucide-react'
import { PrimaryButton } from '../ui/FormControls.jsx'

/** Page title with the "download" + "Create new case" actions. */
function PageHeader({ eyebrow, title, onDownload, onCreate }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-muted">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold leading-tight text-primary sm:text-[32px]">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onDownload}
          className="flex h-12 w-12 items-center justify-center rounded-[2px] border border-line text-muted transition-colors hover:border-primary hover:text-primary"
          aria-label="Download cases as CSV"
          title="Download cases"
        >
          <Download className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <PrimaryButton type="button" onClick={onCreate} className="h-12 px-4">
          <Plus className="h-5 w-5" strokeWidth={1.75} />
          Create new case
        </PrimaryButton>
      </div>
    </div>
  )
}

export default PageHeader
