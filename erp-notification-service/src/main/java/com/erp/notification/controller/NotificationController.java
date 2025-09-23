package com.erp.notification.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.notification.entity.Notification;
import com.erp.notification.enums.NotificationStatus;
import com.erp.notification.enums.NotificationType;
import com.erp.notification.service.NotificationServicePlus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import java.util.Map;

/**
 * 通知管理控制器
 * 使用erp-common的Result进行响应封装
 *
 * @author ERP System
 */
/**
 * 通知管理控制器
 * 使用erp-common的Result进行响应封装
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Validated
public class NotificationController {

    private final NotificationServicePlus notificationService;

    /**
     * 分页查询通知列表
     * 根据条件分页查询用户通知列表
     */
    @GetMapping
    public Result<PageResult<Notification>> getNotificationPage(
            @RequestParam @NotNull Long recipientId,
            @RequestParam(defaultValue = "1") @Positive Long page,
            @RequestParam(defaultValue = "10") @Positive Long size,
            @RequestParam(required = false) NotificationStatus status,
            @RequestParam(required = false) NotificationType type) {
        
        log.debug("分页查询通知列表，用户ID：{}，页码：{}，大小：{}", recipientId, page, size);
        
        try {
            PageResult<Notification> result = notificationService.getNotificationPage(recipientId, page, size, status, type);
            return Result.success(result);
        } catch (Exception e) {
            log.error("分页查询通知列表失败", e);
            return Result.error("查询通知列表失败：" + e.getMessage());
        }
    }

    /**
     * 获取未读通知数量
     * 获取指定用户的未读通知数量
     */
    @GetMapping("/unread-count")
    public Result<Long> getUnreadCount(
            @RequestParam @NotNull Long recipientId) {
        
        log.debug("获取未读通知数量，用户ID：{}", recipientId);
        
        try {
            Long count = notificationService.getUnreadCount(recipientId);
            return Result.success(count);
        } catch (Exception e) {
            log.error("获取未读通知数量失败", e);
            return Result.error("获取未读通知数量失败：" + e.getMessage());
        }
    }

    /**
     * 获取最近通知
     * 获取用户最近的通知列表
     */
    @GetMapping("/recent")
    public Result<List<Notification>> getRecentNotifications(
            @RequestParam @NotNull Long recipientId,
            @RequestParam(defaultValue = "10") @Positive Integer limit) {
        
        log.debug("获取最近通知，用户ID：{}，限制数量：{}", recipientId, limit);
        
        try {
            List<Notification> notifications = notificationService.getRecentNotifications(recipientId, limit);
            return Result.success(notifications);
        } catch (Exception e) {
            log.error("获取最近通知失败", e);
            return Result.error("获取最近通知失败：" + e.getMessage());
        }
    }

    /**
     * 标记通知为已读
     * 将指定通知标记为已读状态
     */
    @PutMapping("/{id}/read")
    public Result<Boolean> markAsRead(
            @PathVariable @NotNull Long id,
            @RequestParam @NotNull Long recipientId) {
        
        log.debug("标记通知为已读，通知ID：{}，用户ID：{}", id, recipientId);
        
        try {
            boolean success = notificationService.markAsRead(id, recipientId);
            if (success) {
                return Result.success(true);
            } else {
                return Result.error("标记通知已读失败，通知不存在或已是已读状态");
            }
        } catch (Exception e) {
            log.error("标记通知为已读失败", e);
            return Result.error("标记通知已读失败：" + e.getMessage());
        }
    }

    /**
     * 批量标记通知为已读
     * 批量将通知标记为已读状态
     */
    @PutMapping("/batch-read")
    public Result<Integer> batchMarkAsRead(
            @RequestBody @NotNull List<Long> notificationIds,
            @RequestParam @NotNull Long recipientId) {
        
        log.debug("批量标记通知为已读，通知ID列表：{}，用户ID：{}", notificationIds, recipientId);
        
        try {
            int count = notificationService.batchMarkAsRead(notificationIds, recipientId);
            return Result.success(count);
        } catch (Exception e) {
            log.error("批量标记通知为已读失败", e);
            return Result.error("批量标记通知已读失败：" + e.getMessage());
        }
    }

    /**
     * 删除通知
     * 删除指定通知（逻辑删除）
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteNotification(
            @PathVariable @NotNull Long id,
            @RequestParam @NotNull Long recipientId) {
        
        log.debug("删除通知，通知ID：{}，用户ID：{}", id, recipientId);
        
        try {
            boolean success = notificationService.deleteNotification(id, recipientId);
            if (success) {
                return Result.success(true);
            } else {
                return Result.error("删除通知失败，通知不存在");
            }
        } catch (Exception e) {
            log.error("删除通知失败", e);
            return Result.error("删除通知失败：" + e.getMessage());
        }
    }

    /**
     * 批量删除通知
     * 批量删除通知（逻辑删除）
     */
    @DeleteMapping("/batch")
    public Result<Integer> batchDeleteNotifications(
            @RequestBody @NotNull List<Long> notificationIds,
            @RequestParam @NotNull Long recipientId) {
        
        log.debug("批量删除通知，通知ID列表：{}，用户ID：{}", notificationIds, recipientId);
        
        try {
            int count = notificationService.batchDeleteNotifications(notificationIds, recipientId);
            return Result.success(count);
        } catch (Exception e) {
            log.error("批量删除通知失败", e);
            return Result.error("批量删除通知失败：" + e.getMessage());
        }
    }

    /**
     * 创建系统通知
     * 创建系统通知
     */
    @PostMapping("/system")
    public Result<Notification> createSystemNotification(
            @RequestParam @NotNull String title,
            @RequestParam @NotNull String content,
            @RequestParam @NotNull Long recipientId,
            @RequestParam @NotNull String recipientName,
            @RequestParam(required = false) String businessType,
            @RequestParam(required = false) String businessId) {
        
        log.debug("创建系统通知，标题：{}，接收用户：{}({})", title, recipientName, recipientId);
        
        try {
            Notification notification = notificationService.createSystemNotification(
                    title, content, recipientId, recipientName, businessType, businessId);
            
            if (notification != null) {
                return Result.success(notification);
            } else {
                return Result.error("系统通知创建失败");
            }
        } catch (Exception e) {
            log.error("创建系统通知失败", e);
            return Result.error("创建系统通知失败：" + e.getMessage());
        }
    }

    /**
     * 根据业务查询通知
     * 根据业务类型和业务ID查询相关通知
     */
    @GetMapping("/business")
    public Result<List<Notification>> getNotificationsByBusiness(
            @RequestParam @NotNull String businessType,
            @RequestParam @NotNull String businessId) {
        
        log.debug("根据业务查询通知，业务类型：{}，业务ID：{}", businessType, businessId);
        
        try {
            List<Notification> notifications = notificationService.getNotificationsByBusiness(businessType, businessId);
            return Result.success(notifications);
        } catch (Exception e) {
            log.error("根据业务查询通知失败", e);
            return Result.error("查询业务通知失败：" + e.getMessage());
        }
    }

    /**
     * 获取通知统计信息
     * 获取用户通知的统计信息
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getNotificationStats(
            @RequestParam @NotNull Long recipientId) {
        
        log.debug("获取通知统计信息，用户ID：{}", recipientId);
        
        try {
            Map<String, Object> stats = notificationService.getNotificationStats(recipientId);
            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取通知统计信息失败", e);
            return Result.error("获取通知统计信息失败：" + e.getMessage());
        }
    }

    /**
     * 清理过期通知
     * 清理系统中的过期通知
     */
    @PostMapping("/cleanup-expired")
    public Result<Integer> cleanExpiredNotifications() {
        log.debug("开始清理过期通知");
        
        try {
            int count = notificationService.cleanExpiredNotifications();
            return Result.success(count);
        } catch (Exception e) {
            log.error("清理过期通知失败", e);
            return Result.error("清理过期通知失败：" + e.getMessage());
        }
    }
}