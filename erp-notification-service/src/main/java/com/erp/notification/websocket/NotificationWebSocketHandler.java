package com.erp.notification.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.erp.notification.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 通知WebSocket处理器
 * 实现实时通知推送功能
 *
 * @author ERP System
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationWebSocketHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper;

    /**
     * 存储用户WebSocket会话
     * Key: 用户ID，Value: WebSocket会话
     */
    private final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.debug("WebSocket连接建立，会话ID：{}", session.getId());

        // 从会话中获取用户ID（通常在握手时设置）
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.put(userId, session);
            log.info("用户WebSocket会话建立成功，用户ID：{}，会话ID：{}", userId, session.getId());
            
            // 发送连接成功消息
            sendMessage(session, createMessage("CONNECTION_SUCCESS", "WebSocket连接成功", null));
        } else {
            log.warn("无法获取用户ID，关闭WebSocket连接，会话ID：{}", session.getId());
            session.close(CloseStatus.BAD_DATA.withReason("无法获取用户ID"));
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        log.debug("收到WebSocket消息，会话ID：{}，消息：{}", session.getId(), message.getPayload());

        try {
            String payload = message.getPayload().toString();
            @SuppressWarnings("unchecked")
            Map<String, Object> messageData = objectMapper.readValue(payload, Map.class);
            
            String messageType = (String) messageData.get("type");
            Long userId = getUserIdFromSession(session);

            switch (messageType) {
                case "PING":
                    // 心跳检测
                    sendMessage(session, createMessage("PONG", "心跳响应", null));
                    break;
                case "MARK_READ":
                    // 标记已读请求
                    handleMarkReadRequest(session, messageData, userId);
                    break;
                case "GET_UNREAD_COUNT":
                    // 获取未读数量请求
                    handleUnreadCountRequest(session, userId);
                    break;
                default:
                    log.warn("未知的消息类型：{}，会话ID：{}", messageType, session.getId());
                    sendMessage(session, createMessage("ERROR", "未知的消息类型", null));
            }
        } catch (Exception e) {
            log.error("处理WebSocket消息失败，会话ID：{}", session.getId(), e);
            sendMessage(session, createMessage("ERROR", "消息处理失败", null));
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket传输错误，会话ID：{}", session.getId(), exception);
        
        // 清理会话
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.remove(userId);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        log.debug("WebSocket连接关闭，会话ID：{}，关闭状态：{}", session.getId(), closeStatus);

        // 清理会话
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.remove(userId);
            log.info("用户WebSocket会话关闭，用户ID：{}，会话ID：{}", userId, session.getId());
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    /**
     * 向指定用户推送通知
     *
     * @param userId 用户ID
     * @param notification 通知对象
     */
    public void pushNotificationToUser(Long userId, Notification notification) {
        log.debug("向用户推送通知，用户ID：{}，通知ID：{}", userId, notification.getId());

        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                Map<String, Object> message = createMessage("NEW_NOTIFICATION", "新通知", notification);
                sendMessage(session, message);
                log.info("通知推送成功，用户ID：{}，通知ID：{}", userId, notification.getId());
            } catch (Exception e) {
                log.error("推送通知失败，用户ID：{}，通知ID：{}", userId, notification.getId(), e);
            }
        } else {
            log.debug("用户WebSocket会话不存在或已关闭，无法推送通知，用户ID：{}", userId);
        }
    }

    /**
     * 向所有在线用户广播通知
     *
     * @param notification 通知对象
     */
    public void broadcastNotification(Notification notification) {
        log.debug("广播通知，通知ID：{}", notification.getId());

        userSessions.forEach((userId, session) -> {
            if (session.isOpen()) {
                try {
                    Map<String, Object> message = createMessage("BROADCAST_NOTIFICATION", "广播通知", notification);
                    sendMessage(session, message);
                } catch (Exception e) {
                    log.error("广播通知失败，用户ID：{}，通知ID：{}", userId, notification.getId(), e);
                }
            }
        });

        log.info("通知广播完成，通知ID：{}，在线用户数：{}", notification.getId(), userSessions.size());
    }

    /**
     * 获取在线用户数量
     *
     * @return 在线用户数量
     */
    public int getOnlineUserCount() {
        return userSessions.size();
    }

    /**
     * 检查用户是否在线
     *
     * @param userId 用户ID
     * @return 是否在线
     */
    public boolean isUserOnline(Long userId) {
        WebSocketSession session = userSessions.get(userId);
        return session != null && session.isOpen();
    }

    /**
     * 从会话中获取用户ID
     *
     * @param session WebSocket会话
     * @return 用户ID
     */
    private Long getUserIdFromSession(WebSocketSession session) {
        try {
            // 从会话属性中获取用户ID（在握手拦截器中设置）
            Object userIdObj = session.getAttributes().get("userId");
            if (userIdObj != null) {
                return Long.valueOf(userIdObj.toString());
            }
            
            // 从URI参数中获取用户ID
            String query = session.getUri().getQuery();
            if (query != null && query.contains("userId=")) {
                String[] params = query.split("&");
                for (String param : params) {
                    if (param.startsWith("userId=")) {
                        return Long.valueOf(param.substring(7));
                    }
                }
            }
        } catch (Exception e) {
            log.error("获取用户ID失败，会话ID：{}", session.getId(), e);
        }
        
        return null;
    }

    /**
     * 发送消息到WebSocket会话
     *
     * @param session WebSocket会话
     * @param message 消息对象
     */
    private void sendMessage(WebSocketSession session, Map<String, Object> message) throws IOException {
        if (session.isOpen()) {
            String messageJson = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(messageJson));
        }
    }

    /**
     * 创建标准消息格式
     *
     * @param type 消息类型
     * @param message 消息内容
     * @param data 数据对象
     * @return 消息Map
     */
    private Map<String, Object> createMessage(String type, String message, Object data) {
        Map<String, Object> messageMap = new HashMap<>();
        messageMap.put("type", type);
        messageMap.put("message", message);
        messageMap.put("data", data);
        messageMap.put("timestamp", System.currentTimeMillis());
        return messageMap;
    }

    /**
     * 处理标记已读请求
     *
     * @param session WebSocket会话
     * @param messageData 消息数据
     * @param userId 用户ID
     */
    private void handleMarkReadRequest(WebSocketSession session, Map<String, Object> messageData, Long userId) {
        try {
            Object notificationIdObj = messageData.get("notificationId");
            if (notificationIdObj != null) {
                Long notificationId = Long.valueOf(notificationIdObj.toString());
                // 这里可以调用service方法标记已读
                // boolean success = notificationService.markAsRead(notificationId, userId);
                sendMessage(session, createMessage("MARK_READ_RESPONSE", "标记已读处理完成", 
                    Map.of("notificationId", notificationId, "success", true)));
            }
        } catch (Exception e) {
            log.error("处理标记已读请求失败", e);
            try {
                sendMessage(session, createMessage("ERROR", "标记已读失败", null));
            } catch (IOException ioException) {
                log.error("发送错误消息失败", ioException);
            }
        }
    }

    /**
     * 处理获取未读数量请求
     *
     * @param session WebSocket会话
     * @param userId 用户ID
     */
    private void handleUnreadCountRequest(WebSocketSession session, Long userId) {
        try {
            // 这里可以调用service方法获取未读数量
            // Long unreadCount = notificationService.getUnreadCount(userId);
            sendMessage(session, createMessage("UNREAD_COUNT_RESPONSE", "未读数量查询完成", 
                Map.of("unreadCount", 0))); // 临时返回0
        } catch (Exception e) {
            log.error("处理未读数量请求失败", e);
            try {
                sendMessage(session, createMessage("ERROR", "获取未读数量失败", null));
            } catch (IOException ioException) {
                log.error("发送错误消息失败", ioException);
            }
        }
    }
}