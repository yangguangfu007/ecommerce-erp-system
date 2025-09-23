package com.erp.notification.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.common.handler.JsonTypeHandler;
import com.erp.notification.enums.NotificationPriority;
import com.erp.notification.enums.NotificationStatus;
import com.erp.notification.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 通知实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("notifications")
public class Notification extends BaseEntity {

    /**
     * 通知标题
     */
    @TableField("title")
    private String title;

    /**
     * 通知内容
     */
    @TableField("content")
    private String content;

    /**
     * 通知类型
     */
    @TableField("type")
    private NotificationType type;

    /**
     * 通知状态
     */
    @TableField("status")
    private NotificationStatus status;

    /**
     * 通知优先级
     */
    @TableField("priority")
    private NotificationPriority priority;

    /**
     * 接收用户ID
     */
    @TableField("recipient_id")
    private Long recipientId;

    /**
     * 接收用户名
     */
    @TableField("recipient_name")
    private String recipientName;

    /**
     * 发送者ID
     */
    @TableField("sender_id")
    private Long senderId;

    /**
     * 发送者名称
     */
    @TableField("sender_name")
    private String senderName;

    /**
     * 业务类型（如：ORDER、INVENTORY、PLATFORM等）
     */
    @TableField("business_type")
    private String businessType;

    /**
     * 业务ID（关联的业务数据ID）
     */
    @TableField("business_id")
    private String businessId;

    /**
     * 模板ID
     */
    @TableField("template_id")
    private Long templateId;

    /**
     * 阅读时间
     */
    @TableField("read_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime readTime;

    /**
     * 过期时间
     */
    @TableField("expire_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expireTime;

    /**
     * 扩展数据（JSON格式）
     */
    @TableField(value = "extra_data", typeHandler = JsonTypeHandler.class)
    private Map<String, Object> extraData;

    /**
     * 操作链接
     */
    @TableField("action_url")
    private String actionUrl;

    /**
     * 操作按钮文本
     */
    @TableField("action_text")
    private String actionText;

    /**
     * 图标
     */
    @TableField("icon")
    private String icon;

    /**
     * 是否已读
     *
     * @return true-已读，false-未读
     */
    public boolean isRead() {
        return NotificationStatus.READ.equals(this.status);
    }

    /**
     * 是否已过期
     *
     * @return true-已过期，false-未过期
     */
    public boolean isExpired() {
        return this.expireTime != null && LocalDateTime.now().isAfter(this.expireTime);
    }

    /**
     * 标记为已读
     */
    public void markAsRead() {
        this.status = NotificationStatus.READ;
        this.readTime = LocalDateTime.now();
    }

    /**
     * 获取实体描述信息
     *
     * @return 实体描述
     */
    @Override
    public String getEntityDescription() {
        return "通知(id=" + getId() + ", title=" + title + ", recipient=" + recipientName + ")";
    }
}