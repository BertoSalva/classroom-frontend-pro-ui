import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function pageTitle(pathname: string) {
  if (pathname.startsWith('/admin')) return 'Admin'
  if (pathname.startsWith('/classrooms')) return 'Classrooms'
  if (pathname.startsWith('/resources')) return 'Resources'
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/login')) return 'Login'
  if (pathname.startsWith('/register')) return 'Register'
  return 'Classroom'
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { isAuthed, roles, logout } = useAuth()

  return (
    <div className="topbar">
      <div style={{ fontWeight: 800 }}>{pageTitle(pathname)}</div>
      <div className="spacer" />
      <div className="search" role="search">
        <span className="muted">🔎</span>
        <input placeholder="Search classrooms, resources…" />
      </div>
      <div className="row">
        {isAuthed ? (
          <>
            <span className="pill">{roles[0] ?? 'User'}</span>
            <button className="btn" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link className="btn" to="/login">
              Login
            </Link>
            <Link className="btn btn-primary" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
