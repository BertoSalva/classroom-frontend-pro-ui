import Layout from '../components/Layout'

export default function DashboardPage() {
  return (
    <Layout>
      <div className="grid">
        <div className="col-8">
          <div className="card">
            <div className="card-h">
              <div style={{ fontWeight: 800 }}>Welcome back</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Quick view of your teaching/learning space.
              </div>
            </div>
            <div className="card-b">
              <div className="grid">
                <div className="col-4">
                  <div className="card" style={{ padding: 14 }}>
                    <div className="muted">Active classrooms</div>
                    <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>—</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card" style={{ padding: 14 }}>
                    <div className="muted">Resources uploaded</div>
                    <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>—</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card" style={{ padding: 14 }}>
                    <div className="muted">Pending enrollments</div>
                    <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>—</div>
                  </div>
                </div>
              </div>
              <div className="empty" style={{ marginTop: 14 }}>
                Hook these stats to your API once you add endpoints for dashboards.
              </div>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <div style={{ fontWeight: 800 }}>Getting started</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Your normal flow:
              </div>
            </div>
            <div className="card-b">
              <ol className="muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                <li>Register / login</li>
                <li>Create or join a classroom</li>
                <li>Upload PDFs for learners</li>
                <li>Download resources anytime</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
