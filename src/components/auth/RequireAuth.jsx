import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LOGIN_URL, verifySession } from '../../lib/auth.js'

// Layout route: renders nothing until the backend confirms the session,
// otherwise sends the user to the login app.
export default function RequireAuth() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    verifySession(controller.signal)
      .then((verified) => {
        if (verified) setUser(verified)
        else window.location.replace(LOGIN_URL)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') window.location.replace(LOGIN_URL)
      })
    return () => controller.abort()
  }, [])

  if (!user) return null
  return <Outlet context={{ user }} />
}
