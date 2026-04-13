import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import ProtectedRoute from '../auth/ProtectedRoute'
import { classroomsApi, type ClassroomDto } from '../api/classrooms.api'
import { subjectsApi, type SubjectDto } from '../api/subjects.api'
import { useAuth } from '../auth/AuthContext'
import { Link, useSearchParams } from 'react-router-dom'
import Loader from '../components/Loader'

export default function ClassroomsPage() {
  const { payload, roles } = useAuth()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') ?? ''
  const teacherId = payload?.sub

  const [items, setItems] = useState<ClassroomDto[]>([])
  const [busy, setBusy] = useState(true)
  const [creating, setCreating] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [gradeId, setGradeId] = useState<number>(8)
  const [subjectId, setSubjectId] = useState<number | null>(null)
  const [subjects, setSubjects] = useState<SubjectDto[]>([])
  const [subjectErr, setSubjectErr] = useState<string | null>(null)

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

  useEffect(() => {
    let isMounted = true
    const loadSubjects = async () => {
      try {
        const data = await subjectsApi.listAll()
        if (!isMounted) return
        setSubjects(data)
        setSubjectErr(null)
      } catch (error: any) {
        if (!isMounted) return
        setSubjectErr('Unable to load subjects. Please try again later.')
      }
    }
    loadSubjects()
    return () => {
      isMounted = false
    }
  }, [])

  const create = async () => {
    if (!teacherId || subjectId === null) return
    setErr(null)
    setCreating(true)
    try {
      await classroomsApi.create({ gradeId, subjectId, teacherUserId: teacherId })
      await load()
      setSelectedGrade(gradeId)
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Failed to create classroom')
    } finally {
      setCreating(false)
    }
  }

  const grades = useMemo(() => {
    const unique = [...new Set(items.map((c) => c.gradeId))].sort((a, b) => a - b)
    return unique
  }, [items])

  const classroomsBySubject = useMemo(() => {
    const effectiveGrade = selectedGrade ?? grades[0] ?? null
    if (effectiveGrade === null) return []
    const trimmedSearch = searchQuery.trim()
    const query = trimmedSearch.toLowerCase()
    const base = items.filter((c) => c.gradeId === effectiveGrade)
    const filtered = trimmedSearch
      ? base.filter((c) => {
          const subjectLabel = (c.subjectName ?? '').toLowerCase()
          return subjectLabel.includes(query) || c.id.toString().includes(query)
        })
      : base

    const map = new Map<number, { subjectId: number; subjectName: string; classrooms: ClassroomDto[] }>()
    for (const classroom of filtered) {
      const subjectLabel = classroom.subjectName?.trim() ?? `Subject ${classroom.subjectId}`
      const key = classroom.subjectId
      if (!map.has(key)) {
        map.set(key, {
          subjectId: key,
          subjectName: subjectLabel,
          classrooms: [],
        })
      }
      map.get(key)!.classrooms.push(classroom)
    }

    return Array.from(map.values())
      .map((group) => ({
        ...group,
        classrooms: group.classrooms.sort((a, b) => a.id - b.id),
      }))
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName))
  }, [items, selectedGrade, searchQuery, grades])

  const activeGrade = selectedGrade ?? grades[0] ?? gradeId

  const subjectsForGrade = useMemo(() => subjects.filter((subject) => subject.gradeId === gradeId), [gradeId, subjects])

  useEffect(() => {
    if (subjectsForGrade.length === 0) {
      if (subjectId !== null) {
        setSubjectId(null)
      }
      return
    }

    if (subjectId !== null && subjectsForGrade.some((s) => s.id === subjectId)) {
      return
    }

    setSubjectId(subjectsForGrade[0].id)
  }, [subjectId, subjectsForGrade])

  return (
    <ProtectedRoute>
      <Layout>
        <div className="grid">
          <div className={roles.includes('Learner') ? 'col-12' : 'col-8'}>
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

                {busy && <Loader label="Loading classrooms..." />}

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

                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {classroomsBySubject.length === 0 ? (
                        <div className="empty">
                          No classrooms found for Grade {activeGrade}. Create one on the right.
                        </div>
                      ) : (
                        classroomsBySubject.map((group) => {
                          const primaryClassroom = group.classrooms[0]
                          if (!primaryClassroom) return null
                          return (
                            <div key={group.subjectId} className="card subject-group-card">
                              <div className="card-h" style={{ alignItems: 'center', gap: 10 }}>
                                <div>
                                  <div style={{ fontWeight: 900 }}>{group.subjectName}</div>
                                  <div className="muted" style={{ marginTop: 4 }}>
                                    {group.classrooms.length} classroom{group.classrooms.length === 1 ? '' : 's'}
                                  </div>
                                </div>
                                <div className="spacer" />
                                <span className="pill">Grade {activeGrade}</span>
                              </div>
                              <div className="card-b" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div className="muted" style={{ fontSize: '0.9rem' }}>
                                  Select this subject to visit its resources page.
                                </div>
                                <Link className="btn btn-primary" to={`/resources?classroomId=${primaryClassroom.id}`}>
                                  View resources
                                </Link>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {!roles.includes('Learner') && (
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
                    <label>Grade</label>
                    <select value={gradeId} onChange={(e) => setGradeId(Number(e.target.value))}>
                      {Array.from({ length: 5 }).map((_, i) => {
                        const grade = 8 + i
                        return (
                          <option key={grade} value={grade}>
                            Grade {grade}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div className="field">
                    <label>Subject</label>
                    <select
                      value={subjectId ?? ''}
                      onChange={(e) => setSubjectId(Number(e.target.value))}
                      disabled={subjectsForGrade.length === 0}
                    >
                      {subjectsForGrade.length === 0 ? (
                        <option value="">
                          No subjects for Grade {gradeId}
                        </option>
                      ) : (
                        subjectsForGrade.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={create}
                    disabled={!teacherId || subjectId === null || creating}
                  >
                    {creating ? (
                      <span className="btn-loading">
                        <span className="loader-spinner loader-spinner-sm" aria-hidden="true" />
                        Creating...
                      </span>
                    ) : (
                      'Create'
                    )}
                  </button>
                  {subjectErr ? (
                    <div className="empty" style={{ marginTop: 12, borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                      {subjectErr}
                    </div>
                  ) : subjectsForGrade.length === 0 ? (
                    <div className="empty" style={{ marginTop: 12, borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                      No subjects are defined for Grade {gradeId}. Ask an admin to add them before creating a classroom.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}