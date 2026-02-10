import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { authApi } from '../api/auth.api'

export default function RegisterPage() {
  const nav = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Learner')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const register = async () => {
    setErr(null)
    setBusy(true)
    try {
      await authApi.register({ email, password, fullName, role })
      nav('/login')
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout>
      <div className="grid">
        <div className="col-4" />
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <div style={{ fontWeight: 900, fontSize: 18 }}>Create account</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Join as a learner or teacher. (You can lock this down later.)
              </div>
            </div>
            <div className="card-b">
              <div className="field">
                <label>Full name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Albert" />
              </div>
              <div className="field">
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Use a strong password" />
              </div>
              <div className="field">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Learner">Learner</option>
                  <option value="Teacher">Teacher</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </select>
              </div>

              {err && (
                <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                  {String(err)}
                </div>
              )}

              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={register} disabled={busy}>
                  {busy ? 'Creating…' : 'Register'}
                </button>
                <div className="spacer" />
                <Link className="muted" to="/login">
                  Already have an account?
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-4" />
      </div>
    </Layout>
  )
}
