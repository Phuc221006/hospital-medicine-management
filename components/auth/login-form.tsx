"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void
          prompt: () => void
        }
      }
    }
  }
}

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onGoogleLogin: (idToken: string) => Promise<void>
  isLoading?: boolean
}

export function LoginForm({ onLogin, onGoogleLogin, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const { toast } = useToast()
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    const loadGoogleScript = () => {
      if (document.getElementById("google-signin-script")) {
        setGoogleLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.id = "google-signin-script"
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = () => setGoogleLoaded(true)
      document.body.appendChild(script)
    }

    loadGoogleScript()
  }, [])

  useEffect(() => {
    if (!googleLoaded || !window.google) return

    if (!googleClientId) {
      console.warn("Google Client ID not configured - will show fallback button")
      return
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (response.credential) {
            await onGoogleLogin(response.credential)
          }
        },
      })

      const buttonElement = document.getElementById("google-signin-button")
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          locale: "vi",
        })
      }
    } catch (error) {
      console.error("Failed to initialize Google Sign-In:", error)
    }
  }, [googleLoaded, onGoogleLogin, googleClientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onLogin(email, password)
    } catch (err: any) {
      const message = err?.message || "Đăng nhập thất bại"
      toast({
        title: "Đăng nhập thất bại",
        description: message,
        // leave default styling
      })
    }
  }

  const handleGoogleClick = () => {
    if (window.google && googleClientId) {
      try {
        window.google.accounts.id.prompt()
      } catch (e) {
        console.warn("Google prompt failed, using fallback", e)
        onGoogleLogin("demo-google-token")
      }
    } else {
      // Fallback - simulate for demo or when client id not configured
      onGoogleLogin("demo-google-token")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Icons.pill className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        <CardDescription>Đăng nhập để truy cập hệ thống quản lý tủ thuốc</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div id="google-signin-button" className="w-full" />

        {/* Fallback button if Google SDK doesn't load or if client id missing */}
        {(!googleLoaded || !googleClientId) && (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 bg-transparent"
            onClick={handleGoogleClick}
            disabled={isLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
              Đăng nhập bằng Google
          </Button>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Hoặc đăng nhập Admin</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Icons.eyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Icons.view className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
