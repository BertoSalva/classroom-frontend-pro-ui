import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'

import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TeacherRegisterPage from './pages/TeacherRegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ClassroomsPage from './pages/ClassroomsPage'
import ResourcesPage from './pages/ResourcesPage'
import PastPapersPage from './pages/PastPapersPage'
import AdminPage from './pages/AdminPage'
import SuperAdminRoute from './auth/SuperAdminRoute'
import UserManagementPage from './pages/UserManagementPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/past-papers" replace />} />
        <Route
          path="/dashboard"
          element={
            <SuperAdminRoute>
              <DashboardPage />
            </SuperAdminRoute>
          }
        />

        <Route path="/login" element={<LoginPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-teacher" element={<TeacherRegisterPage />} />

        <Route
          path="/classrooms"
          element={
            <SuperAdminRoute>
              <ClassroomsPage />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <SuperAdminRoute>
              <ResourcesPage />
            </SuperAdminRoute>
          }
        />
        <Route path="/past-papers" element={<PastPapersPage />} />

        <Route
          path="/admin"
          element={
            <SuperAdminRoute>
              <AdminPage />
            </SuperAdminRoute>
          }
        />
        <Route path="/admin/users" element={<UserManagementPage />} />

        <Route path="*" element={<Navigate to="/past-papers" replace />} />
      </Routes>
    </AuthProvider>
  )
}
