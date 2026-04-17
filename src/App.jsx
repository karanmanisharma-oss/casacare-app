import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Sidebar from './components/shared/Sidebar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import { CorporateDashboard, FieldForceDashboard } from './pages/CorporateAndFieldDashboards'
import AdminDashboard from './pages/AdminDashboard'
import HealthCheck from './pages/HealthCheck'
import ResetPassword from './pages/ResetPassword'
import { useSessionGuard } from './hooks/useSessionGuard'

function AppLayout() {
  const { user, loading } = useAuth()
  useSessionGuard()
  if (loading) return <div className="loading-screen"><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="depth-shell" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        padding: '32px',
        overflowY: 'auto',
        background: 'transparent',
        minHeight: '100vh',
      }} className="main-content">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            padding: 72px 16px 24px 16px !important;
          }
        }
      `}</style>
    </div>
  )
}

function PublicRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/field-force" element={<AdminDashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/amc" element={<CorporateDashboard />} />
          <Route path="/my-jobs" element={<FieldForceDashboard />} />
          <Route path="/book" element={<Tickets />} />
          <Route path="/properties" element={<Dashboard />} />
          <Route path="/reports" element={<Dashboard />} />
          <Route path="/sla" element={<Dashboard />} />
          <Route path="/scan" element={<Dashboard />} />
          <Route path="/proof" element={<Dashboard />} />
          <Route path="/team" element={<Dashboard />} />
        </Route>
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
