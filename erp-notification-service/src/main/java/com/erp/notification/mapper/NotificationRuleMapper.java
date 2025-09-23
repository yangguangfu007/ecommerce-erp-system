package com.erp.notification.mapper;

import com.erp.common.mapper.BaseMapperPlus;
import com.erp.notification.entity.NotificationRule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 通知规则数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 *
 * @author ERP System
 */
@Mapper
public interface NotificationRuleMapper extends BaseMapperPlus<NotificationRule> {

    /**
     * 根据事件类型查询启用的通知规则
     *
     * @param eventType 事件类型
     * @return 通知规则列表
     */
    @Select("SELECT * FROM notification_rules WHERE event_type = #{eventType} AND enabled = 1 AND deleted = 0 ORDER BY priority DESC")
    List<NotificationRule> selectEnabledByEventType(@Param("eventType") String eventType);

    /**
     * 根据业务类型查询启用的通知规则
     *
     * @param businessType 业务类型
     * @return 通知规则列表
     */
    @Select("SELECT * FROM notification_rules WHERE business_type = #{businessType} AND enabled = 1 AND deleted = 0 ORDER BY priority DESC")
    List<NotificationRule> selectEnabledByBusinessType(@Param("businessType") String businessType);

    /**
     * 根据模板ID查询关联的通知规则
     *
     * @param templateId 模板ID
     * @return 通知规则列表
     */
    @Select("SELECT * FROM notification_rules WHERE template_id = #{templateId} AND deleted = 0")
    List<NotificationRule> selectByTemplateId(@Param("templateId") Long templateId);

    /**
     * 查询启用的通知规则数量
     *
     * @return 启用的规则数量
     */
    @Select("SELECT COUNT(*) FROM notification_rules WHERE enabled = 1 AND deleted = 0")
    Long countEnabledRules();

    /**
     * 增加规则执行次数
     *
     * @param ruleId 规则ID
     * @return 更新的记录数
     */
    @Update("UPDATE notification_rules SET execution_count = execution_count + 1, update_time = NOW() WHERE id = #{ruleId} AND deleted = 0")
    int incrementExecutionCount(@Param("ruleId") Long ruleId);

    /**
     * 查询执行次数超过限制的规则
     *
     * @return 超过限制的规则列表
     */
    @Select("SELECT * FROM notification_rules WHERE execution_limit > 0 AND execution_count >= execution_limit AND enabled = 1 AND deleted = 0")
    List<NotificationRule> selectOverLimitRules();

    /**
     * 根据接收者类型和接收者查询相关规则
     *
     * @param recipientType 接收者类型
     * @param recipient 接收者
     * @return 通知规则列表
     */
    @Select("SELECT * FROM notification_rules WHERE recipient_type = #{recipientType} AND JSON_CONTAINS(recipients, JSON_QUOTE(#{recipient})) AND enabled = 1 AND deleted = 0")
    List<NotificationRule> selectByRecipient(@Param("recipientType") String recipientType, @Param("recipient") String recipient);

    /**
     * 批量启用或禁用规则
     *
     * @param ruleIds 规则ID列表
     * @param enabled 启用状态
     * @return 更新的记录数
     */
    @Update("UPDATE notification_rules SET enabled = #{enabled}, update_time = NOW() WHERE id IN (${ruleIds}) AND deleted = 0")
    int batchUpdateEnabled(@Param("ruleIds") String ruleIds, @Param("enabled") Boolean enabled);
}