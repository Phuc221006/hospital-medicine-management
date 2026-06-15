"use client"

import { useEffect, useCallback } from "react"
import { wsService, type WebSocketMessage, type WebSocketMessageType } from "../websocket"

export function useWebSocket() {
  useEffect(() => {
    wsService.connect()

    return () => {
      // Don't disconnect on unmount - keep connection alive
    }
  }, [])

  const subscribe = useCallback((type: WebSocketMessageType, handler: (message: WebSocketMessage) => void) => {
    return wsService.subscribe(type, handler)
  }, [])

  const subscribeAll = useCallback((handler: (message: WebSocketMessage) => void) => {
    return wsService.subscribeAll(handler)
  }, [])

  const send = useCallback((type: string, payload: unknown) => {
    wsService.send(type, payload)
  }, [])

  return {
    subscribe,
    subscribeAll,
    send,
    isConnected: wsService.isConnected(),
  }
}
