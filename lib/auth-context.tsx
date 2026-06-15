"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User } from "./types"
import { authService } from "./services/auth-service"
import { wsService } from "./websocket"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken()
      if (token) {
        try {
          const currentUserRaw = await authService.getCurrentUser()
          const currentUser = normalizeUser(currentUserRaw)
          setUser(currentUser)
          localStorage.setItem("user", JSON.stringify(currentUser))
          // Connect WebSocket after successful auth
          wsService.connect()
        } catch {
          // Token invalid, clear everything
          authService.clearTokens()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authService.login({ email, password })
      const access = (response as any).accessToken ?? (response as any).token
      if (access) authService.setTokens(access, response.refreshToken)
      const normalized = normalizeUser(response.user)
      setUser(normalized)
      localStorage.setItem("user", JSON.stringify(normalized))
      wsService.connect()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setIsLoading(true)
    try {
      const response = await authService.loginWithGoogle({ idToken })
      const access = (response as any).accessToken ?? (response as any).token
      if (access) authService.setTokens(access, response.refreshToken)
      const normalized = normalizeUser(response.user)
      setUser(normalized)
      localStorage.setItem("user", JSON.stringify(normalized))
      wsService.connect()
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Normalize backend user shape to frontend `User` type
  function normalizeUser(raw: any): User {
    if (!raw) return null as unknown as User
    return {
      id: raw.id ? String(raw.id) : String(raw?.userId ?? ""),
      email: raw.email,
      name: raw.fullName ?? raw.name ?? "",
      phone: raw.phone ?? undefined,
      avatar: raw.avatarUrl ?? raw.avatar ?? undefined,
      role: raw.role,
      createdAt: raw.createdAt ?? raw.created_at ?? "",
      lastLogin: raw.lastLogin ?? raw.last_login ?? undefined,
    }
  }

  const logout = useCallback(() => {
    authService.logout().catch(console.error)
    authService.clearTokens()
    setUser(null)
    wsService.disconnect()
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      localStorage.setItem("user", JSON.stringify(currentUser))
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        updateUser,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
