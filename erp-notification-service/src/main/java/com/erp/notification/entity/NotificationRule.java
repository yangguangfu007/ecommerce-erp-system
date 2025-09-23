package com.erp.notification.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.common.handler.JsonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.Map;

/**
 * 通知规则实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("notification_rules")
public class NotificationRule extends BaseEntity {

    /**
     * 规则名称
     */
    @TableField("rule_name")
    private String ruleName;

    /**
     * 规则描述
     */
    @TableField("description")
    private String description;

    /**
     * 事件类型（触发规则的事件）
     */
    @TableField("event_type")
    private String eventType;

    /**
     * 业务类型
     */
    @TableField("business_type")
    private String businessType;

    /**
     * 规则条件（JSON格式）
     */
    @TableField(value = "rule_conditions", typeHandler = JsonTypeHandler.class)
    private List<RuleCondition> ruleConditions;

    /**
     * 模板ID
     */
    @TableField("template_id")
    private Long templateId;

    /**
     * 接收者配置（JSON格式）
     */
    @TableField(value = "recipients", typeHandler = JsonTypeHandler.class)
    private List<String> recipients;

    /**
     * 接收者类型（USER-用户，ROLE-角色，GROUP-用户组）
     */
    @TableField("recipient_type")
    private String recipientType;

    /**
     * 是否启用（1-启用，0-禁用）
     */
    @TableField("enabled")
    private Boolean enabled;

    /**
     * 优先级（数值越大优先级越高）
     */
    @TableField("priority")
    private Integer priority;

    /**
     * 执行次数限制（0-无限制）
     */
    @TableField("execution_limit")
    private Integer executionLimit;

    /**
     * 已执行次数
     */
    @TableField("execution_count")
    private Integer executionCount;

    /**
     * 规则配置（JSON格式）
     */
    @TableField(value = "rule_config", typeHandler = JsonTypeHandler.class)
    private Map<String, Object> ruleConfig;

    /**
     * 检查规则是否启用
     *
     * @return true-启用，false-禁用
     */
    public boolean isEnabled() {
        return Boolean.TRUE.equals(this.enabled);
    }

    /**
     * 检查是否达到执行次数限制
     *
     * @return true-已达到限制，false-未达到限制
     */
    public boolean isExecutionLimitReached() {
        if (executionLimit == null || executionLimit == 0) {
            return false; // 无限制
        }
        return executionCount != null && executionCount >= executionLimit;
    }

    /**
     * 增加执行次数
     */
    public void incrementExecutionCount() {
        if (this.executionCount == null) {
            this.executionCount = 1;
        } else {
            this.executionCount++;
        }
    }

    /**
     * 获取实体描述信息
     *
     * @return 实体描述
     */
    @Override
    public String getEntityDescription() {
        return "通知规则(id=" + getId() + ", name=" + ruleName + ", event=" + eventType + ")";
    }

    /**
     * 规则条件内部类
     */
    @Data
    public static class RuleCondition {
        /**
         * 字段名
         */
        private String field;

        /**
         * 操作符（eq-等于，ne-不等于，gt-大于，lt-小于，contains-包含，in-在范围内）
         */
        private String operator;

        /**
         * 比较值
         */
        private Object value;

        /**
         * 逻辑关系（AND，OR）
         */
        private String logic;
    }
}