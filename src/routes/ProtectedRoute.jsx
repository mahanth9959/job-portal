import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export function RoleRoute({ roles, children }) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
