import { Link, useLocation, useSearchParams } from 'react-router-dom'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthed, roles, logout } = useAuth()
  const searchQuery = searchParams.get('q') ?? ''

  const setSearchQuery = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value.trim()) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    setSearchParams(next)
  }

  const portalInfo = 'Arise-Hub keeps teachers, learners, and resources in one secure classroom hub.'
  const portalHighlights = ['Exam Planning', 'Test Preparations', 'Resources']

  return (
    <div className="topbar">
      {isAuthed ? (
        <>
          <div className="topbar-main">
            <div style={{ fontWeight: 800 }}>{pageTitle(pathname)}</div>
            <div className="spacer" />
            <div className="search" role="search">
              <span className="muted">🔎</span>
              <input
                placeholder="Search classrooms, resources…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="row topbar-auth-row">
            <span className="pill">{roles[0] ?? 'User'}</span>
            <button className="btn" onClick={logout}>
              Log out
            </button>
          </div>
        </>
      ) : (
        <div className="topbar-hero" role="note">
          <div className="topbar-hero-crest">
            <span className="topbar-hero-pin" aria-hidden="true">
              ✦
            </span>
            <div>
              <div className="topbar-hero-title">Arise-Hub Portal</div>
              <div className="topbar-hero-subtitle">Secure classroom hub</div>
            </div>
          </div>
          <p className="topbar-hero-copy">{portalInfo}</p>
          <div className="topbar-hero-chip-row">
            {portalHighlights.map((highlight) => (
              <span key={highlight} className="topbar-hero-chip">
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
