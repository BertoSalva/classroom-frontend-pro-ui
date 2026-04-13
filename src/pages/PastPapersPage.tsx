import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import ProtectedRoute from '../auth/ProtectedRoute'
import { resourcesApi, type ResourceDto } from '../api/resources.api'
import { classroomsApi, type ClassroomDto } from '../api/classrooms.api'
import { subjectsApi, type SubjectDto } from '../api/subjects.api'
import { useSearchParams } from 'react-router-dom'
import Loader from '../components/Loader'

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

const GRADES = [
  { id: 8, name: 'Grade 8' },
  { id: 9, name: 'Grade 9' },
  { id: 10, name: 'Grade 10' },
  { id: 11, name: 'Grade 11' },
  { id: 12, name: 'Grade 12' },
]

export default function PastPapersPage() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') ?? ''
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [selectedTerm, setSelectedTerm] = useState<number | 'all'>('all')
  const [allResources, setAllResources] = useState<ResourceDto[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomDto[]>([])
  const [subjects, setSubjects] = useState<SubjectDto[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const getPaperYear = (resource: ResourceDto) => {
    if (resource.resourceYear) {
      return new Date(resource.resourceYear).getFullYear()
    }
    return new Date(resource.uploadedAt).getFullYear()
  }

  const loadData = async () => {
    setErr(null)
    setBusy(true)
    try {
      const [resourcesData, classroomsData] = await Promise.all([
        resourcesApi.getAll(),
        classroomsApi.list(),
      ])
      setAllResources(resourcesData)
      setClassrooms(classroomsData)
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Failed to load data')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let isMounted = true
    const loadSubjects = async () => {
      try {
        const data = await subjectsApi.listAll()
        if (!isMounted) return
        setSubjects(data)
      } catch (error: any) {
        console.error('Failed to load subjects', error)
      }
    }
    loadSubjects()
    return () => {
      isMounted = false
    }
  }, [])

  const download = async (resourceId: number, filename: string) => {
    setErr(null)
    try {
      const blob = await resourcesApi.download(resourceId)
      downloadBlob(blob, filename)
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Download failed')
    }
  }

  const classroomsById = useMemo(() => {
    const map = new Map<number, ClassroomDto>()
    classrooms.forEach((c) => map.set(c.id, c))
    return map
  }, [classrooms])

  const subjectNamesById = useMemo(() => {
    const map = new Map<number, string>()
    subjects.forEach((subject) => map.set(subject.id, subject.name))
    classrooms.forEach((classroom) => {
      if (!map.has(classroom.subjectId) && classroom.subjectName) {
        map.set(classroom.subjectId, classroom.subjectName)
      }
    })
    return map
  }, [subjects, classrooms])

  const allPastPapers = useMemo(() => {
    return allResources.filter((r) => (r.category || 'Past Papers') === 'Past Papers')
  }, [allResources])

  const gradeCards = useMemo(() => {
    return GRADES.map((g) => {
      const count = allPastPapers.filter((r) => classroomsById.get(r.classroomId)?.gradeId === g.id).length
      return { ...g, count }
    }).filter((g) => g.count > 0)
  }, [allPastPapers, classroomsById])

  const subjectCards = useMemo(() => {
    if (selectedGrade === null) return []

    const counts = new Map<number, number>()
    allPastPapers.forEach((r) => {
      const classroom = classroomsById.get(r.classroomId)
      if (!classroom || classroom.gradeId !== selectedGrade) return
      counts.set(classroom.subjectId, (counts.get(classroom.subjectId) ?? 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([subjectId, count]) => ({
        subjectId,
        subjectName: subjectNamesById.get(subjectId) ?? `Subject ${subjectId}`,
        count,
      }))
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName))
  }, [allPastPapers, classroomsById, selectedGrade, subjectNamesById])

  const subjectPapers = useMemo(() => {
    if (selectedGrade === null || selectedSubjectId === null) return []

    return allPastPapers.filter((r) => {
      const classroom = classroomsById.get(r.classroomId)
      return classroom?.gradeId === selectedGrade && classroom?.subjectId === selectedSubjectId
    })
  }, [allPastPapers, classroomsById, selectedGrade, selectedSubjectId])

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    subjectPapers.forEach((r) => years.add(getPaperYear(r)))
    return Array.from(years).sort((a, b) => b - a)
  }, [subjectPapers])

  const availableTerms = useMemo(() => {
    const terms = new Set<number>()
    subjectPapers.forEach((r) => {
      if (typeof r.term === 'number') terms.add(r.term)
    })
    return Array.from(terms).sort((a, b) => a - b)
  }, [subjectPapers])

  const filteredPapers = useMemo(() => {
    let filtered = subjectPapers.filter((r) => {
      const year = getPaperYear(r)
      const yearMatch = selectedYear === 'all' || year === selectedYear
      const termMatch = selectedTerm === 'all' || r.term === selectedTerm
      return yearMatch && termMatch
    })

    const trimmedSearch = searchQuery.trim()
    if (trimmedSearch) {
      const query = trimmedSearch.toLowerCase()
      filtered = filtered.filter((r) =>
        (r.title || '').toLowerCase().includes(query) ||
        (r.originalFileName || '').toLowerCase().includes(query) ||
        (r.classroomName || '').toLowerCase().includes(query)
      )
    }

    return filtered
  }, [searchQuery, selectedTerm, selectedYear, subjectPapers])

  useEffect(() => {
    if (selectedYear !== 'all' && !availableYears.includes(selectedYear)) {
      setSelectedYear('all')
    }
  }, [availableYears, selectedYear])

  useEffect(() => {
    if (selectedTerm !== 'all' && !availableTerms.includes(selectedTerm)) {
      setSelectedTerm('all')
    }
  }, [availableTerms, selectedTerm])

  const onSelectGrade = (gradeId: number) => {
    setSelectedGrade(gradeId)
    setSelectedSubjectId(null)
    setSelectedYear('all')
    setSelectedTerm('all')
  }

  const onSelectSubject = (subjectId: number) => {
    setSelectedSubjectId(subjectId)
    setSelectedYear('all')
    setSelectedTerm('all')
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="grid">
          <div className="col-12">
            <div className="card">
              <div className="card-h">
                <div className="row">
                  <div>
                    <div style={{ fontWeight: 900 }}>Past Papers</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      Browse by grade, then subject
                    </div>
                  </div>
                  <div className="spacer" />
                  <span className="pill">{filteredPapers.length} papers</span>
                </div>
              </div>
              <div className="card-b">
                {err && (
                  <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                    {String(err)}
                  </div>
                )}

                {selectedGrade === null && !busy && (
                  <>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>Choose a grade</div>
                    <div className="grid">
                      {gradeCards.map((g) => (
                        <div className="col-3" key={g.id}>
                          <button
                            className="card"
                            style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                            onClick={() => onSelectGrade(g.id)}
                          >
                            <div className="card-b">
                              <div style={{ fontWeight: 800 }}>{g.name}</div>
                              <div className="muted" style={{ marginTop: 6 }}>{g.count} papers</div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                    {gradeCards.length === 0 && <div className="empty">No past papers available yet.</div>}
                  </>
                )}

                {selectedGrade !== null && selectedSubjectId === null && !busy && (
                  <>
                    <div className="row" style={{ marginBottom: 12 }}>
                      <button className="btn" onClick={() => setSelectedGrade(null)}>← Back to grades</button>
                    </div>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>
                      Choose a subject for Grade {selectedGrade}
                    </div>
                    <div className="grid">
                      {subjectCards.map((s) => (
                        <div className="col-4" key={s.subjectId}>
                          <button
                            className="card"
                            style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                            onClick={() => onSelectSubject(s.subjectId)}
                          >
                            <div className="card-b">
                              <div style={{ fontWeight: 800 }}>{s.subjectName}</div>
                              <div className="muted" style={{ marginTop: 6 }}>{s.count} papers</div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                    {subjectCards.length === 0 && <div className="empty">No subjects found for this grade.</div>}
                  </>
                )}

                {selectedGrade !== null && selectedSubjectId !== null && (
                  <>
                    <div className="row" style={{ marginBottom: 12, gap: 8 }}>
                      <button className="btn" onClick={() => setSelectedSubjectId(null)}>← Back to subjects</button>
                      <button className="btn" onClick={() => setSelectedGrade(null)}>Back to grades</button>
                    </div>

                    <div className="field" style={{ maxWidth: 400 }}>
                      <label>Filter by Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) =>
                          setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))
                        }
                      >
                        <option value="all">All years</option>
                        {availableYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field" style={{ maxWidth: 400 }}>
                      <label>Filter by Term</label>
                      <select
                        value={selectedTerm}
                        onChange={(e) =>
                          setSelectedTerm(e.target.value === 'all' ? 'all' : Number(e.target.value))
                        }
                      >
                        <option value="all">All terms</option>
                        {availableTerms.map((term) => (
                          <option key={term} value={term}>
                            Term {term}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {busy && <Loader label="Loading past papers..." />}

                {!busy && selectedGrade !== null && selectedSubjectId !== null && filteredPapers.length === 0 && (
                  <div className="empty">No past papers found for the selected filters.</div>
                )}

                {!busy && selectedGrade !== null && selectedSubjectId !== null && filteredPapers.length > 0 && (
                  <div className="table-wrapper">
                    <table className="table" style={{ marginTop: 20 }}>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Classroom</th>
                          <th>File</th>
                          <th>Year</th>
                          <th>Term</th>
                          <th>Uploaded</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPapers.map((r) => (
                          <tr key={r.id}>
                            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{r.title}</td>
                            <td>{r.classroomName}</td>
                            <td>{r.originalFileName}</td>
                            <td>{getPaperYear(r)}</td>
                            <td>{typeof r.term === 'number' ? `Term ${r.term}` : '-'}</td>
                            <td>{new Date(r.uploadedAt).toLocaleDateString()}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn" onClick={() => download(r.id, r.originalFileName)}>
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
