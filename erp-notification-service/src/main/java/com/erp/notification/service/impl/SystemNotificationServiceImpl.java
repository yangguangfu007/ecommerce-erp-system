package com.erp.notification.service.impl;

import com.erp.notification.service.SystemNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 系统内通知服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SystemNotificationServiceImpl implements SystemNotificationService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String NOTIFICATION_KEY_PREFIX = "system_notification:";
    private static final String UNREAD_COUNT_KEY_PREFIX = "unread_count:";

    @Override
    public boolean sendSystemNotification(String userId, String title, String content) {
        return sendSystemNotification(userId, title, content, "SYSTEM");
    }

    @Override
    public boolean sendSystemNotification(String userId, String title, String content, String type) {
        try {
            log.info("发送系统内通知: userId={}, title={}, type={}", userId, title, type);

            // 生成通知ID
            Long notificationId = System.currentTimeMillis();
            
            // 创建通知对象
            Map<String, Object> notification = new HashMap<>();
            notification.put("id", notificationId);
            notification.put("userId", userId);
            notification.put("title", title);
            notification.put("content", content);
            notification.put("type", type);
            notification.put("isRead", false);
            notification.put("createTime", LocalDateTime.now().toString());

            // 存储到Redis
            String notificationKey = NOTIFICATION_KEY_PREFIX + userId + ":" + notificationId;
            redisTemplate.opsForValue().set(notificationKey, notification, 30, TimeUnit.DAYS);

            // 更新未读数量
            String unreadCountKey = UNREAD_COUNT_KEY_PREFIX + userId;
            redisTemplate.opsForValue().increment(unreadCountKey);
            redisTemplate.expire(unreadCountKey, 30, TimeUnit.DAYS);

            log.info("系统内通知发送成功: userId={}, notificationId={}", userId, notificationId);
            return true;

        } catch (Exception e) {
            log.error("系统内通知发送失败: userId={}, title={}", userId, title, e);
            return false;
        }
    }

    @Override
    public boolean markAsRead(String userId, Long notificationId) {
        try {
            log.info("标记通知为已读: userId={}, notificationId={}", userId, notificationId);

            String notificationKey = NOTIFICATION_KEY_PREFIX + userId + ":" + notificationId;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> notification = (Map<String, Object>) redisTemplate.opsForValue().get(notificationKey);
            
            if (notification == null) {
                log.warn("通知不存在: userId={}, notificationId={}", userId, notificationId);
                return false;
            }

            // 检查是否已读
            Boolean isRead = (Boolean) notification.get("isRead");
            if (Boolean.TRUE.equals(isRead)) {
                log.info("通知已经是已读状态: userId={}, notificationId={}", userId, notificationId);
                return true;
            }

            // 标记为已读
            notification.put("isRead", true);
            notification.put("readTime", LocalDateTime.now().toString());
            redisTemplate.opsForValue().set(notificationKey, notification, 30, TimeUnit.DAYS);

            // 减少未读数量
            String unreadCountKey = UNREAD_COUNT_KEY_PREFIX + userId;
            Long unreadCount = redisTemplate.opsForValue().decrement(unreadCountKey);
            if (unreadCount != null && unreadCount < 0) {
                redisTemplate.opsForValue().set(unreadCountKey, 0);
            }

            log.info("通知标记为已读成功: userId={}, notificationId={}", userId, notificationId);
            return true;

        } catch (Exception e) {
            log.error("标记通知为已读失败: userId={}, notificationId={}", userId, notificationId, e);
            return false;
        }
    }

    @Override
    public int getUnreadCount(String userId) {
        try {
            String unreadCountKey = UNREAD_COUNT_KEY_PREFIX + userId;
            Object count = redisTemplate.opsForValue().get(unreadCountKey);
            
            if (count == null) {
                return 0;
            }
            
            return Integer.parseInt(count.toString());
            
        } catch (Exception e) {
            log.error("获取未读通知数量失败: userId={}", userId, e);
            return 0;
        }
    }
}