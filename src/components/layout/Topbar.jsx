import { useEffect, useState } from 'react'
import { Search, Clock, Bell } from 'lucide-react'

function useLocalTime() {
  const format = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  const [time, setTime] = useState(format)
  useEffect(() => {
    const timer = setInterval(() => setTime(format()), 15_000)
    return () => clearInterval(timer)
  }, [])
  return time
}

function Topbar({
  title = 'Visa case management',
  search,
  onSearchChange,
  searchPlaceholder = 'Search applicant name or visa category...',
  hasNotifications = true,
  userName = 'User',
}) {
  const time = useLocalTime()

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-line bg-white pl-16 pr-4 sm:gap-6 sm:pr-8 lg:pl-8">
      <h1 className="hidden whitespace-nowrap text-xl font-semibold text-ink md:block">{title}</h1>
      <span className="hidden h-8 w-px bg-line md:block" aria-hidden="true" />

      <label className="relative min-w-0 flex-1 md:max-w-[400px]">
        <span className="sr-only">Search cases</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-[2px] border border-line bg-white pl-11 pr-3 text-[15px] text-body outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </label>

      <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
        <span className="hidden items-center gap-2 whitespace-nowrap text-[15px] text-body lg:flex">
          <Clock className="h-5 w-5 text-muted" strokeWidth={1.75} />
          {time} (Local)
        </span>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
          {hasNotifications && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-alert ring-2 ring-white" />
          )}
        </button>

        <span
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
          title={userName}
        >
          {userName.slice(0, 1).toUpperCase()}
        </span>
      </div>
    </header>
  )
}

export default Topbar
