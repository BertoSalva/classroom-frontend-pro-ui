import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import ProtectedRoute from '../auth/ProtectedRoute'
import { classroomsApi, type ClassroomDto } from '../api/classrooms.api'
import { useAuth } from '../auth/AuthContext'
import { Link } from 'react-router-dom'

export default function ClassroomsPage() {
  const { payload } = useAuth()
  const teacherId = payload?.sub

  const [items, setItems] = useState<ClassroomDto[]>([])
  const [busy, setBusy] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [gradeId, setGradeId] = useState<number>(1)
  const [subjectId, setSubjectId] = useState<number>(1)

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)

  const load = async () => {
    setErr(null)
    setBusy(true)
    try {
      const data = await classroomsApi.list()
      setItems(data)
      if (data.length > 0 && selectedGrade === null) {
        const firstGrade = [...new Set(data.map((c) => c.gradeId))].sort((a, b) => a - b)[0]
        setSelectedGrade(firstGrade ?? null)
      }
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Failed to load classrooms. Make sure you are logged in.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!teacherId) return
    setErr(null)
    try {
      await classroomsApi.create({ name, gradeId, subjectId, teacherUserId: teacherId })
      setName('')
      await load()
      setSelectedGrade(gradeId)
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Failed to create classroom')
    }
  }

  const grades = useMemo(() => {
    const unique = [...new Set(items.map((c) => c.gradeId))].sort((a, b) => a - b)
    return unique
  }, [items])

  const grouped = useMemo(() => {
    const map = new Map<number, ClassroomDto[]>()
    for (const c of items) {
      if (!map.has(c.gradeId)) map.set(c.gradeId, [])
      map.get(c.gradeId)!.push(c)
    }
    return map
  }, [items])

  const classroomsForGrade = useMemo(() => {
    if (selectedGrade === null) return []
    return grouped.get(selectedGrade) ?? []
  }, [grouped, selectedGrade])

  return (
    <ProtectedRoute>
      <Layout>
        <div className="grid">
          <div className="col-8">
            <div className="card">
              <div className="card-h">
                <div className="row">
                  <div>
                    <div style={{ fontWeight: 900 }}>Your classrooms</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      Select a grade to view classes and resources.
                    </div>
                  </div>
                  <div className="spacer" />
                  <span className="pill">{busy ? 'Loading…' : `${items.length} total`}</span>
                </div>
              </div>
              <div className="card-b">
                {err && (
                  <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                    {String(err)}
                  </div>
                )}

                {!busy && grades.length === 0 && <div className="empty">No classrooms yet. Create one on the right.</div>}

                {grades.length > 0 && (
                  <>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
                      {grades.map((g) => (
                        <button
                          key={g}
                          className={`btn ${selectedGrade === g ? 'btn-primary' : ''}`}
                          onClick={() => setSelectedGrade(g)}
                        >
                          Grade {g}
                        </button>
                      ))}
                    </div>

                    <div className="grid" style={{ marginTop: 16 }}>
                      {classroomsForGrade.map((c) => (
                        <div key={c.id} className="col-6">
                          <div className="card">
                            <div className="card-b">
                              <div className="row">
                                <div style={{ fontWeight: 900 }}>{c.name}</div>
                                <div className="spacer" />
                                <span className="pill">Grade {c.gradeId}</span>
                              </div>
                              <div className="muted" style={{ marginTop: 8 }}>
                                Classroom ID: {c.id}
                              </div>
                              <div className="row" style={{ marginTop: 12 }}>
                                <Link className="btn" to={`/resources?classroomId=${c.id}`}>
                                  View resources
                                </Link>
                                <button className="btn" onClick={() => navigator.clipboard.writeText(String(c.id))}>
                                  Copy ID
                                </button>
                                <div className="spacer" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-4">
            <div className="card">
              <div className="card-h">
                <div style={{ fontWeight: 900 }}>Create classroom</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Teachers can create classrooms for learners.
                </div>
              </div>
              <div className="card-b">
                <div className="field">
                  <label>Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maths Term 1" />
                </div>
                <div className="field">
                  <label>Grade</label>
                  <select value={gradeId} onChange={(e) => setGradeId(Number(e.target.value))}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Grade {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Subject</label>
                  <select value={subjectId} onChange={(e) => setSubjectId(Number(e.target.value))}>
                    <option value={1}>Mathematics</option>
                    <option value={2}>English</option>
                    <option value={3}>Science</option>
                    <option value={4}>History</option>
                    <option value={5}>Geography</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={create} disabled={!name.trim() || !teacherId}>
                  Create
                </button>

                <div className="empty" style={{ marginTop: 12 }}>
                  If your API restricts classroom creation by role, add RoleGuard for Teacher/SuperAdmin.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}