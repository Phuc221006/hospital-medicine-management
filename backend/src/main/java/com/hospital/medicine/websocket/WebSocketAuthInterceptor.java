package com.hospital.medicine.websocket;

import com.hospital.medicine.security.JwtTokenProvider;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private static final Logger logger = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);

    public WebSocketAuthInterceptor(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        String query = request.getURI().getQuery();
        if (query != null) {
            String token = UriComponentsBuilder.newInstance()
                    .query(query)
                    .build()
                    .getQueryParams()
                    .getFirst("token");
            logger.debug("WebSocket handshake token present: {}", token != null ? "yes" : "no");
            if (token != null && jwtTokenProvider.validateToken(token)) {
                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                attributes.put("userId", userId);
                // Build Authentication and set into SecurityContext so downstream filters/controllers see authenticated principal
                try {
                    Authentication auth = jwtTokenProvider.getAuthentication(token);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    logger.debug("WebSocket token validated, userId={}", userId);
                } catch (Exception e) {
                    logger.warn("Failed to set SecurityContext for WebSocket handshake", e);
                }
                return true;
            } else {
                logger.debug("WebSocket token missing or invalid");
            }
        }
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No action needed after handshake
    }
}
