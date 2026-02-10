import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RoleGuard({
  allow,
  children,
}: {
  allow: string[]
  children: React.ReactNode
}) {
  const { roles, isAuthed } = useAuth()
  if (!isAuthed) return <Navigate to="/login" replace />
  const ok = roles.some((r) => allow.includes(r))
  if (!ok) return <Navigate to="/classrooms" replace />
  return <>{children}</>
}
