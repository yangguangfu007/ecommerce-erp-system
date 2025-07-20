package com.erp.notification.service.impl;

import com.erp.notification.entity.NotificationConfig;
import com.erp.notification.mapper.NotificationConfigMapper;
import com.erp.notification.service.NotificationConfigService;
import com.erp.common.exception.BusinessException;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import cn.hutool.core.util.StrUtil;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 通知配置服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationConfigServiceImpl implements NotificationConfigService {

    private final NotificationConfigMapper configMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String FREQUENCY_LIMIT_KEY_PREFIX = "notification_frequency:";

    @Override
    public Long createConfig(NotificationConfig config) {
        log.info("创建通知配置: userId={}, type={}, businessType={}", 
                config.getUserId(), config.getNotificationType(), config.getBusinessType());

        // 检查是否已存在相同配置
        QueryWrapper<NotificationConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", config.getUserId())
                   .eq("notification_type", config.getNotificationType())
                   .eq("business_type", config.getBusinessType());
        
        NotificationConfig existing = configMapper.selectOne(queryWrapper);
        if (existing != null) {
            throw new BusinessException("通知配置已存在");
        }

        configMapper.insert(config);
        log.info("通知配置创建成功: configId={}", config.getId());
        return config.getId();
    }

    @Override
    public boolean updateConfig(NotificationConfig config) {
        log.info("更新通知配置: configId={}", config.getId());

        NotificationConfig existing = configMapper.selectById(config.getId());
        if (existing == null) {
            throw new BusinessException("通知配置不存在: " + config.getId());
        }

        int updated = configMapper.updateById(config);
        boolean success = updated > 0;

        if (success) {
            log.info("通知配置更新成功: configId={}", config.getId());
        } else {
            log.warn("通知配置更新失败: configId={}", config.getId());
        }

        return success;
    }

    @Override
    public boolean deleteConfig(Long configId) {
        log.info("删除通知配置: configId={}", configId);

        NotificationConfig config = configMapper.selectById(configId);
        if (config == null) {
            log.warn("通知配置不存在: configId={}", configId);
            return false;
        }

        int deleted = configMapper.deleteById(configId);
        boolean success = deleted > 0;

        if (success) {
            log.info("通知配置删除成功: configId={}", configId);
        } else {
            log.warn("通知配置删除失败: configId={}", configId);
        }

        return success;
    }

    @Override
    public List<NotificationConfig> getUserConfigs(Long userId) {
        QueryWrapper<NotificationConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .orderByAsc("notification_type", "business_type");
        return configMapper.selectList(queryWrapper);
    }

    @Override
    public List<NotificationConfig> getUserConfigsByBusinessType(Long userId, String businessType) {
        QueryWrapper<NotificationConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .eq("business_type", businessType)
                   .orderByAsc("notification_type");
        return configMapper.selectList(queryWrapper);
    }

    @Override
    public boolean isNotificationEnabled(Long userId, String notificationType, String businessType) {
        QueryWrapper<NotificationConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .eq("notification_type", notificationType)
                   .eq("business_type", businessType)
                   .eq("enabled", true);
        
        NotificationConfig config = configMapper.selectOne(queryWrapper);
        return config != null;
    }

    @Override
    public String getRecipientAddress(Long userId, String notificationType, String businessType) {
        QueryWrapper<NotificationConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .eq("notification_type", notificationType)
                   .eq("business_type", businessType)
                   .eq("enabled", true);
        
        NotificationConfig config = configMapper.selectOne(queryWrapper);
        if (config != null && StrUtil.isNotBlank(config.getRecipient())) {
            return config.getRecipient();
        }
        
        // 如果没有配置特定地址，返回用户ID作为默认地址（用于系统内通知）
        return userId.toString();
    }

    @Override
    public boolean checkFrequencyLimit(Long userId, String notificationType, String businessType) {
        // 获取频率限制配置
        QueryWrapper<NotificationConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .eq("notification_type", notificationType)
                   .eq("business_type", businessType);
        
        NotificationConfig config = configMapper.selectOne(queryWrapper);
        if (config == null || config.getFrequencyLimit() == null || config.getFrequencyLimit() <= 0) {
            return true; // 没有频率限制
        }

        // 检查Redis中的频率限制记录
        String key = FREQUENCY_LIMIT_KEY_PREFIX + userId + ":" + notificationType + ":" + businessType;
        Object lastSendTime = redisTemplate.opsForValue().get(key);
        
        if (lastSendTime == null) {
            // 记录本次发送时间
            redisTemplate.opsForValue().set(key, System.currentTimeMillis(), 
                                          config.getFrequencyLimit(), TimeUnit.MINUTES);
            return true;
        }

        long lastTime = Long.parseLong(lastSendTime.toString());
        long currentTime = System.currentTimeMillis();
        long intervalMinutes = (currentTime - lastTime) / (1000 * 60);

        if (intervalMinutes >= config.getFrequencyLimit()) {
            // 更新发送时间
            redisTemplate.opsForValue().set(key, currentTime, 
                                          config.getFrequencyLimit(), TimeUnit.MINUTES);
            return true;
        }

        log.info("通知频率限制: userId={}, type={}, businessType={}, interval={}分钟, limit={}分钟", 
                userId, notificationType, businessType, intervalMinutes, config.getFrequencyLimit());
        return false;
    }

    @Override
    public boolean isInSilentTime(Long userId, String notificationType, String businessType) {
        QueryWrapper<NotificationConfig> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .eq("notification_type", notificationType)
                   .eq("business_type", businessType);
        
        NotificationConfig config = configMapper.selectOne(queryWrapper);
        if (config == null || 
            !StrUtil.isNotBlank(config.getSilentTimeStart()) || 
            !StrUtil.isNotBlank(config.getSilentTimeEnd())) {
            return false; // 没有静默时间配置
        }

        try {
            LocalTime now = LocalTime.now();
            LocalTime silentStart = LocalTime.parse(config.getSilentTimeStart(), DateTimeFormatter.ofPattern("HH:mm"));
            LocalTime silentEnd = LocalTime.parse(config.getSilentTimeEnd(), DateTimeFormatter.ofPattern("HH:mm"));

            // 处理跨天的情况
            if (silentStart.isBefore(silentEnd)) {
                // 同一天内的静默时间
                return now.isAfter(silentStart) && now.isBefore(silentEnd);
            } else {
                // 跨天的静默时间
                return now.isAfter(silentStart) || now.isBefore(silentEnd);
            }

        } catch (Exception e) {
            log.error("解析静默时间失败: start={}, end={}", 
                     config.getSilentTimeStart(), config.getSilentTimeEnd(), e);
            return false;
        }
    }
}