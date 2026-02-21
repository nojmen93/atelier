import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link href="/" className="admin-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Site
          </Link>
          <h1>Admin Dashboard</h1>
          <div />
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-container">
          <section className="admin-section">
            <h2 className="admin-section-title">Tools</h2>
            <div className="admin-cards">
              <Link href="/admin/mockup" className="admin-card">
                <div className="admin-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div className="admin-card-content">
                  <h3>Mockup Generator</h3>
                  <p>Create professional 3D product mockups with client logos</p>
                </div>
                <div className="admin-card-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              <a 
                href="https://your-project.sanity.studio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="admin-card"
              >
                <div className="admin-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="admin-card-content">
                  <h3>Sanity Studio</h3>
                  <p>Manage quotes, portfolio, blog posts, and product catalog</p>
                </div>
                <div className="admin-card-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15,3 21,3 21,9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
              </a>
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section-title">Quick Actions</h2>
            <div className="admin-actions-grid">
              <Link href="/admin/mockup" className="admin-action">
                <span>+ New Mockup</span>
              </Link>
              <a 
                href="https://your-project.sanity.studio/desk/quote" 
                target="_blank"
                rel="noopener noreferrer"
                className="admin-action"
              >
                <span>+ New Quote</span>
              </a>
              <a 
                href="https://your-project.sanity.studio/desk/project" 
                target="_blank"
                rel="noopener noreferrer"
                className="admin-action"
              >
                <span>+ New Project</span>
              </a>
              <a 
                href="https://your-project.sanity.studio/desk/post" 
                target="_blank"
                rel="noopener noreferrer"
                className="admin-action"
              >
                <span>+ New Blog Post</span>
              </a>
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section-title">Workflow</h2>
            <div className="admin-workflow">
              <div className="workflow-step">
                <div className="workflow-number">1</div>
                <h4>Create Mockups</h4>
                <p>Upload client logo and generate professional product mockups</p>
              </div>
              <div className="workflow-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="workflow-step">
                <div className="workflow-number">2</div>
                <h4>Build Quote</h4>
                <p>Add mockups to a new quote with pricing and terms</p>
              </div>
              <div className="workflow-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="workflow-step">
                <div className="workflow-number">3</div>
                <h4>Send to Client</h4>
                <p>Share the secret quote link with your client</p>
              </div>
              <div className="workflow-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="workflow-step">
                <div className="workflow-number">4</div>
                <h4>Get Approval</h4>
                <p>Client reviews and approves directly from their link</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
