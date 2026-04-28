import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { authApi } from '../api/auth.api'
import { useAuth } from '../auth/AuthContext'
import Loader from '../components/Loader'

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
      const msg = e?.response?.data
      if (typeof msg === 'string' && msg.toLowerCase().includes('verify your email')) {
        setErr('Your teacher account is not yet verified. Please enter the verification code sent to your email.')
      } else {
        setErr(typeof msg === 'string' ? msg : 'Login failed')
      }
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
              {busy && (
                <div className="signin-loader-panel">
                  <Loader label="Signing you in..." inline />
                  <div className="signin-loader-subtext">
                    Verifying your credentials and preparing your workspace.
                  </div>
                  <div className="signin-loader-track" aria-hidden="true">
                    <span className="signin-loader-fill" />
                  </div>
                </div>
              )}

              <div className="field">
                <label>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  disabled={busy}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={busy}
                />
              </div>

              <div className="row" style={{ justifyContent: 'flex-end', marginTop: -4 }}>
                <Link className="muted" to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              {err && (
                <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                  {String(err)}
                </div>
              )}

              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={login} disabled={busy}>
                  {busy ? (
                    <span className="btn-loading">
                      <span className="loader-spinner loader-spinner-sm" aria-hidden="true" />
                      Signing in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
                <div className="spacer" />
                <Link className="muted" to="/register">
                  Learner registration
                </Link>
                <Link className="muted" to="/register-teacher">
                  Teacher registration
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
