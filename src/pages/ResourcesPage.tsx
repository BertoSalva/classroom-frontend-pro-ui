import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../auth/ProtectedRoute'
import { resourcesApi, type ResourceDto } from '../api/resources.api'
import { useAuth } from '../auth/AuthContext'

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function ResourcesPage() {
  const [params] = useSearchParams()
  const classroomId = Number(params.get('classroomId') ?? 0)
  const { payload } = useAuth()
  const teacherId = payload?.sub

  const [items, setItems] = useState<ResourceDto[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const load = async () => {
    if (!classroomId) return
    setErr(null)
    setBusy(true)
    try {
      const data = await resourcesApi.listByClassroom(classroomId)
      setItems(data)
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
      await resourcesApi.upload(classroomId, file, teacherId)
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

  const rows = useMemo(() => items, [items])

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
                      Classroom {classroomId ? `#${classroomId}` : '(select a classroom)'}
                    </div>
                  </div>
                  <div className="spacer" />
                  <span className="pill">{rows.length} files</span>
                </div>
              </div>
              <div className="card-b">
                {!classroomId && <div className="empty">Open resources from a classroom card: "View resources".</div>}

                {err && (
                  <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                    {String(err)}
                  </div>
                )}

                {classroomId && rows.length === 0 && !busy && <div className="empty">No resources yet. Upload a PDF on the right.</div>}

                {classroomId && rows.length > 0 && (
                  <table className="table" style={{ marginTop: 10 }}>
                    <thead>
                      <tr>
                        <th>File</th>
                        <th>Uploaded</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
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
                  <input ref={fileInputRef} type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} disabled={!classroomId} />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!file) {
                      fileInputRef.current?.click()
                      return
                    }
                    upload()
                  }}
                  disabled={!classroomId || busy}
                >
                  {busy ? 'Uploading…' : file ? 'Upload' : 'Select file'}
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