import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import IndividualDashboard from './IndividualDashboard'
import NRIDashboard from './NRIDashboard'
import { CorporateDashboard, FieldForceDashboard } from './CorporateAndFieldDashboards'

export default function Dashboard() {
  const { profile } = useAuth()
  const role = profile?.role || 'individual'
  if (role === 'admin') return <Navigate to="/admin" replace />
  const dashboards = {
    individual: <IndividualDashboard />,
    nri: <NRIDashboard />,
    corporate: <CorporateDashboard />,
    field_force: <FieldForceDashboard />,
  }
  return dashboards[role] || <IndividualDashboard />
}
