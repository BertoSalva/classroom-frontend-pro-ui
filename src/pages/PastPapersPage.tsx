import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import ProtectedRoute from '../auth/ProtectedRoute'
import { resourcesApi, type ResourceDto } from '../api/resources.api'
import { classroomsApi, type ClassroomDto } from '../api/classrooms.api'
import { useSearchParams } from 'react-router-dom'

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
  const [selectedGrade, setSelectedGrade] = useState<number>(1)
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [allResources, setAllResources] = useState<ResourceDto[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomDto[]>([])
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

  const download = async (resourceId: number, filename: string) => {
    setErr(null)
    try {
      const blob = await resourcesApi.download(resourceId)
      downloadBlob(blob, filename)
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Download failed')
    }
  }

  // Filter by selected grade and "Past Papers" category
  const filteredPapers = useMemo(() => {
    // Create a map of classroomId -> gradeId
    const classroomGradeMap = new Map<number, number>()
    classrooms.forEach((c) => classroomGradeMap.set(c.id, c.gradeId))

    let filtered = allResources.filter((r) => {
      const classroomGrade = classroomGradeMap.get(r.classroomId)
      // Treat empty category as "Past Papers" for backward compatibility
      const category = r.category || 'Past Papers'
      const year = getPaperYear(r)
      const yearMatch = selectedYear === 'all' || year === selectedYear
      return category === 'Past Papers' && classroomGrade === selectedGrade && yearMatch
    })

    // Apply search filter - check both trimmed and original
    const trimmedSearch = searchQuery.trim()
    if (trimmedSearch && trimmedSearch.length > 0) {
      const query = trimmedSearch.toLowerCase()
      filtered = filtered.filter((r) => 
        (r.title && r.title.toLowerCase().includes(query)) ||
        (r.originalFileName && r.originalFileName.toLowerCase().includes(query)) ||
        (r.classroomName && r.classroomName.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [allResources, classrooms, selectedGrade, selectedYear, searchQuery])

  const availableYears = useMemo(() => {
    const classroomGradeMap = new Map<number, number>()
    classrooms.forEach((c) => classroomGradeMap.set(c.id, c.gradeId))

    const years = new Set<number>()
    allResources.forEach((r) => {
      const classroomGrade = classroomGradeMap.get(r.classroomId)
      const category = r.category || 'Past Papers'
      if (category === 'Past Papers' && classroomGrade === selectedGrade) {
        years.add(getPaperYear(r))
      }
    })

    return Array.from(years).sort((a, b) => b - a)
  }, [allResources, classrooms, selectedGrade])

  useEffect(() => {
    if (selectedYear !== 'all' && !availableYears.includes(selectedYear)) {
      setSelectedYear('all')
    }
  }, [availableYears, selectedYear])

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
                      Browse past papers by grade
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

                <div className="field" style={{ maxWidth: 400 }}>
                  <label>Select Grade</label>
                  <select value={selectedGrade} onChange={(e) => setSelectedGrade(Number(e.target.value))}>
                    {GRADES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
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

                {busy && <div className="empty">Loading...</div>}

                {!busy && filteredPapers.length === 0 && (
                  <div className="empty">No past papers available for Grade {selectedGrade}.</div>
                )}

                {!busy && filteredPapers.length > 0 && (
                  <div className="table-wrapper">
                    <table className="table" style={{ marginTop: 20 }}>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Classroom</th>
                          <th>File</th>
                          <th>Year</th>
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
