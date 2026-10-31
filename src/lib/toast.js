import { createContext, useContext } from 'react'

export const ToastContext = createContext(() => {})

/** `toast({ type: 'success' | 'error', title, message })` shows a toast, on any page. */
export const useToast = () => useContext(ToastContext)
