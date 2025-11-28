import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'

const ProtectedRoute = () => {
  const { user, isAuthorized, isLoading } = useAuth()
  const location = useLocation()

  // Wait for auth check to complete
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin-slow rounded-full border-4 border-brand-200 border-t-brand-600"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (!isAuthorized) {
    return <Navigate to="/access-denied" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

