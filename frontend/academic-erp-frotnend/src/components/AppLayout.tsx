import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const AppLayout = () => {
  const { refreshUser, isLoading, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Refresh user on mount to ensure we have latest auth state
  useEffect(() => {
    if (!isLoading && !user) {
      void refreshUser()
    }
  }, [isLoading, refreshUser, user])

  const handleSidebarStateChange = (isOpen: boolean) => {
    setSidebarOpen(isOpen)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar onStateChange={handleSidebarStateChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300" style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}>
        {/* Top Bar Component */}
        <TopBar />

        {/* Main Content - No Scrolling */}
        <main className="flex-1 overflow-hidden mt-16">
          <div className="mx-auto w-full px-6 py-8 h-full overflow-hidden animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
