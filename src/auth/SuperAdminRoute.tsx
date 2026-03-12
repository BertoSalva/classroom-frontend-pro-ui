import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function SuperAdminRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { roles, isAuthed } = useAuth()
  if (!isAuthed) return <Navigate to="/login" replace />
  if (!roles.includes('SuperAdmin')) return <Navigate to="/past-papers" replace />
  return <>{children}</>
}
