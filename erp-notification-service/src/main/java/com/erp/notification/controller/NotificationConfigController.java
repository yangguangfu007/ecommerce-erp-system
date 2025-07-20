package com.erp.notification.controller;

import com.erp.notification.entity.NotificationConfig;
import com.erp.notification.service.NotificationConfigService;
import com.erp.common.response.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 通知配置控制器
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/notification-configs")
@RequiredArgsConstructor
public class NotificationConfigController {

    private final NotificationConfigService configService;

    /**
     * 创建通知配置
     */
    @PostMapping
    public Result<Long> createConfig(@RequestBody NotificationConfig config) {
        log.info("创建通知配置: {}", config);
        Long configId = configService.createConfig(config);
        return Result.success(configId);
    }

    /**
     * 更新通知配置
     */
    @PutMapping("/{configId}")
    public Result<Boolean> updateConfig(@PathVariable Long configId, 
                                      @RequestBody NotificationConfig config) {
        log.info("更新通知配置: configId={}", configId);
        config.setId(configId);
        boolean success = configService.updateConfig(config);
        return Result.success(success);
    }

    /**
     * 删除通知配置
     */
    @DeleteMapping("/{configId}")
    public Result<Boolean> deleteConfig(@PathVariable Long configId) {
        log.info("删除通知配置: configId={}", configId);
        boolean success = configService.deleteConfig(configId);
        return Result.success(success);
    }

    /**
     * 获取用户通知配置
     */
    @GetMapping("/user/{userId}")
    public Result<List<NotificationConfig>> getUserConfigs(@PathVariable Long userId) {
        List<NotificationConfig> configs = configService.getUserConfigs(userId);
        return Result.success(configs);
    }

    /**
     * 获取用户特定业务类型的通知配置
     */
    @GetMapping("/user/{userId}/business/{businessType}")
    public Result<List<NotificationConfig>> getUserConfigsByBusinessType(
            @PathVariable Long userId, 
            @PathVariable String businessType) {
        
        List<NotificationConfig> configs = configService.getUserConfigsByBusinessType(userId, businessType);
        return Result.success(configs);
    }

    /**
     * 检查通知是否启用
     */
    @GetMapping("/check-enabled")
    public Result<Boolean> checkNotificationEnabled(
            @RequestParam Long userId,
            @RequestParam String notificationType,
            @RequestParam String businessType) {
        
        boolean enabled = configService.isNotificationEnabled(userId, notificationType, businessType);
        return Result.success(enabled);
    }

    /**
     * 获取接收地址
     */
    @GetMapping("/recipient-address")
    public Result<String> getRecipientAddress(
            @RequestParam Long userId,
            @RequestParam String notificationType,
            @RequestParam String businessType) {
        
        String address = configService.getRecipientAddress(userId, notificationType, businessType);
        return Result.success(address);
    }
}