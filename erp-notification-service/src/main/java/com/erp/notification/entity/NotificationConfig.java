package com.erp.notification.entity;

import com.erp.common.entity.BaseEntity;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 通知配置实体
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("notification_configs")
public class NotificationConfig extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 通知类型：EMAIL, SMS, SYSTEM
     */
    private String notificationType;

    /**
     * 业务类型
     */
    private String businessType;

    /**
     * 是否启用
     */
    private Boolean enabled;

    /**
     * 接收地址（邮箱或手机号）
     */
    private String recipient;

    /**
     * 通知频率限制（分钟）
     */
    private Integer frequencyLimit;

    /**
     * 静默时间开始（HH:mm）
     */
    private String silentTimeStart;

    /**
     * 静默时间结束（HH:mm）
     */
    private String silentTimeEnd;
}