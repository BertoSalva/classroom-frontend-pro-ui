import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { authApi } from '../api/auth.api'

export default function ResetPasswordPage() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()

  const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams])
  const initialToken = useMemo(() => {
    const rawQuery = window.location.search.replace(/^\?/, '')
    const tokenPart = rawQuery
      .split('&')
      .find((part) => part.startsWith('token='))

    if (tokenPart) {
      return tokenPart.slice('token='.length)
    }

    return searchParams.get('token') ?? ''
  }, [searchParams])
  const hasQueryCredentials = useMemo(() => Boolean(initialEmail && initialToken), [initialEmail, initialToken])

  const [email, setEmail] = useState(initialEmail)
  const [token, setToken] = useState(initialToken)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    setSuccess(null)

    if (!email.trim() || !token.trim() || !newPassword) {
      setErr('Email, token, and new password are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setErr('Passwords do not match')
      return
    }

    const rawToken = token.trim()

    setBusy(true)
    try {
      await authApi.resetPassword({
        email: email.trim(),
        token: rawToken,
        newPassword,
      })
      setSuccess('Your password has been reset. You can now sign in with your new password.')
      window.setTimeout(() => nav('/login'), 1200)
    } catch (e: any) {
      const errorData = e?.response?.data
      if (typeof errorData === 'string') {
        setErr(errorData)
      } else if (errorData?.message) {
        setErr(errorData.message)
      } else {
        setErr('Unable to reset password')
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
              <div style={{ fontWeight: 900, fontSize: 18 }}>Reset password</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Use the reset link from your email. The token and email from your link are accepted on this page.
              </div>
            </div>
            <div className="card-b">
              {hasQueryCredentials && (
                <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(22,163,74,0.35)', color: 'var(--text)' }}>
                  Reset link detected. Set your new password and submit.
                </div>
              )}

              <div className="field">
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" disabled={busy} />
              </div>
              {!hasQueryCredentials && (
                <div className="field">
                  <label>Token</label>
                  <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the reset token" disabled={busy} />
                </div>
              )}
              <div className="field">
                <label>New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter a strong new password"
                  disabled={busy}
                />
              </div>
              <div className="field">
                <label>Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  disabled={busy}
                />
              </div>

              {success && (
                <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(22,163,74,0.35)', color: 'var(--text)' }}>
                  {success}
                </div>
              )}

              {err && (
                <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                  {String(err)}
                </div>
              )}

              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={submit} disabled={busy}>
                  {busy ? 'Resetting...' : 'Reset password'}
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