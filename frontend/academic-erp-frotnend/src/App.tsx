import { Navigate, Route, Routes } from 'react-router-dom'
import AccessDeniedPage from './pages/AccessDeniedPage'
import DomainsListPage from './pages/DomainsListPage'
import ViewDomainStudentsPage from './pages/ViewDomainStudentsPage'
import EditDomainPage from './pages/EditDomainPage'
import ViewDomainPage from './pages/ViewDomainPage'
import WelcomePage from './pages/WelcomePage'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import { useAuth } from './utils/useAuth'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/domains-list" element={<DomainsListPage />} />
          <Route path="/domains/:domainId/view" element={<ViewDomainPage />} />
          <Route path="/domains/:domainId/edit" element={<EditDomainPage />} />
          <Route path="/domains/:domainId/students" element={<ViewDomainStudentsPage />} />
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to={user ? '/domains-list' : '/'} replace />}
      />
    </Routes>
  )
}

export default App
