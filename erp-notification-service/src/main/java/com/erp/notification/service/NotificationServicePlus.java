package com.erp.notification.service;

import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.notification.entity.Notification;
import com.erp.notification.enums.NotificationStatus;
import com.erp.notification.enums.NotificationType;

import java.util.List;

/**
 * 通知服务接口
 * 继承BaseServicePlus获得增强的业务方法
 *
 * @author ERP System
 */
public interface NotificationServicePlus extends BaseServicePlus<Notification> {

    /**
     * 分页查询用户通知
     *
     * @param recipientId 接收用户ID
     * @param page 页码
     * @param size 每页大小
     * @param status 通知状态（可选）
     * @param type 通知类型（可选）
     * @return 分页结果
     */
    PageResult<Notification> getNotificationPage(Long recipientId, Long page, Long size, 
                                                NotificationStatus status, NotificationType type);

    /**
     * 获取用户未读通知数量
     *
     * @param recipientId 接收用户ID
     * @return 未读通知数量
     */
    Long getUnreadCount(Long recipientId);

    /**
     * 获取用户最近通知列表
     *
     * @param recipientId 接收用户ID
     * @param limit 限制数量
     * @return 通知列表
     */
    List<Notification> getRecentNotifications(Long recipientId, Integer limit);

    /**
     * 标记通知为已读
     *
     * @param notificationId 通知ID
     * @param recipientId 接收用户ID（用于安全验证）
     * @return 是否成功
     */
    boolean markAsRead(Long notificationId, Long recipientId);

    /**
     * 批量标记通知为已读
     *
     * @param notificationIds 通知ID列表
     * @param recipientId 接收用户ID（用于安全验证）
     * @return 成功标记的数量
     */
    int batchMarkAsRead(List<Long> notificationIds, Long recipientId);

    /**
     * 删除通知（逻辑删除）
     *
     * @param notificationId 通知ID
     * @param recipientId 接收用户ID（用于安全验证）
     * @return 是否成功
     */
    boolean deleteNotification(Long notificationId, Long recipientId);

    /**
     * 批量删除通知（逻辑删除）
     *
     * @param notificationIds 通知ID列表
     * @param recipientId 接收用户ID（用于安全验证）
     * @return 成功删除的数量
     */
    int batchDeleteNotifications(List<Long> notificationIds, Long recipientId);

    /**
     * 创建系统通知
     *
     * @param title 通知标题
     * @param content 通知内容
     * @param recipientId 接收用户ID
     * @param recipientName 接收用户名
     * @param businessType 业务类型（可选）
     * @param businessId 业务ID（可选）
     * @return 创建的通知
     */
    Notification createSystemNotification(String title, String content, Long recipientId, 
                                        String recipientName, String businessType, String businessId);

    /**
     * 根据业务信息查询通知
     *
     * @param businessType 业务类型
     * @param businessId 业务ID
     * @return 通知列表
     */
    List<Notification> getNotificationsByBusiness(String businessType, String businessId);

    /**
     * 清理过期通知
     *
     * @return 清理的通知数量
     */
    int cleanExpiredNotifications();

    /**
     * 获取通知统计信息
     *
     * @param recipientId 接收用户ID
     * @return 统计信息Map（包含总数、未读数、各类型数量等）
     */
    java.util.Map<String, Object> getNotificationStats(Long recipientId);
}