import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import logo from '../images/pbhsLogo.webp'

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <div className="sidebar">
      <div className="brand">
        <img src={logo} alt="Parktown Portal Logo" style={{ width: 40, height: 40, borderRadius: 12 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Parktown Portal</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Teacher & Learner hub</div>
        </div>
      </div>

      <nav className="nav">
        <Link to="/dashboard">🏠 Dashboard</Link>
        <Link to="/classrooms">🏫 Classrooms</Link>
        <Link to="/resources">📚 Resources</Link>
      </nav>

      <div className="tip">
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tip</div>
        <div style={{ fontSize: '0.8rem', marginTop: 6 }}>Login to use full features and manage your studies.</div>
      </div>

      <button onClick={logout} className="btn" style={{ width: '100%', marginTop: 'auto' }}>
        Logout
      </button>
    </div>
  )
}
