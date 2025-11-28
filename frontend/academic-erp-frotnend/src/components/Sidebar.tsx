import { useEffect, useState, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface SidebarProps {
  onStateChange?: (isOpen: boolean) => void
}

interface SidebarLink {
  to: string
  label: string
  icon: string
}

const Sidebar = ({ onStateChange }: SidebarProps) => {
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  const [clickedOpen, setClickedOpen] = useState(false)
  const autoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Determine if sidebar should be open (hover or clicked)
  const shouldSidebarBeOpen = isHovered || clickedOpen

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(shouldSidebarBeOpen)
    }
  }, [shouldSidebarBeOpen, onStateChange])

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

  const sidebarLinks: SidebarLink[] = [
    { 
      to: '/domains-list', 
      label: 'Domains', 
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
    },
  ]

  return (
    <>
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
        aria-label={shouldSidebarBeOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {shouldSidebarBeOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          )}
        </svg>
      </button>
    </>
  )
}

export default Sidebar

