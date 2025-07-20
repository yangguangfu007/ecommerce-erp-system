package com.erp.notification.service;

import com.erp.notification.dto.NotificationRequest;
import com.erp.notification.entity.NotificationRecord;
import com.erp.notification.entity.NotificationTemplate;

import java.util.List;
import java.util.Map;

/**
 * 通知服务接口
 *
 * @author ERP System
 */
public interface NotificationService {

    /**
     * 发送通知
     *
     * @param request 通知请求
     * @return 通知记录ID
     */
    Long sendNotification(NotificationRequest request);

    /**
     * 批量发送通知
     *
     * @param requests 通知请求列表
     * @return 通知记录ID列表
     */
    List<Long> batchSendNotification(List<NotificationRequest> requests);

    /**
     * 根据模板发送通知
     *
     * @param templateCode 模板编码
     * @param recipient 接收者
     * @param variables 模板变量
     * @param businessType 业务类型
     * @param businessId 业务ID
     * @return 通知记录ID
     */
    Long sendNotificationByTemplate(String templateCode, String recipient, 
                                   Map<String, Object> variables, 
                                   String businessType, String businessId);

    /**
     * 重试失败的通知
     *
     * @param recordId 通知记录ID
     * @return 是否成功
     */
    boolean retryNotification(Long recordId);

    /**
     * 获取通知记录
     *
     * @param recordId 记录ID
     * @return 通知记录
     */
    NotificationRecord getNotificationRecord(Long recordId);

    /**
     * 获取通知记录列表
     *
     * @param businessType 业务类型
     * @param businessId 业务ID
     * @return 通知记录列表
     */
    List<NotificationRecord> getNotificationRecords(String businessType, String businessId);

    /**
     * 获取通知模板
     *
     * @param templateCode 模板编码
     * @return 通知模板
     */
    NotificationTemplate getTemplate(String templateCode);

    /**
     * 处理失败的通知重试
     */
    void processFailedNotifications();
}