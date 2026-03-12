import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { authApi } from '../api/auth.api'

export default function TeacherRegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [verified, setVerified] = useState(false)

  const register = async () => {
    setErr(null)
    setOk(null)
    setBusy(true)
    try {
      const res = await authApi.register({ email, password, fullName, role: 'Teacher' })
      setRegisteredEmail(res?.email || email)
      setRegistered(true)
      setOk(res?.message || 'Account created. Enter the verification code sent to your email.')
    } catch (e: any) {
      const errorData = e?.response?.data
      if (Array.isArray(errorData)) {
        const errorMessages = errorData.map((x: any) => x.description || x.message || String(x)).join('. ')
        setErr(errorMessages)
      } else if (typeof errorData === 'string') {
        setErr(errorData)
      } else if (errorData?.message) {
        setErr(errorData.message)
      } else {
        setErr('Teacher registration failed')
      }
    } finally {
      setBusy(false)
    }
  }

  const verifyCode = async () => {
    setErr(null)
    setOk(null)
    setBusy(true)
    try {
      const res = await authApi.confirmEmailCode({ email: registeredEmail, code })
      setVerified(true)
      setOk(res?.message || 'Email verified. Your account is now active.')
    } catch (e: any) {
      const errorData = e?.response?.data
      if (Array.isArray(errorData)) {
        const errorMessages = errorData.map((x: any) => x.description || x.message || String(x)).join('. ')
        setErr(errorMessages)
      } else if (typeof errorData === 'string') {
        setErr(errorData)
      } else if (errorData?.message) {
        setErr(errorData.message)
      } else {
        setErr('Code verification failed')
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
              <div style={{ fontWeight: 900, fontSize: 18 }}>Teacher registration</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Create a teacher account.
              </div>
            </div>
            <div className="card-b">
              {registered ? (
                <>
                  <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: 12 }}>📧</div>
                  <div style={{ fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Email verification</div>
                  <div className="muted" style={{ textAlign: 'center', marginBottom: 16 }}>
                    Enter the verification code sent to <strong>{registeredEmail}</strong> to activate your account.
                  </div>

                  <div className="empty" style={{ marginBottom: 12 }}>
                    If your code is delayed, please wait at least 5 minutes and then check your inbox.
                  </div>

                  {!verified && (
                    <div className="field">
                      <label>Verification code</label>
                      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" />
                    </div>
                  )}

                  {ok && (
                    <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(34,197,94,0.35)' }}>
                      {ok}
                    </div>
                  )}

                  {err && (
                    <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                      {String(err)}
                    </div>
                  )}

                  <div className="row" style={{ marginTop: 12, gap: 10 }}>
                    {!verified && (
                      <button className="btn btn-primary" onClick={verifyCode} disabled={busy || !code.trim()}>
                        {busy ? 'Verifying…' : 'Verify code'}
                      </button>
                    )}
                    <div className="spacer" />
                    <Link className="btn" to="/login">Go to login</Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="field">
                    <label>Full name</label>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ms Mbuyisa" />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@parktownboys.com" />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Use a strong password" />
                  </div>

                  {err && (
                    <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                      {String(err)}
                    </div>
                  )}

                  <div className="row" style={{ marginTop: 12, gap: 10 }}>
                    <button className="btn btn-primary" onClick={register} disabled={busy}>
                      {busy ? 'Creating…' : 'Register as Teacher'}
                    </button>
                    <div className="spacer" />
                    <Link className="muted" to="/register">
                      Learner registration
                    </Link>
                    <Link className="muted" to="/login">
                      Login
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="col-4" />
      </div>
    </Layout>
  )
}
