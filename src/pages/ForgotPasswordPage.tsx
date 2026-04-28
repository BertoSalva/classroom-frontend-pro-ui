import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { authApi } from '../api/auth.api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const submit = async () => {
    setErr(null)
    if (!email.trim()) {
      setErr('Email is required')
      return
    }

    setBusy(true)
    try {
      await authApi.forgotPassword({ email: email.trim() })
      setSubmitted(true)
    } catch (e: any) {
      const errorData = e?.response?.data
      if (typeof errorData === 'string') {
        setErr(errorData)
      } else if (errorData?.message) {
        setErr(errorData.message)
      } else {
        setErr('Unable to send reset instructions')
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
              <div style={{ fontWeight: 900, fontSize: 18 }}>Forgot password</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Enter your email address and we will send password reset instructions.
              </div>
            </div>
            <div className="card-b">
              <div className="field">
                <label>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  disabled={busy || submitted}
                />
              </div>

              {submitted && (
                <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(22,163,74,0.35)', color: 'var(--text)' }}>
                  A reset link has been sent.
                </div>
              )}

              {err && (
                <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                  {String(err)}
                </div>
              )}

              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={submit} disabled={busy || submitted}>
                  {busy ? 'Sending...' : 'Send reset link'}
                </button>
                <div className="spacer" />
                <Link className="muted" to="/login">
                  Back to login
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