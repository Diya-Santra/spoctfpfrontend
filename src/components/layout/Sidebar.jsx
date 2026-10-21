import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Folder, BookUser, Settings, LogOut, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/spoc/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/spoc/cases', label: 'Cases', icon: Folder },
  { to: '/spoc/directory', label: 'Directory', icon: BookUser },
]

const itemClass = ({ isActive }) =>
  `flex items-center gap-3.5 border-l-2 py-3 pl-3.5 pr-4 text-base transition-colors ${
    isActive
      ? 'border-white bg-primary-soft font-medium text-white'
      : 'border-transparent text-white/85 hover:bg-white/5 hover:text-white'
  }`

/** Always shown from `lg` up; below that it slides in from the menu button. */
function Sidebar({ role = 'SPOC', subtitle = 'Administrator role' }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-[2px] border border-line bg-white text-ink lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open && <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={close} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-y-auto bg-primary pl-8 text-white transition-transform duration-200 lg:z-30 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-[2px] text-white/85 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="pt-12">
          <img src="/logo.svg" alt="The Flying Panda" className="h-14 w-auto object-contain" />
        </div>

        <div className="mt-16">
          <p className="text-xl font-semibold leading-tight">{role}</p>
          <p className="mt-1 text-[15px] text-white/80">{subtitle}</p>
        </div>

        <nav className="mt-8 flex flex-col gap-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={close} className={itemClass}>
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mb-10 mt-auto flex flex-col gap-2">
          <NavLink to="/spoc/settings" onClick={close} className={itemClass}>
            <Settings className="h-5 w-5" strokeWidth={1.75} />
            Settings
          </NavLink>
          <button
            type="button"
            onClick={() => navigate('/spoc/dashboard')}
            className="flex items-center gap-3.5 border-l-2 border-transparent py-3 pl-3.5 pr-4 text-left text-base text-white/85 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
