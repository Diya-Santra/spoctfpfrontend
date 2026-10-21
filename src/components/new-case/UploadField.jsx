import { useId, useState } from 'react'
import { CloudUpload, FileText, X } from 'lucide-react'

const ACCEPT = '.pdf,.jpg,.jpeg,.png'
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_BYTES = 10 * 1024 * 1024

/**
 * Dashed click-or-drop zone for a single document; shows the chosen file once picked.
 * `error` comes from the parent (e.g. "required"); a rejected pick shows its own.
 */
function UploadField({ label, file, onChange, error: requiredError }) {
  const id = useId()
  const [pickError, setError] = useState('')
  const error = pickError || (!file && requiredError)
  const [dragging, setDragging] = useState(false)

  const pick = (picked) => {
    if (!picked) return
    if (!ACCEPTED_TYPES.includes(picked.type)) return setError('Only PDF, JPG or PNG files are accepted.')
    if (picked.size > MAX_BYTES) return setError('File is larger than 10 MB.')
    setError('')
    onChange(picked)
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>

      {file ? (
        <div className="flex h-11 items-center gap-2.5 rounded-[2px] border border-line px-3.5 text-[15px] text-body">
          <FileText className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.5} />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-muted hover:text-alert"
            aria-label={`Remove ${file.name}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            pick(event.dataTransfer.files[0])
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[2px] border border-dashed px-4 py-8 text-center transition-colors ${
            dragging ? 'border-primary bg-primary/5' : 'border-muted/60 bg-neutral-50 hover:border-primary'
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200/70 text-muted">
            <CloudUpload className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
          <span className="text-[15px] text-ink">Click to upload</span>
          <span className="text-xs text-muted">Accepted file types: PDF, JPG, PNG; maximum file size: 10 MB.</span>
          <input
            id={id}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(event) => {
              pick(event.target.files[0])
              event.target.value = ''
            }}
          />
        </label>
      )}

      {error && <p className="mt-1.5 text-sm text-alert">{error}</p>}
    </div>
  )
}

export default UploadField
