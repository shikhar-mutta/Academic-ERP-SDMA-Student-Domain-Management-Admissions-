import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'

const AccessDeniedPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const reason =
    new URLSearchParams(location.search).get('reason') ||
    (location.state as { reason?: string } | undefined)?.reason ||
    'This account is not authorized to use the admissions console.'

  const handleBackToHome = async () => {
    // Logout to clear session and cookies
    await logout()
    // Navigate to welcome page
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 px-4 py-12 animate-fade-in">
      <div className="w-full max-w-xl animate-scale-in">
        <div className="relative rounded-3xl border border-red-100/50 bg-white/90 backdrop-blur-xl p-12 text-center shadow-2xl shadow-red-500/10">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-red-200/20 blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-orange-200/20 blur-2xl"></div>
          
          <div className="relative">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 text-4xl text-red-600 shadow-lg shadow-red-500/20">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold text-slate-900">
              Access Denied
            </h1>
            
            <div className="mt-6 rounded-xl bg-red-50/50 p-4 border border-red-100">
              <p className="text-base font-medium text-red-800">{reason}</p>
            </div>
            
            <p className="mt-6 text-sm text-slate-600 leading-relaxed">
              Please sign in with an authorized account (email contains
              <span className="mx-1 font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                employee
              </span>
              ).
            </p>
            
            <button
              onClick={handleBackToHome}
              className="group mt-8 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-500/40 active:scale-95"
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to welcome page
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessDeniedPage

