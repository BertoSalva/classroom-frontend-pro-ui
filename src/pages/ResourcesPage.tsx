import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../auth/ProtectedRoute'
import { resourcesApi, type ResourceDto } from '../api/resources.api'
import { classroomsApi, type ClassroomDto } from '../api/classrooms.api'
import { useAuth } from '../auth/AuthContext'

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

const CATEGORIES = ['Past Papers', 'Revision', 'Class work']

export default function ResourcesPage() {
  const [params] = useSearchParams()
  const urlClassroomId = Number(params.get('classroomId') ?? 0)
  const { payload } = useAuth()
  const teacherId = payload?.sub

  const [classrooms, setClassrooms] = useState<ClassroomDto[]>([])
  const [classroomId, setClassroomId] = useState<number>(urlClassroomId)
  const [items, setItems] = useState<ResourceDto[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('Past Papers')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const loadClassrooms = async () => {
    try {
      const data = await classroomsApi.list()
      setClassrooms(data)
      // If URL has a classroom ID and it matches one of the loaded classrooms, use it
      if (urlClassroomId && data.some((c) => c.id === urlClassroomId)) {
        setClassroomId(urlClassroomId)
      } else if (data.length > 0) {
        // Otherwise use the first classroom
        setClassroomId(data[0].id)
      }
    } catch (e: any) {
      setErr('Failed to load classrooms')
    }
  }

  useEffect(() => {
    loadClassrooms()
  }, [])

  const load = async () => {
    if (!classroomId) return
    setErr(null)
    setBusy(true)
    try {
      const data = await resourcesApi.listByClassroom(classroomId)
      // Ensure all items have a category; default to 'Past Papers' if missing
      const withCategories = data.map((item) => ({
        ...item,
        category: item.category || 'Past Papers',
      }))
      setItems(withCategories)
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Failed to load resources')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load()
  }, [classroomId])

  const upload = async () => {
    if (!classroomId || !file || !teacherId) return
    setErr(null)
    setBusy(true)
    try {
      await resourcesApi.upload(classroomId, file, teacherId, selectedCategory)
      setFile(null)
      await load()
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const download = async (resourceId: number, filename: string) => {
    setErr(null)
    try {
      const blob = await resourcesApi.download(resourceId)
      downloadBlob(blob, filename)
    } catch (e: any) {
      setErr(e?.response?.data ?? 'Download failed')
    }
  }

  const filteredRows = useMemo(
    () => items.filter((r) => r.category === selectedCategory),
    [items, selectedCategory]
  )

  const selectedClassroomName = useMemo(
    () => classrooms.find((c) => c.id === classroomId)?.name || 'Unknown',
    [classrooms, classroomId]
  )

  return (
    <ProtectedRoute>
      <Layout>
        <div className="grid">
          <div className="col-8">
            <div className="card">
              <div className="card-h">
                <div className="row">
                  <div>
                    <div style={{ fontWeight: 900 }}>Resources</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {classroomId ? `${selectedClassroomName} (ID: ${classroomId})` : '(select a classroom)'}
                    </div>
                  </div>
                  <div className="spacer" />
                  <span className="pill">{filteredRows.length} files</span>
                </div>
              </div>
              <div className="card-b">
                {classrooms.length === 0 && <div className="empty">No classrooms available. Create one first.</div>}

                {classrooms.length > 0 && (
                  <>
                    <div className="field">
                      <label>Select Classroom</label>
                      <select value={classroomId} onChange={(e) => setClassroomId(Number(e.target.value))}>
                        {classrooms.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Grade {c.gradeId})
                          </option>
                        ))}
                      </select>
                    </div>

                    {err && (
                      <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                        {String(err)}
                      </div>
                    )}

                    <div className="field">
                      <label>Filter by category</label>
                      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {filteredRows.length === 0 && !busy && (
                      <div className="empty">No resources in "{selectedCategory}". Upload a PDF on the right.</div>
                    )}

                    {filteredRows.length > 0 && (
                      <div className="table-wrapper">
                        <table className="table" style={{ marginTop: 10 }}>
                          <thead>
                            <tr>
                              <th>File</th>
                              <th>Uploaded</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRows.map((r) => (
                              <tr key={r.id}>
                                <td style={{ color: 'var(--text)' }}>{r.fileName}</td>
                                <td>{new Date(r.uploadedAt).toLocaleString()}</td>
                                <td style={{ textAlign: 'right' }}>
                                  <button className="btn" onClick={() => download(r.id, r.fileName)}>
                                    Download
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-4">
            <div className="card">
              <div className="card-h">
                <div style={{ fontWeight: 900 }}>Upload PDF</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  For the selected classroom.
                </div>
              </div>
              <div className="card-b">
                <div className="field">
                  <label>File (PDF)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    disabled={!classroomId}
                  />
                </div>
                {file && (
                  <div className="field">
                    <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
                      Selected: <strong>{file.name}</strong>
                    </div>
                  </div>
                )}
                <div className="field">
                  <label>Category</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} disabled={!classroomId}>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={upload}
                  disabled={!classroomId || !file || busy}
                >
                  {busy ? 'Uploading…' : 'Upload'}
                </button>

                <div className="empty" style={{ marginTop: 12 }}>
                  Your backend limits file size to 25MB (MaxPdfBytes) — perfect for worksheets.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}