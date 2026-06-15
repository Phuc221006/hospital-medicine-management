import { API_BASE_URL } from "./api-config"

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options

    // Normalize base and endpoint to ensure requests always hit backend `.../api/...`
    const base = (this.baseUrl || "").replace(/\/$/, "")
    let path = endpoint || ""
    if (!path.startsWith("/")) path = `/${path}`

    // If neither base nor endpoint contains '/api', inject it (backend uses context-path /api)
    const baseHasApi = /\/api(\/|$)/.test(base)
    const pathHasApi = /\/api(\/|$)/.test(path)
    const fullPath = baseHasApi || pathHasApi ? `${base}${path}` : `${base}/api${path}`

    const urlObj = new URL(fullPath, window?.location?.origin)

    // Add query params
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          urlObj.searchParams.append(key, String(value))
        }
      })
    }

    const token = this.getToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    }

    if (token) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(urlObj.toString(), {
      ...fetchOptions,
      headers,
    })

    // Try to parse JSON body
    const text = await response.text()
    let data: any = null
    try {
      data = text ? JSON.parse(text) : null
    } catch (e) {
      // Non-JSON response
      data = text
    }

    if (!response.ok) {
      // Backend often returns { success, message, data }
      const message = data && data.message ? data.message : `HTTP ${response.status}`
      throw new Error(message)
    }

    // Unwrap common API wrapper { success, message, data }
    if (data && typeof data === "object" && "data" in data) {
      return data.data as T
    }

    return data as T
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params })
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  patch<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      params,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
