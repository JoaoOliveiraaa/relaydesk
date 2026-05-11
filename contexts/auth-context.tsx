"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { clearAuthSession, getAccessToken, getTenantSlug, setAuthSession } from "@/lib/auth-storage"

export type AuthUser = {
  id: string
  email: string
  role: string
  tenant: { id: string; name: string; slug: string; plan: string }
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (tenantSlug: string, email: string, password: string) => Promise<void>
  register: (params: {
    tenantName: string
    tenantSlug: string
    email: string
    password: string
  }) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  const refreshMe = React.useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get<AuthUser>("/auth/me")
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refreshMe()
  }, [refreshMe])

  const login = React.useCallback(async (tenantSlug: string, email: string, password: string) => {
    const { data } = await api.post<{
      accessToken: string
      refreshToken: string
      user: { id: string; email: string; role: string; tenantId: string }
    }>("/auth/login", { tenantSlug, email, password })
    setAuthSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tenantSlug,
    })
    await refreshMe()
  }, [refreshMe])

  const register = React.useCallback(
    async (params: { tenantName: string; tenantSlug: string; email: string; password: string }) => {
      const { data } = await api.post<{
        accessToken: string
        refreshToken: string
        tenant: { id: string; slug: string; name: string }
      }>("/auth/register", params)
      setAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tenantSlug: params.tenantSlug,
      })
      await refreshMe()
    },
    [refreshMe],
  )

  const logout = React.useCallback(() => {
    clearAuthSession()
    setUser(null)
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, loading, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return ctx
}

export function useTenantSlug(): string | null {
  return typeof window === "undefined" ? null : getTenantSlug()
}
