import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import ProtectedRoute from '../auth/ProtectedRoute'
import { resourcesApi, type ResourceDto } from '../api/resources.api'
import { classroomsApi, type ClassroomDto } from '../api/classrooms.api'

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

const GRADES = [
  { id: 1, name: 'Grade 1' },
  { id: 2, name: 'Grade 2' },
  { id: 3, name: 'Grade 3' },
  { id: 4, name: 'Grade 4' },
  { id: 5, name: 'Grade 5' },
  { id: 6, name: 'Grade 6' },
  { id: 7, name: 'Grade 7' },
  { id: 8, name: 'Grade 8' },
  { id: 9, name: 'Grade 9' },
  { id: 10, name: 'Grade 10' },
  { id: 11, name: 'Grade 11' },
  { id: 12, name: 'Grade 12' },
]

export default function PastPapersPage() {
  const [selectedGrade, setSelectedGrade] = useState<number>(1)
  const [allResources, setAllResources] = useState<ResourceDto[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomDto[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

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

    const filtered = allResources.filter((r) => {
      const classroomGrade = classroomGradeMap.get(r.classroomId)
      // Treat empty category as "Past Papers" for backward compatibility
      const category = r.category || 'Past Papers'
      return category === 'Past Papers' && classroomGrade === selectedGrade
    })

    return filtered
  }, [allResources, classrooms, selectedGrade])

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
