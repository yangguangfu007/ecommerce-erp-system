package com.erp.notification.service;

import com.erp.notification.entity.NotificationConfig;

import java.util.List;

/**
 * 通知配置服务接口
 *
 * @author ERP System
 */
public interface NotificationConfigService {

    /**
     * 创建通知配置
     *
     * @param config 配置对象
     * @return 配置ID
     */
    Long createConfig(NotificationConfig config);

    /**
     * 更新通知配置
     *
     * @param config 配置对象
     * @return 是否成功
     */
    boolean updateConfig(NotificationConfig config);

    /**
     * 删除通知配置
     *
     * @param configId 配置ID
     * @return 是否成功
     */
    boolean deleteConfig(Long configId);

    /**
     * 获取用户通知配置
     *
     * @param userId 用户ID
     * @return 配置列表
     */
    List<NotificationConfig> getUserConfigs(Long userId);

    /**
     * 获取用户特定业务类型的通知配置
     *
     * @param userId 用户ID
     * @param businessType 业务类型
     * @return 配置列表
     */
    List<NotificationConfig> getUserConfigsByBusinessType(Long userId, String businessType);

    /**
     * 检查用户是否启用了特定类型的通知
     *
     * @param userId 用户ID
     * @param notificationType 通知类型
     * @param businessType 业务类型
     * @return 是否启用
     */
    boolean isNotificationEnabled(Long userId, String notificationType, String businessType);

    /**
     * 获取用户通知接收地址
     *
     * @param userId 用户ID
     * @param notificationType 通知类型
     * @param businessType 业务类型
     * @return 接收地址
     */
    String getRecipientAddress(Long userId, String notificationType, String businessType);

    /**
     * 检查通知频率限制
     *
     * @param userId 用户ID
     * @param notificationType 通知类型
     * @param businessType 业务类型
     * @return 是否可以发送
     */
    boolean checkFrequencyLimit(Long userId, String notificationType, String businessType);

    /**
     * 检查是否在静默时间内
     *
     * @param userId 用户ID
     * @param notificationType 通知类型
     * @param businessType 业务类型
     * @return 是否在静默时间内
     */
    boolean isInSilentTime(Long userId, String notificationType, String businessType);
}