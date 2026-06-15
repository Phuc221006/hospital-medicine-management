"use client"

import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { Footer } from "@/components/landing/footer"
import { LoginForm } from "@/components/auth/login-form"
import { PatientDashboard } from "@/components/patient-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Toaster } from "@/components/ui/toaster"
import { wsService } from "@/lib/websocket"
import { Icons } from "@/components/icons"

function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(wsService.isConnected())
    }

    // Check connection status periodically
    const interval = setInterval(checkConnection, 2000)
    checkConnection()

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg ${
          isConnected ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground border"
        }`}
      >
        {isConnected ? (
          <>
            <Icons.wifi className="h-3 w-3" />
            <span>Đã kết nối</span>
          </>
        ) : (
          <>
            <Icons.wifiOff className="h-3 w-3" />
            <span>Chờ kết nối</span>
          </>
        )}
      </div>
    </div>
  )
}

function AppContent() {
  const { user, isLoading, login, loginWithGoogle, logout, updateUser, isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  // Authenticated user - show appropriate dashboard
  if (isAuthenticated && user) {
    if (user.role === "PATIENT") {
      return (
        <>
          <PatientDashboard user={user} onLogout={logout} onUpdateUser={updateUser} />
          <ConnectionStatus />
        </>
      )
    }
    return (
      <>
        <AdminDashboard user={user} onLogout={logout} />
        <ConnectionStatus />
      </>
    )
  }

  // Show login form
  if (showLogin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header onLogin={() => setShowLogin(true)} />
        <main className="flex flex-1 items-center justify-center p-4">
          <LoginForm onLogin={login} onGoogleLogin={loginWithGoogle} isLoading={isLoading} />
        </main>
        <Footer />
      </div>
    )
  }

  // Landing page
  return (
    <div className="flex min-h-screen flex-col">
      <Header onLogin={() => setShowLogin(true)} />
      <main className="flex-1">
        <HeroSection onLogin={() => setShowLogin(true)} />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}
