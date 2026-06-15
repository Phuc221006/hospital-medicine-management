package com.hospital.medicine.config;

import com.hospital.medicine.security.JwtTokenProvider;
import com.hospital.medicine.websocket.WebSocketAuthInterceptor;
import com.hospital.medicine.websocket.WebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final WebSocketHandler webSocketHandler;
    private final JwtTokenProvider jwtTokenProvider;

    public WebSocketConfig(WebSocketHandler webSocketHandler, JwtTokenProvider jwtTokenProvider) {
        this.webSocketHandler = webSocketHandler;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws")
                .setAllowedOrigins("*")
                .addInterceptors(new WebSocketAuthInterceptor(jwtTokenProvider));
    }
}
