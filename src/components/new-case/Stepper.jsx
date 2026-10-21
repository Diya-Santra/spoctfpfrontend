import { Fragment } from 'react'
import { Check } from 'lucide-react'

/** Horizontal step indicator: done steps get a filled check, the active one a filled number, upcoming ones an outlined number. */
function Stepper({ steps, current }) {
  return (
    <ol className="flex h-16 items-center gap-3 rounded-[2px] border border-line px-3 sm:gap-4 sm:px-6">
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <Fragment key={step}>
            {index > 0 && <li className="h-px flex-1 bg-line" aria-hidden="true" />}
            <li
              className={`flex items-center gap-2.5 text-[15px] ${active || done ? 'font-medium text-ink' : 'text-muted'}`}
              aria-current={active ? 'step' : undefined}
            >
              {done ? (
                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-primary">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </span>
              ) : active ? (
                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-primary text-xs text-white">
                  {index + 1}
                </span>
              ) : (
                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-muted text-xs">
                  {index + 1}
                </span>
              )}
              <span className={active ? '' : 'hidden sm:inline'}>{step}</span>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}

export default Stepper
