package com.erp.notification.config;

import com.erp.notification.websocket.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket配置类
 * 配置通知WebSocket端点
 *
 * @author ERP System
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final NotificationWebSocketHandler notificationWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // 注册通知WebSocket处理器
        registry.addHandler(notificationWebSocketHandler, "/api/notifications/ws")
                .setAllowedOrigins("*") // 允许所有来源（生产环境应该限制）
                .withSockJS(); // 启用SockJS支持
    }
}