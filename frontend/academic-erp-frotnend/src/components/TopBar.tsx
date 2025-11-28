import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'

const TopBar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownCloseTimeoutRef.current) {
        clearTimeout(dropdownCloseTimeoutRef.current)
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch {
      // Even if logout fails, redirect to home
      navigate('/', { replace: true })
    }
  }

  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (dropdownCloseTimeoutRef.current) {
      clearTimeout(dropdownCloseTimeoutRef.current)
      dropdownCloseTimeoutRef.current = null
    }
    setUserDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    // Set timeout to close after 3 seconds
    dropdownCloseTimeoutRef.current = setTimeout(() => {
      setUserDropdownOpen(false)
      dropdownCloseTimeoutRef.current = null
    }, 3000)
  }

  const handleToggleClick = () => {
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
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-200/50 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Side - Logo and Title */}
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
        
        {/* Right Side - User Info with Dropdown */}
        <div 
          className="relative" 
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={handleToggleClick}
            className="flex items-center gap-3 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
            aria-label="User menu"
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
            <div 
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
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
  )
}

export default TopBar

