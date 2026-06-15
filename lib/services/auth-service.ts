import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../api-config"
import type { User, AuthResponse } from "../types"

export interface LoginRequest {
  email: string
  password: string
}

export interface GoogleLoginRequest {
  idToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const resp = await apiClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, data)
    const payload = resp && resp.data ? resp.data : resp
    
    // ĐÁNH CHẶN & ÉP LƯU TOKEN TRỰC TIẾP TẠI ĐÂY
    const validToken = payload.accessToken || payload.token;
    if (validToken) {
        payload.token = validToken; // Gán lại cho các hàm khác dễ đọc
        localStorage.setItem("token", validToken); // Ép lưu chặt vào bộ nhớ
        localStorage.setItem("accessToken", validToken); 
    }
    
    return payload as AuthResponse
  },
  async loginWithGoogle(data: GoogleLoginRequest): Promise<AuthResponse> {
    const resp = await apiClient.post<any>(API_ENDPOINTS.AUTH.GOOGLE, data)
    const payload = resp && resp.data ? resp.data : resp
    
    // ĐÁNH CHẶN & ÉP LƯU TOKEN TRỰC TIẾP TẠI ĐÂY
    const validToken = payload.accessToken || payload.token;
    if (validToken) {
        payload.token = validToken; // Gán lại cho các hàm khác dễ đọc
        localStorage.setItem("token", validToken); // Ép lưu chặt vào bộ nhớ
        localStorage.setItem("accessToken", validToken); 
    }
    
    return payload as AuthResponse
  },

  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const resp = await apiClient.post<any>(API_ENDPOINTS.AUTH.REFRESH, data)
    const payload = resp && resp.data ? resp.data : resp
    
    if (payload.accessToken && !payload.token) {
        payload.token = payload.accessToken;
    }
    
    return payload as AuthResponse
  },

  async logout(): Promise<void> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
  },

  async getCurrentUser(): Promise<User> {
    const resp = await apiClient.get<any>(API_ENDPOINTS.AUTH.ME)
    const payload: User = resp && resp.data ? resp.data : resp
    return payload
  },

  // Store tokens
  setTokens(token: string, refreshToken?: string) {
    localStorage.setItem("token", token)
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken)
    }
  },

  getToken(): string | null {
    const t = localStorage.getItem("token")
    if (!t || t === "undefined" || t === "null") return null
    return t
  },

  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken")
  },

  clearTokens() {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}