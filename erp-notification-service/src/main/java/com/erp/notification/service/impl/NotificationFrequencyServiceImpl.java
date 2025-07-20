package com.erp.notification.service.impl;

import com.erp.notification.service.NotificationFrequencyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import cn.hutool.core.util.StrUtil;

import java.util.concurrent.TimeUnit;

/**
 * 通知频率控制服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationFrequencyServiceImpl implements NotificationFrequencyService {

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${notification.frequency.global.email:100}")
    private int globalEmailLimit; // 每分钟全局邮件发送限制

    @Value("${notification.frequency.global.sms:50}")
    private int globalSmsLimit; // 每分钟全局短信发送限制

    @Value("${notification.frequency.recipient.email:10}")
    private int recipientEmailLimit; // 每小时单个接收者邮件限制

    @Value("${notification.frequency.recipient.sms:5}")
    private int recipientSmsLimit; // 每小时单个接收者短信限制

    @Value("${notification.frequency.business:20}")
    private int businessLimit; // 每小时单个业务的通知限制

    private static final String GLOBAL_FREQUENCY_KEY_PREFIX = "global_frequency:";
    private static final String RECIPIENT_FREQUENCY_KEY_PREFIX = "recipient_frequency:";
    private static final String BUSINESS_FREQUENCY_KEY_PREFIX = "business_frequency:";
    private static final String BLACKLIST_KEY_PREFIX = "notification_blacklist:";
    private static final String SPAM_DETECTION_KEY_PREFIX = "spam_detection:";

    @Override
    public boolean checkGlobalFrequencyLimit(String notificationType) {
        String key = GLOBAL_FREQUENCY_KEY_PREFIX + notificationType + ":" + getCurrentMinute();
        
        int limit = getGlobalLimit(notificationType);
        Long currentCount = redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, 1, TimeUnit.MINUTES);
        
        boolean allowed = currentCount <= limit;
        if (!allowed) {
            log.warn("全局频率限制: type={}, count={}, limit={}", notificationType, currentCount, limit);
        }
        
        return allowed;
    }

    @Override
    public boolean checkRecipientFrequencyLimit(String recipient, String notificationType) {
        String key = RECIPIENT_FREQUENCY_KEY_PREFIX + recipient + ":" + notificationType + ":" + getCurrentHour();
        
        int limit = getRecipientLimit(notificationType);
        Long currentCount = redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, 1, TimeUnit.HOURS);
        
        boolean allowed = currentCount <= limit;
        if (!allowed) {
            log.warn("接收者频率限制: recipient={}, type={}, count={}, limit={}", 
                    recipient, notificationType, currentCount, limit);
        }
        
        return allowed;
    }

    @Override
    public boolean checkBusinessFrequencyLimit(String businessType, String businessId) {
        if (!StrUtil.isNotBlank(businessType) || !StrUtil.isNotBlank(businessId)) {
            return true; // 没有业务信息时不限制
        }
        
        String key = BUSINESS_FREQUENCY_KEY_PREFIX + businessType + ":" + businessId + ":" + getCurrentHour();
        
        Long currentCount = redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, 1, TimeUnit.HOURS);
        
        boolean allowed = currentCount <= businessLimit;
        if (!allowed) {
            log.warn("业务频率限制: businessType={}, businessId={}, count={}, limit={}", 
                    businessType, businessId, currentCount, businessLimit);
        }
        
        return allowed;
    }

    @Override
    public void recordSendFrequency(String recipient, String notificationType, String businessType, String businessId) {
        // 记录已在检查方法中完成，这里可以记录额外的统计信息
        try {
            // 记录发送历史用于垃圾检测
            String spamKey = SPAM_DETECTION_KEY_PREFIX + recipient + ":" + getCurrentHour();
            redisTemplate.opsForValue().increment(spamKey);
            redisTemplate.expire(spamKey, 1, TimeUnit.HOURS);
            
        } catch (Exception e) {
            log.error("记录发送频率失败: recipient={}, type={}", recipient, notificationType, e);
        }
    }

    @Override
    public boolean isSpamNotification(String recipient, String content) {
        try {
            // 检查是否在黑名单中
            if (isInBlacklist(recipient)) {
                log.warn("接收者在黑名单中: {}", recipient);
                return true;
            }
            
            // 检查发送频率是否异常
            String spamKey = SPAM_DETECTION_KEY_PREFIX + recipient + ":" + getCurrentHour();
            Object countObj = redisTemplate.opsForValue().get(spamKey);
            if (countObj != null) {
                int count = Integer.parseInt(countObj.toString());
                if (count > 50) { // 每小时超过50条认为是垃圾通知
                    log.warn("检测到垃圾通知: recipient={}, count={}", recipient, count);
                    return true;
                }
            }
            
            // 检查内容是否重复
            if (StrUtil.isNotBlank(content)) {
                String contentHash = String.valueOf(content.hashCode());
                String contentKey = SPAM_DETECTION_KEY_PREFIX + "content:" + recipient + ":" + contentHash;
                
                Long contentCount = redisTemplate.opsForValue().increment(contentKey);
                redisTemplate.expire(contentKey, 1, TimeUnit.HOURS);
                
                if (contentCount > 5) { // 相同内容1小时内超过5次
                    log.warn("检测到重复内容垃圾通知: recipient={}, contentHash={}, count={}", 
                            recipient, contentHash, contentCount);
                    return true;
                }
            }
            
            return false;
            
        } catch (Exception e) {
            log.error("垃圾通知检测失败: recipient={}", recipient, e);
            return false; // 检测失败时不阻止发送
        }
    }

    @Override
    public void addToBlacklist(String recipient, String reason) {
        try {
            String key = BLACKLIST_KEY_PREFIX + recipient;
            redisTemplate.opsForValue().set(key, reason, 7, TimeUnit.DAYS); // 黑名单保留7天
            log.info("添加到黑名单: recipient={}, reason={}", recipient, reason);
        } catch (Exception e) {
            log.error("添加黑名单失败: recipient={}, reason={}", recipient, reason, e);
        }
    }

    @Override
    public void removeFromBlacklist(String recipient) {
        try {
            String key = BLACKLIST_KEY_PREFIX + recipient;
            redisTemplate.delete(key);
            log.info("从黑名单移除: recipient={}", recipient);
        } catch (Exception e) {
            log.error("移除黑名单失败: recipient={}", recipient, e);
        }
    }

    @Override
    public boolean isInBlacklist(String recipient) {
        try {
            String key = BLACKLIST_KEY_PREFIX + recipient;
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            log.error("检查黑名单失败: recipient={}", recipient, e);
            return false;
        }
    }

    private int getGlobalLimit(String notificationType) {
        switch (notificationType.toUpperCase()) {
            case "EMAIL":
                return globalEmailLimit;
            case "SMS":
                return globalSmsLimit;
            default:
                return 1000; // 系统内通知限制较宽松
        }
    }

    private int getRecipientLimit(String notificationType) {
        switch (notificationType.toUpperCase()) {
            case "EMAIL":
                return recipientEmailLimit;
            case "SMS":
                return recipientSmsLimit;
            default:
                return 100; // 系统内通知限制较宽松
        }
    }

    private String getCurrentMinute() {
        return String.valueOf(System.currentTimeMillis() / (1000 * 60));
    }

    private String getCurrentHour() {
        return String.valueOf(System.currentTimeMillis() / (1000 * 60 * 60));
    }
}