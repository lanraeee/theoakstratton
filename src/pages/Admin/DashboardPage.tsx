import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-gray-200">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dark">Oakstratton Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            <button
              onClick={logout}
              className="btn btn-outline text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Metric Cards */}
          {[
            { label: 'Total Leads', value: '1,234', icon: '👥' },
            { label: 'New This Week', value: '42', icon: '✨' },
            { label: 'Active Templates', value: '8', icon: '📧' },
            { label: 'Engagement Rate', value: '68%', icon: '📈' },
          ].map((metric) => (
            <div key={metric.label} className="card p-6">
              <div className="text-3xl mb-2">{metric.icon}</div>
              <p className="text-gray-600 text-sm mb-2">{metric.label}</p>
              <p className="text-3xl font-bold text-dark">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavCard
            icon="📋"
            title="Manage Leads"
            description="View, filter, and manage all your leads"
            href="/admin/leads"
          />
          <NavCard
            icon="📧"
            title="Email Templates"
            description="Create and edit email templates"
            href="/admin/templates"
          />
          <NavCard
            icon="📊"
            title="Analytics"
            description="View detailed analytics and reports"
            href="/admin/analytics"
          />
        </div>

        {/* Coming Soon */}
        <div className="mt-12 p-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border-2 border-dashed border-primary-200">
          <h2 className="text-2xl font-bold text-dark mb-2">Phase 1 Complete</h2>
          <p className="text-gray-600">
            The admin dashboard is now in place. Phase 2 will add full functionality:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>✅ Authentication system with JWT</li>
            <li>✅ Database schema for admin features</li>
            <li>✅ API endpoints scaffolding</li>
            <li>⏳ Full admin dashboard with real data</li>
            <li>⏳ Email template editor with WYSIWYG</li>
            <li>⏳ Advanced analytics and reporting</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

function NavCard({ icon, title, description, href }: any) {
  return (
    <a
      href={href}
      className="card p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </a>
  )
}
