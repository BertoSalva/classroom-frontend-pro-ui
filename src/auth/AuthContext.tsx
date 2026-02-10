import React, { createContext, useContext, useMemo, useState } from 'react'
import { decodeJwt, getRoles, type JwtPayload } from './jwt'

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

  const setToken = (t: string | null) => {
    setTokenState(t)
    if (t) localStorage.setItem('access_token', t)
    else localStorage.removeItem('access_token')
  }

  const logout = () => setToken(null)

  const value: AuthContextValue = {
    token,
    payload,
    roles,
    isAuthed: !!token,
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
