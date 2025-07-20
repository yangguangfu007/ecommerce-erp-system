package com.erp.notification.service;

/**
 * 系统内通知服务接口
 *
 * @author ERP System
 */
public interface SystemNotificationService {

    /**
     * 发送系统内通知
     *
     * @param userId 用户ID
     * @param title 标题
     * @param content 内容
     * @return 是否成功
     */
    boolean sendSystemNotification(String userId, String title, String content);

    /**
     * 发送系统内通知（带类型）
     *
     * @param userId 用户ID
     * @param title 标题
     * @param content 内容
     * @param type 通知类型
     * @return 是否成功
     */
    boolean sendSystemNotification(String userId, String title, String content, String type);

    /**
     * 标记通知为已读
     *
     * @param userId 用户ID
     * @param notificationId 通知ID
     * @return 是否成功
     */
    boolean markAsRead(String userId, Long notificationId);

    /**
     * 获取用户未读通知数量
     *
     * @param userId 用户ID
     * @return 未读数量
     */
    int getUnreadCount(String userId);
}