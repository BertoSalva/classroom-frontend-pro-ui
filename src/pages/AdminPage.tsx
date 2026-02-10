import Layout from '../components/Layout'
import ProtectedRoute from '../auth/ProtectedRoute'
import RoleGuard from '../auth/RoleGuard'

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={['SuperAdmin', 'Super Admin', 'Admin']}>
        <Layout>
          <div className="grid">
            <div className="col-12">
              <div className="card">
                <div className="card-h">
                  <div style={{ fontWeight: 900 }}>Admin</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Manage grades, subjects, and users.
                  </div>
                </div>
                <div className="card-b">
                  <div className="empty">
                    Hook this page to your admin endpoints:
                    <div className="muted" style={{ marginTop: 8, lineHeight: 1.8 }}>
                      • GET/POST /api/v1/admin/grades<br/>
                      • POST /api/v1/admin/subjects
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </RoleGuard>
    </ProtectedRoute>
  )
}
