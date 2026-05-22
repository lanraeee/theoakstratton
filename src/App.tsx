import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AlertProvider } from './contexts/AlertContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import AlertNotifications from './components/common/AlertNotifications'

// Pages
import LandingPage from './pages/Landing'
import LoginPage from './pages/Admin/LoginPage'
import DashboardPage from './pages/Admin/DashboardPage'
import LeadsPage from './pages/Admin/LeadsPage'
import TemplatesPage from './pages/Admin/TemplatesPage'
import AnalyticsPage from './pages/Admin/AnalyticsPage'
import NotFoundPage from './pages/NotFound'

function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <AlertNotifications />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leads"
              element={
                <ProtectedRoute>
                  <LeadsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/templates"
              element={
                <ProtectedRoute>
                  <TemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
