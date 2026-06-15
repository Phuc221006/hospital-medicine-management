package com.hospital.medicine.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketHandler.class);
    private final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public WebSocketHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId != null) {
            userSessions.put(userId, session);
            logger.info("WebSocket connection established for user: {}", userId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Handle incoming messages if needed
        String payload = message.getPayload();
        logger.debug("Received message: {}", payload);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId != null) {
            userSessions.remove(userId);
            logger.info("WebSocket connection closed for user: {}", userId);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        logger.error("WebSocket transport error", exception);
    }

    // Send message to specific user
    public void sendToUser(Long userId, WebSocketMessage message) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String json = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(json));
            } catch (IOException e) {
                logger.error("Error sending message to user {}", userId, e);
            }
        }
    }

    // Broadcast message to all connected users
    public void broadcast(WebSocketMessage message) {
        String json;
        try {
            json = objectMapper.writeValueAsString(message);
        } catch (IOException e) {
            logger.error("Error serializing message", e);
            return;
        }

        userSessions.values().forEach(session -> {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(json));
                } catch (IOException e) {
                    logger.error("Error broadcasting message", e);
                }
            }
        });
    }

    // Broadcast to all admin users
    public void broadcastToAdmins(WebSocketMessage message, java.util.Set<Long> adminUserIds) {
        String json;
        try {
            json = objectMapper.writeValueAsString(message);
        } catch (IOException e) {
            logger.error("Error serializing message", e);
            return;
        }

        adminUserIds.forEach(userId -> {
            WebSocketSession session = userSessions.get(userId);
            if (session != null && session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(json));
                } catch (IOException e) {
                    logger.error("Error sending to admin {}", userId, e);
                }
            }
        });
    }

    public boolean isUserConnected(Long userId) {
        WebSocketSession session = userSessions.get(userId);
        return session != null && session.isOpen();
    }

    public int getConnectedUsersCount() {
        return (int) userSessions.values().stream().filter(WebSocketSession::isOpen).count();
    }
}
