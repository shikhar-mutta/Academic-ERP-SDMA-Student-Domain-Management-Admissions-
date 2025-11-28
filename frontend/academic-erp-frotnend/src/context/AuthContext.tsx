import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { apiClient, oauthClient, endpoints } from '../utils/api'
import type { UserProfile } from '../models'

interface AuthContextValue {
  user: UserProfile | null
  isAuthorized: boolean
  isLoading: boolean
  login: (profile: UserProfile) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{
        email: string
        name: string
        picture?: string
      }>(endpoints.currentUser)

      const profile: UserProfile = {
        email: data.email,
        name: data.name,
        picture: data.picture,
      }

      setUser(profile)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  // Refresh user when coming back from OAuth callback
  useEffect(() => {
    const handleFocus = () => {
      // Refresh user when window regains focus (after OAuth redirect)
      if (document.hasFocus()) {
        void refreshUser()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshUser])

  const login = useCallback((profile: UserProfile) => {
    setUser(profile)
  }, [])

  const logout = useCallback(async () => {
    try {
      await oauthClient.post(endpoints.signout)
    } catch {
      // Ignore errors during logout
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const isAuthorized =
      !!user &&
      user.email.toLowerCase().includes('employee')

    return {
      user,
      isAuthorized,
      isLoading,
      login,
      logout,
      refreshUser,
    }
  }, [isLoading, login, logout, refreshUser, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

