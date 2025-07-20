package com.erp.notification.service;

/**
 * 通知频率控制服务接口
 *
 * @author ERP System
 */
public interface NotificationFrequencyService {

    /**
     * 检查全局频率限制
     *
     * @param notificationType 通知类型
     * @return 是否可以发送
     */
    boolean checkGlobalFrequencyLimit(String notificationType);

    /**
     * 检查接收者频率限制
     *
     * @param recipient 接收者
     * @param notificationType 通知类型
     * @return 是否可以发送
     */
    boolean checkRecipientFrequencyLimit(String recipient, String notificationType);

    /**
     * 检查业务类型频率限制
     *
     * @param businessType 业务类型
     * @param businessId 业务ID
     * @return 是否可以发送
     */
    boolean checkBusinessFrequencyLimit(String businessType, String businessId);

    /**
     * 记录发送频率
     *
     * @param recipient 接收者
     * @param notificationType 通知类型
     * @param businessType 业务类型
     * @param businessId 业务ID
     */
    void recordSendFrequency(String recipient, String notificationType, String businessType, String businessId);

    /**
     * 检查是否为垃圾通知
     *
     * @param recipient 接收者
     * @param content 内容
     * @return 是否为垃圾通知
     */
    boolean isSpamNotification(String recipient, String content);

    /**
     * 添加到黑名单
     *
     * @param recipient 接收者
     * @param reason 原因
     */
    void addToBlacklist(String recipient, String reason);

    /**
     * 从黑名单移除
     *
     * @param recipient 接收者
     */
    void removeFromBlacklist(String recipient);

    /**
     * 检查是否在黑名单中
     *
     * @param recipient 接收者
     * @return 是否在黑名单中
     */
    boolean isInBlacklist(String recipient);
}