import { WS_URL, API_BASE_URL } from "./api-config"

export type WebSocketMessageType =
  | "ALERT_NEW"
  | "ALERT_UPDATE"
  | "STOCK_LOW"
  | "STOCK_EXPIRING"
  | "PRESCRIPTION_NEW"
  | "PRESCRIPTION_UPDATE"
  | "APPOINTMENT_NEW"
  | "APPOINTMENT_UPDATE"
  | "NOTIFICATION"

export interface WebSocketMessage {
  type: WebSocketMessageType
  payload: unknown
  timestamp: string
}

type MessageHandler = (message: WebSocketMessage) => void

class WebSocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private handlers: Map<WebSocketMessageType, Set<MessageHandler>> = new Map()
  private globalHandlers: Set<MessageHandler> = new Set()
  private isConnecting = false

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token || token === "undefined" || token === "null") {
      console.warn("No valid token available for WebSocket connection")
      return
    }

    this.isConnecting = true

    try {
      // Determine websocket base URL:
      // - If WS_URL is configured and starts with ws(s), use it
      // - Otherwise derive from API_BASE_URL (http -> ws, https -> wss) and append /ws
      let base: string
      if (WS_URL && WS_URL.startsWith("ws")) {
        // If WS_URL already points under /api, use it. Otherwise, if API_BASE_URL contains /api
        // prefer deriving from API_BASE_URL so we target the server's context-path.
        const cleanedWs = WS_URL.replace(/\/$/, "")
        if (cleanedWs.includes("/api") || !API_BASE_URL.includes("/api")) {
          base = cleanedWs
        } else {
          const api = API_BASE_URL.replace(/\/$/, "")
          base = api.replace(/^http/, "ws") + "/ws"
        }
      } else {
        const api = API_BASE_URL.replace(/\/$/, "")
        base = api.replace(/^http/, "ws") + "/ws"
      }

      const wsUrl = `${base}?token=${encodeURIComponent(token)}`
      console.debug("Opening WebSocket to:", wsUrl)
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log("WebSocket connected")
        this.reconnectAttempts = 0
        this.isConnecting = false
      }

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.notifyHandlers(message)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      this.socket.onclose = (event) => {
        console.warn("WebSocket disconnected:", event.code, event.reason || '(no reason)')
        this.isConnecting = false
        this.attemptReconnect()
      }

      this.socket.onerror = (event) => {
        // Event may be an ErrorEvent in some environments
        try {
          // Log useful details without throwing
          // ErrorEvent has `message` and `error` properties
          // Generic Event may not be serializable
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const anyEvent: any = event
          if (anyEvent && anyEvent.message) {
            console.error("WebSocket error message:", anyEvent.message)
          } else {
            console.error("WebSocket error event:", event)
          }
        } catch (e) {
          console.error("WebSocket error (logging failed):", e)
        }
        this.isConnecting = false
        // Close socket to trigger reconnect logic if needed
        try {
          this.socket?.close()
        } catch (e) {
          // ignore
        }
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      this.isConnecting = false
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.reconnectAttempts = this.maxReconnectAttempts // Prevent reconnection
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached")
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  private notifyHandlers(message: WebSocketMessage): void {
    // Notify type-specific handlers
    const typeHandlers = this.handlers.get(message.type)
    if (typeHandlers) {
      typeHandlers.forEach((handler) => handler(message))
    }

    // Notify global handlers
    this.globalHandlers.forEach((handler) => handler(message))
  }

  subscribe(type: WebSocketMessageType, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler)
    }
  }

  subscribeAll(handler: MessageHandler): () => void {
    this.globalHandlers.add(handler)

    // Return unsubscribe function
    return () => {
      this.globalHandlers.delete(handler)
    }
  }

  send(type: string, payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }))
    } else {
      console.warn("WebSocket is not connected")
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }
}

export const wsService = new WebSocketService()
