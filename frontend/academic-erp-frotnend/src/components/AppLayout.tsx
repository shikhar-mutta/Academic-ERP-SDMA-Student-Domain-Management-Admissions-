import { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'

const AppLayout = () => {
  const { user, logout, refreshUser, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [clickedOpen, setClickedOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const autoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Refresh user on mount to ensure we have latest auth state
  useEffect(() => {
    if (!isLoading && !user) {
      void refreshUser()
    }
  }, [isLoading, refreshUser, user])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownCloseTimeoutRef.current) {
        clearTimeout(dropdownCloseTimeoutRef.current)
      }
    }
  }, [])


  // Handle auto-close after 30 seconds when clicked
  useEffect(() => {
    if (clickedOpen) {
      // Clear any existing timeout
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current)
      }
      
      // Set new timeout to close after 30 seconds
      autoCloseTimeoutRef.current = setTimeout(() => {
        setClickedOpen(false)
      }, 30000) // 30 seconds

      return () => {
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current)
        }
      }
    }
  }, [clickedOpen])

  // Determine if sidebar should be open (hover or clicked)
  const shouldSidebarBeOpen = isHovered || clickedOpen

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch {
      // Even if logout fails, redirect to home
      navigate('/', { replace: true })
    }
  }

  const handleSidebarToggle = () => {
    const newState = !clickedOpen
    setClickedOpen(newState)
    setIsHovered(false) // Reset hover state when clicking
    
    // Clear any existing timeout
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current)
      autoCloseTimeoutRef.current = null
    }
  }

  const handleSidebarMouseEnter = () => {
    if (!clickedOpen) {
      setIsHovered(true)
    }
  }

  const handleSidebarMouseLeave = () => {
    if (!clickedOpen) {
      setIsHovered(false)
    }
  }

  const sidebarLinks = [
    { to: '/domains-list', label: 'Domains', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${shouldSidebarBeOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 shadow-lg transition-all duration-300 flex flex-col fixed left-0 top-16 bottom-0 z-30`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto pt-8">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to)
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive: active }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200',
                    active || isActive
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-500/30'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
              >
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
                {shouldSidebarBeOpen && <span>{link.label}</span>}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* Drawer Toggle Button - Half on sidebar, Circular */}
      <button
        onClick={handleSidebarToggle}
        className="fixed z-50 bg-white border-2 border-slate-300 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-slate-50 transition-all duration-300"
        style={{ 
          left: shouldSidebarBeOpen ? 'calc(256px - 20px)' : 'calc(80px - 20px)',
          top: 'calc(50% + 2rem)',
          transform: 'translateY(-50%)'
        }}
      >
        <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {shouldSidebarBeOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          )}
        </svg>
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300" style={{ marginLeft: shouldSidebarBeOpen ? '256px' : '80px' }}>
        {/* Fixed Top Bar - Full Width */}
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-200/50 bg-white/95 backdrop-blur-xl shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30 flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Academic ERP SDMA</h1>
                <p className="text-xs text-slate-500">Student Domain Management & Admissions</p>
              </div>
            </div>
            
            {/* User Info at Right with Dropdown */}
            <div className="relative" ref={dropdownRef}
                 onMouseEnter={() => {
                   // Clear any pending close timeout
                   if (dropdownCloseTimeoutRef.current) {
                     clearTimeout(dropdownCloseTimeoutRef.current)
                     dropdownCloseTimeoutRef.current = null
                   }
                   setUserDropdownOpen(true)
                 }}
                 onMouseLeave={() => {
                   // Set timeout to close after 3 seconds
                   dropdownCloseTimeoutRef.current = setTimeout(() => {
                     setUserDropdownOpen(false)
                     dropdownCloseTimeoutRef.current = null
                   }, 3000)
                 }}
            >
              <button
                onClick={() => {
                  if (userDropdownOpen) {
                    // If open, close immediately and cancel timeout
                    if (dropdownCloseTimeoutRef.current) {
                      clearTimeout(dropdownCloseTimeoutRef.current)
                      dropdownCloseTimeoutRef.current = null
                    }
                    setUserDropdownOpen(false)
                  } else {
                    // If closed, open and set 3-second auto-close
                    setUserDropdownOpen(true)
                    // Clear any existing timeout
                    if (dropdownCloseTimeoutRef.current) {
                      clearTimeout(dropdownCloseTimeoutRef.current)
                    }
                    // Set timeout to close after 3 seconds
                    dropdownCloseTimeoutRef.current = setTimeout(() => {
                      setUserDropdownOpen(false)
                      dropdownCloseTimeoutRef.current = null
                    }, 3000)
                  }
                }}
                className="flex items-center gap-3 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
              >
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-10 w-10 rounded-full border-2 border-white shadow-md object-cover ring-2 ring-brand-200 flex-shrink-0"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold shadow-md ring-2 ring-brand-200 flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'E'}
              </div>
            )}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              </div>
                <svg 
                  className={`h-4 w-4 text-slate-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                     onMouseEnter={() => {
                       // Clear any pending close timeout
                       if (dropdownCloseTimeoutRef.current) {
                         clearTimeout(dropdownCloseTimeoutRef.current)
                         dropdownCloseTimeoutRef.current = null
                       }
                       setUserDropdownOpen(true)
                     }}
                     onMouseLeave={() => {
                       // Set timeout to close after 3 seconds
                       dropdownCloseTimeoutRef.current = setTimeout(() => {
                         setUserDropdownOpen(false)
                         dropdownCloseTimeoutRef.current = null
                       }, 3000)
                     }}
                >
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
                    Logout
          </button>
        </div>
              )}
            </div>
          </div>
        </header>

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
