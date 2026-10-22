export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3003'
export const LOGIN_URL = import.meta.env.VITE_LOGIN_URL ?? 'http://localhost:5173/'

// The login app stores the `token` cookie on localhost, which the browser
// sends to the backend because cookies are shared across ports.
export async function verifySession(signal) {
  const res = await fetch(`${API_URL}/api/auth/verify`, {
    credentials: 'include',
    signal,
  })
  if (!res.ok) return null
  const body = await res.json()
  return body.success ? body.data.user : null
}
