import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function Icon({ label }: { label: string }) {
  return (
    <span
      style={{
        width: 22,
        height: 22,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(0,0,0,0.12)',
        fontSize: 12,
        color: 'rgba(255,255,255,0.75)',
      }}
      aria-hidden="true"
      title={label}
    >
      {label}
    </span>
  )
}

export default function Sidebar() {
  const { roles } = useAuth()

  const isAdmin =
    roles.includes('SuperAdmin') || roles.includes('Super Admin') || roles.includes('Admin')

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge">C</div>
        <div>
          <div style={{ fontWeight: 800, lineHeight: 1.1 }}>Classroom</div>
          <div className="muted" style={{ fontSize: 12 }}>
            Teacher & Learner hub
          </div>
        </div>
      </div>

      <nav className="nav" aria-label="Primary">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          <Icon label="🏠" />
          Dashboard
        </NavLink>

        <NavLink to="/classrooms" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          <Icon label="🏫" />
          Classrooms
        </NavLink>

        <NavLink to="/resources" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          <Icon label="📚" />
          Resources
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <Icon label="🛡️" />
            Admin
          </NavLink>
        )}
      </nav>

      <div style={{ marginTop: 16 }} className="card">
        <div className="card-b">
          <div style={{ fontWeight: 700 }}>Tip</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
            Login first, then the app sends your <span className="pill">Bearer</span> token automatically.
          </div>
        </div>
      </div>
    </aside>
  )
}
