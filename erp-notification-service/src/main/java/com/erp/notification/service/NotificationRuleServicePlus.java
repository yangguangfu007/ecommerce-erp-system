package com.erp.notification.service;

import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.notification.entity.NotificationRule;

import java.util.List;

/**
 * 通知规则服务接口
 * 继承BaseServicePlus获得增强的业务方法
 *
 * @author ERP System
 */
public interface NotificationRuleServicePlus extends BaseServicePlus<NotificationRule> {

    /**
     * 分页查询通知规则
     *
     * @param page 页码
     * @param size 每页大小
     * @param eventType 事件类型（可选）
     * @param businessType 业务类型（可选）
     * @param enabled 是否启用（可选）
     * @return 分页结果
     */
    PageResult<NotificationRule> getRulePage(Long page, Long size, String eventType, 
                                           String businessType, Boolean enabled);

    /**
     * 根据事件类型获取启用的规则
     *
     * @param eventType 事件类型
     * @return 规则列表
     */
    List<NotificationRule> getEnabledRulesByEventType(String eventType);

    /**
     * 根据业务类型获取启用的规则
     *
     * @param businessType 业务类型
     * @return 规则列表
     */
    List<NotificationRule> getEnabledRulesByBusinessType(String businessType);

    /**
     * 根据模板ID获取关联的规则
     *
     * @param templateId 模板ID
     * @return 规则列表
     */
    List<NotificationRule> getRulesByTemplateId(Long templateId);

    /**
     * 根据接收者获取相关规则
     *
     * @param recipientType 接收者类型
     * @param recipient 接收者
     * @return 规则列表
     */
    List<NotificationRule> getRulesByRecipient(String recipientType, String recipient);

    /**
     * 创建通知规则
     *
     * @param rule 规则对象
     * @return 创建的规则
     */
    NotificationRule createRule(NotificationRule rule);

    /**
     * 更新通知规则
     *
     * @param rule 规则对象
     * @return 更新的规则
     */
    NotificationRule updateRule(NotificationRule rule);

    /**
     * 启用或禁用规则
     *
     * @param ruleId 规则ID
     * @param enabled 是否启用
     * @return 是否成功
     */
    boolean toggleRuleStatus(Long ruleId, Boolean enabled);

    /**
     * 批量启用或禁用规则
     *
     * @param ruleIds 规则ID列表
     * @param enabled 是否启用
     * @return 成功更新的数量
     */
    int batchToggleRuleStatus(List<Long> ruleIds, Boolean enabled);

    /**
     * 增加规则执行次数
     *
     * @param ruleId 规则ID
     * @return 是否成功
     */
    boolean incrementExecutionCount(Long ruleId);

    /**
     * 检查规则是否达到执行限制
     *
     * @param ruleId 规则ID
     * @return 是否达到限制
     */
    boolean isExecutionLimitReached(Long ruleId);

    /**
     * 获取超过执行限制的规则
     *
     * @return 规则列表
     */
    List<NotificationRule> getOverLimitRules();

    /**
     * 重置规则执行次数
     *
     * @param ruleId 规则ID
     * @return 是否成功
     */
    boolean resetExecutionCount(Long ruleId);

    /**
     * 批量重置规则执行次数
     *
     * @param ruleIds 规则ID列表
     * @return 成功重置的数量
     */
    int batchResetExecutionCount(List<Long> ruleIds);

    /**
     * 获取规则统计信息
     *
     * @return 统计信息Map
     */
    java.util.Map<String, Object> getRuleStats();
}