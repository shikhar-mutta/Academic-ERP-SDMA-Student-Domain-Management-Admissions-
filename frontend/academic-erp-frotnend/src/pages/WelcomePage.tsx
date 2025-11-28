import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'
import { endpoints } from '../utils/api'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const WelcomePage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthorized, isLoading, refreshUser } = useAuth()

  useEffect(() => {
    // Check for OAuth callback errors
    const error = searchParams.get('error')
    if (error) {
      navigate('/access-denied', {
        replace: true,
        state: { reason: error },
      })
      return
    }

    // If already authenticated, redirect to domains-list
    if (!isLoading && user && isAuthorized) {
      navigate('/domains-list', { replace: true })
    } else if (!isLoading && user && !isAuthorized) {
      navigate('/access-denied', {
        replace: true,
        state: { reason: 'Access denied: Not ERP admin' },
      })
    }
  }, [isAuthorized, isLoading, navigate, searchParams, user])

  // After OAuth callback redirect, refresh user data
  useEffect(() => {
    // Check if we're coming back from OAuth (no error param means success)
    const hasError = searchParams.get('error')
    if (!hasError && !isLoading) {
      // Small delay to ensure cookie is set
      const timer = setTimeout(() => {
        void refreshUser()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading, refreshUser, searchParams])

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}${endpoints.login}`
  }

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12 animate-fade-in">
      <div className="w-full max-w-3xl animate-slide-up">
        {/* Decorative background elements */}
        <div className="relative">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-brand-200/30 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl"></div>

          <div className="relative rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl p-10 shadow-2xl shadow-brand-500/10">
            <div className="mb-10 text-center">
              {/* Logo + Title Group - Professional Header Style */}
              <div className="mx-auto mb-8 flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">Academic ERP</h2>
                  <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700 tracking-wide">
                    SDMA
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 tracking-[0.15em] uppercase">
                  Student Domain Management & Admissions
                </p>
              </div>
            </div>

            {/* Primary Title - Deep Navy, Large */}
            <h1 className="text-[42px] font-bold leading-tight" style={{ color: '#0C1B4D' }}>
              Welcome to the Admissions Portal
            </h1>


            <>
            
            
            
            </>

            {/* Subtitle - Medium-weight, Spaced, Muted */}
            <p className="mt-4 text-base font-medium text-slate-500 tracking-wide">
              Sign in using your ERP-assigned Google account to manage domains, students, and admissions.
            </p>
            <p className="mt-2 text-base font-medium text-slate-500 tracking-wide">
              Only organization's {' '}
              <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-1 rounded-md">
                employee
              </span>{' '}
              are authorized.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            {/* Google Button with Enhanced Hover/Depth Effects */}
            <button
              onClick={handleLogin}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.97]"
            >
              <span className="relative z-10 flex items-center gap-3">
                {/* Google Icon - Left Aligned */}
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
            </button>

            {/* Secure Authentication Text - Smaller with Opacity and Lock Icon */}
            <div className="mt-4 flex items-center gap-2 text-[13px] opacity-60 tracking-wide">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure authentication via Google OAuth</span>
              {/* Google-colored glow dot */}
              <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#4285F4] shadow-sm"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div >
  )
}

export default WelcomePage

