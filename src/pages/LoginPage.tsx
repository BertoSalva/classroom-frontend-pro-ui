import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { authApi } from '../api/auth.api'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const nav = useNavigate()
  const { setToken } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const login = async () => {
    setErr(null)
    setBusy(true)
    try {
      const res = await authApi.login({ email, password })
    setToken(res.accessToken)
      nav('/classrooms')
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Login failed')
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
              <div style={{ fontWeight: 900, fontSize: 18 }}>Login</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Access your classrooms and resources.
              </div>
            </div>
            <div className="card-b">
              <div className="field">
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              {err && (
                <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                  {String(err)}
                </div>
              )}

              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={login} disabled={busy}>
                  {busy ? 'Signing in…' : 'Login'}
                </button>
                <div className="spacer" />
                <Link className="muted" to="/register">
                  Create account
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
