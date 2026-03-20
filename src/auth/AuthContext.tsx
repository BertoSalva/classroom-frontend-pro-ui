import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { decodeJwt, getRoles, isExpired, type JwtPayload } from './jwt'

type AuthState = {
  token: string | null
  payload: JwtPayload | null
  roles: string[]
  isAuthed: boolean
}

type AuthContextValue = AuthState & {
  setToken: (token: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem('access_token')
  )

  const payload = useMemo(() => (token ? decodeJwt(token) : null), [token])
  const roles = useMemo(() => getRoles(payload), [payload])
  const hasExpiredToken = useMemo(() => Boolean(token && isExpired(payload)), [token, payload])

  const setToken = useCallback(
    (t: string | null) => {
      setTokenState(t)
      if (t) localStorage.setItem('access_token', t)
      else localStorage.removeItem('access_token')
    },
    [setTokenState]
  )

  const logout = useCallback(() => setToken(null), [setToken])

  useEffect(() => {
    if (!token || !payload?.exp) return
    const expiresAt = Number(payload.exp) * 1000
    if (!Number.isFinite(expiresAt)) return
    const timeRemaining = expiresAt - Date.now()
    if (timeRemaining <= 0) {
      logout()
      return
    }
    const timerId = window.setTimeout(logout, timeRemaining)
    return () => window.clearTimeout(timerId)
  }, [token, payload, logout])

  const value: AuthContextValue = {
    token,
    payload,
    roles,
    isAuthed: Boolean(token && !hasExpiredToken),
    setToken,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
