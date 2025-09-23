package com.erp.notification.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.common.handler.JsonTypeHandler;
import com.erp.notification.enums.NotificationType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.Map;

/**
 * 通知模板实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("notification_templates")
public class NotificationTemplate extends BaseEntity {

    /**
     * 模板编码（唯一标识）
     */
    @TableField("template_code")
    private String templateCode;

    /**
     * 模板名称
     */
    @TableField("template_name")
    private String templateName;

    /**
     * 通知类型
     */
    @TableField("notification_type")
    private NotificationType notificationType;

    /**
     * 模板标题
     */
    @TableField("title")
    private String title;

    /**
     * 模板内容
     */
    @TableField("content")
    private String content;

    /**
     * 模板变量列表（JSON格式）
     */
    @TableField(value = "variables", typeHandler = JsonTypeHandler.class)
    private List<String> variables;

    /**
     * 模板配置（JSON格式）
     */
    @TableField(value = "template_config", typeHandler = JsonTypeHandler.class)
    private Map<String, Object> templateConfig;

    /**
     * 是否启用（1-启用，0-禁用）
     */
    @TableField("enabled")
    private Boolean enabled;

    /**
     * 模板描述
     */
    @TableField("description")
    private String description;

    /**
     * 模板分类
     */
    @TableField("category")
    private String category;

    /**
     * 排序号
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 检查模板是否启用
     *
     * @return true-启用，false-禁用
     */
    public boolean isEnabled() {
        return Boolean.TRUE.equals(this.enabled);
    }

    /**
     * 获取实体描述信息
     *
     * @return 实体描述
     */
    @Override
    public String getEntityDescription() {
        return "通知模板(id=" + getId() + ", code=" + templateCode + ", name=" + templateName + ")";
    }
}