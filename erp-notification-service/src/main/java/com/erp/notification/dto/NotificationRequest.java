package com.erp.notification.dto;

import lombok.Data;

import java.util.Map;

/**
 * 通知请求DTO
 *
 * @author ERP System
 */
@Data
public class NotificationRequest {

    /**
     * 通知类型：EMAIL, SMS, SYSTEM
     */
    private String notificationType;

    /**
     * 接收者
     */
    private String recipient;

    /**
     * 标题
     */
    private String title;

    /**
     * 内容
     */
    private String content;

    /**
     * 模板编码
     */
    private String templateCode;

    /**
     * 模板变量
     */
    private Map<String, Object> variables;

    /**
     * 业务类型
     */
    private String businessType;

    /**
     * 业务ID
     */
    private String businessId;

    /**
     * 优先级：HIGH, NORMAL, LOW
     */
    private String priority;

    /**
     * 最大重试次数
     */
    private Integer maxRetryCount;

    /**
     * 扩展参数
     */
    private Map<String, Object> extParams;
}