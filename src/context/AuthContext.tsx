import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  loginRequest,
  logoutRequest,
  refreshTokenRequest,
} from '../api/auth.api'
import { setAuthToken } from '../api/axios.config'
import type { AuthUser, LoginPayload, UserRole } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<string | null>
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'simcomp-auth'

interface AuthStorage {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (raw) {
      try {
        const parsed: AuthStorage = JSON.parse(raw)
        setUser(parsed.user)
        setAccessToken(parsed.accessToken)
        setRefreshToken(parsed.refreshToken)
        setAuthToken(parsed.accessToken)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    setIsLoading(false)
  }, [])

  const persistSession = useCallback(
    (nextUser: AuthUser, nextAccessToken: string, nextRefreshToken: string) => {
      setUser(nextUser)
      setAccessToken(nextAccessToken)
      setRefreshToken(nextRefreshToken)
      setAuthToken(nextAccessToken)

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: nextUser,
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
        }),
      )
    },
    [],
  )

  const clearSession = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await loginRequest(payload)
      persistSession(data.user, data.accessToken, data.refreshToken)
    },
    [persistSession],
  )

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await logoutRequest(refreshToken)
      }
    } catch {
      // ignorar error
    }

    clearSession()
  }, [refreshToken, clearSession])

  const refreshSession = useCallback(async () => {
    if (!refreshToken) {
      clearSession()
      return null
    }

    try {
      const data = await refreshTokenRequest(refreshToken)
      persistSession(data.user, data.accessToken, data.refreshToken)
      return data.accessToken
    } catch {
      clearSession()
      return null
    }
  }, [refreshToken, clearSession, persistSession])

  const hasRole = useCallback(
    (roles: UserRole[]) => {
      if (!user) return false
      return roles.includes(user.rol)
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login,
      logout,
      refreshSession,
      hasRole,
    }),
    [user, accessToken, refreshToken, isLoading, login, logout, refreshSession, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider')
  }

  return context
}