export default function LandingPage() {
  return (
    <div className="min-h-screen bg-light">
      {/* Hero Section - will be replaced with full landing page design */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-20">
        <div className="container text-center">
          <h1 className="text-5xl font-bold mb-4">Oakstratton BNPL Solutions</h1>
          <p className="text-xl mb-8 opacity-90">
            Modernized landing page coming soon with hero slider and 3D animations
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/admin/login" className="btn btn-primary bg-white text-primary-500 hover:bg-gray-100">
              Admin Dashboard
            </a>
            <button className="btn btn-secondary border-2 border-white">
              Get Early Access
            </button>
          </div>
        </div>
      </section>

      {/* Placeholder sections */}
      <section className="py-20 text-center">
        <div className="container">
          <h2 className="text-4xl font-bold mb-4">Landing Page Under Construction</h2>
          <p className="text-gray-600">
            Phase 2 will feature hero slider, modern design, and 3D animations
          </p>
        </div>
      </section>
    </div>
  )
}
