package com.erp.notification.entity;

import com.erp.common.entity.BaseEntity;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 通知模板实体
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("notification_templates")
public class NotificationTemplate extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 模板编码
     */
    private String templateCode;

    /**
     * 模板名称
     */
    private String templateName;

    /**
     * 通知类型：EMAIL, SMS, SYSTEM
     */
    private String notificationType;

    /**
     * 模板标题
     */
    private String title;

    /**
     * 模板内容
     */
    private String content;

    /**
     * 模板变量（JSON格式）
     */
    private String variables;

    /**
     * 状态：ACTIVE, INACTIVE
     */
    private String status;

    /**
     * 描述
     */
    private String description;
}