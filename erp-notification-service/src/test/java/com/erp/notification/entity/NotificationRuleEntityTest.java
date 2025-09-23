package com.erp.notification.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 通知规则实体类单元测试
 *
 * @author ERP System
 */
@DisplayName("通知规则实体类测试")
class NotificationRuleEntityTest {

    @Test
    @DisplayName("测试通知规则基本属性设置")
    void testNotificationRuleBasicProperties() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        rule.setRuleName("订单创建通知规则");
        rule.setDescription("订单创建时发送通知");
        rule.setEventType("ORDER_CREATED");
        rule.setBusinessType("ORDER");
        rule.setTemplateId(1L);
        rule.setRecipientType("ROLE");
        rule.setEnabled(true);
        rule.setPriority(1);
        rule.setExecutionLimit(0);
        rule.setExecutionCount(0);

        // 验证属性设置
        assertThat(rule.getRuleName()).isEqualTo("订单创建通知规则");
        assertThat(rule.getDescription()).isEqualTo("订单创建时发送通知");
        assertThat(rule.getEventType()).isEqualTo("ORDER_CREATED");
        assertThat(rule.getBusinessType()).isEqualTo("ORDER");
        assertThat(rule.getTemplateId()).isEqualTo(1L);
        assertThat(rule.getRecipientType()).isEqualTo("ROLE");
        assertThat(rule.getEnabled()).isTrue();
        assertThat(rule.getPriority()).isEqualTo(1);
        assertThat(rule.getExecutionLimit()).isEqualTo(0);
        assertThat(rule.getExecutionCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("测试规则条件JSON字段")
    void testRuleConditionsJsonField() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        
        NotificationRule.RuleCondition condition1 = new NotificationRule.RuleCondition();
        condition1.setField("amount");
        condition1.setOperator("gt");
        condition1.setValue(1000);
        condition1.setLogic("AND");
        
        NotificationRule.RuleCondition condition2 = new NotificationRule.RuleCondition();
        condition2.setField("status");
        condition2.setOperator("eq");
        condition2.setValue("CREATED");
        condition2.setLogic("AND");
        
        List<NotificationRule.RuleCondition> conditions = Arrays.asList(condition1, condition2);
        
        // 设置规则条件
        rule.setRuleConditions(conditions);
        
        // 验证规则条件
        assertThat(rule.getRuleConditions()).isNotNull();
        assertThat(rule.getRuleConditions()).hasSize(2);
        
        NotificationRule.RuleCondition firstCondition = rule.getRuleConditions().get(0);
        assertThat(firstCondition.getField()).isEqualTo("amount");
        assertThat(firstCondition.getOperator()).isEqualTo("gt");
        assertThat(firstCondition.getValue()).isEqualTo(1000);
        assertThat(firstCondition.getLogic()).isEqualTo("AND");
    }

    @Test
    @DisplayName("测试接收者配置JSON字段")
    void testRecipientsJsonField() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        List<String> recipients = Arrays.asList("ORDER_MANAGER", "ADMIN", "FINANCE_MANAGER");
        
        // 设置接收者配置
        rule.setRecipients(recipients);
        
        // 验证接收者配置
        assertThat(rule.getRecipients()).isNotNull();
        assertThat(rule.getRecipients()).hasSize(3);
        assertThat(rule.getRecipients()).contains("ORDER_MANAGER", "ADMIN", "FINANCE_MANAGER");
    }

    @Test
    @DisplayName("测试规则配置JSON字段")
    void testRuleConfigJsonField() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        Map<String, Object> config = new HashMap<>();
        config.put("delayMinutes", 5);
        config.put("retryCount", 3);
        config.put("batchSize", 100);
        config.put("enableDeduplication", true);
        
        // 设置规则配置
        rule.setRuleConfig(config);
        
        // 验证规则配置
        assertThat(rule.getRuleConfig()).isNotNull();
        assertThat(rule.getRuleConfig().get("delayMinutes")).isEqualTo(5);
        assertThat(rule.getRuleConfig().get("retryCount")).isEqualTo(3);
        assertThat(rule.getRuleConfig().get("batchSize")).isEqualTo(100);
        assertThat(rule.getRuleConfig().get("enableDeduplication")).isEqualTo(true);
    }

    @Test
    @DisplayName("测试规则启用状态判断")
    void testIsEnabledMethod() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        
        // 测试null值
        assertThat(rule.isEnabled()).isFalse();
        
        // 测试false值
        rule.setEnabled(false);
        assertThat(rule.isEnabled()).isFalse();
        
        // 测试true值
        rule.setEnabled(true);
        assertThat(rule.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("测试执行次数限制判断")
    void testIsExecutionLimitReachedMethod() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        
        // 测试无限制（null值）
        assertThat(rule.isExecutionLimitReached()).isFalse();
        
        // 测试无限制（0值）
        rule.setExecutionLimit(0);
        assertThat(rule.isExecutionLimitReached()).isFalse();
        
        // 测试未达到限制
        rule.setExecutionLimit(10);
        rule.setExecutionCount(5);
        assertThat(rule.isExecutionLimitReached()).isFalse();
        
        // 测试达到限制
        rule.setExecutionCount(10);
        assertThat(rule.isExecutionLimitReached()).isTrue();
        
        // 测试超过限制
        rule.setExecutionCount(15);
        assertThat(rule.isExecutionLimitReached()).isTrue();
    }

    @Test
    @DisplayName("测试增加执行次数")
    void testIncrementExecutionCountMethod() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        
        // 测试从null开始
        rule.incrementExecutionCount();
        assertThat(rule.getExecutionCount()).isEqualTo(1);
        
        // 测试继续增加
        rule.incrementExecutionCount();
        assertThat(rule.getExecutionCount()).isEqualTo(2);
        
        rule.incrementExecutionCount();
        assertThat(rule.getExecutionCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("测试规则条件内部类")
    void testRuleConditionInnerClass() {
        // 准备测试数据
        NotificationRule.RuleCondition condition = new NotificationRule.RuleCondition();
        condition.setField("orderAmount");
        condition.setOperator("gte");
        condition.setValue(500.0);
        condition.setLogic("OR");
        
        // 验证规则条件属性
        assertThat(condition.getField()).isEqualTo("orderAmount");
        assertThat(condition.getOperator()).isEqualTo("gte");
        assertThat(condition.getValue()).isEqualTo(500.0);
        assertThat(condition.getLogic()).isEqualTo("OR");
    }

    @Test
    @DisplayName("测试实体描述信息")
    void testEntityDescription() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        rule.setId(1L);
        rule.setRuleName("订单创建通知规则");
        rule.setEventType("ORDER_CREATED");
        
        // 验证实体描述
        String description = rule.getEntityDescription();
        assertThat(description).contains("通知规则");
        assertThat(description).contains("id=1");
        assertThat(description).contains("name=订单创建通知规则");
        assertThat(description).contains("event=ORDER_CREATED");
    }

    @Test
    @DisplayName("测试继承BaseEntity的功能")
    void testBaseEntityInheritance() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        
        // 测试新实体判断
        assertThat(rule.isNew()).isTrue();
        
        // 设置ID后测试
        rule.setId(1L);
        assertThat(rule.isNew()).isFalse();
        
        // 测试逻辑删除判断
        assertThat(rule.isLogicallyDeleted()).isFalse();
        
        rule.setDeleted(1);
        assertThat(rule.isLogicallyDeleted()).isTrue();
    }

    @Test
    @DisplayName("测试不同接收者类型")
    void testRecipientTypes() {
        // 测试用户类型
        NotificationRule userRule = new NotificationRule();
        userRule.setRecipientType("USER");
        userRule.setRecipients(Arrays.asList("user1", "user2"));
        assertThat(userRule.getRecipientType()).isEqualTo("USER");
        
        // 测试角色类型
        NotificationRule roleRule = new NotificationRule();
        roleRule.setRecipientType("ROLE");
        roleRule.setRecipients(Arrays.asList("ADMIN", "MANAGER"));
        assertThat(roleRule.getRecipientType()).isEqualTo("ROLE");
        
        // 测试用户组类型
        NotificationRule groupRule = new NotificationRule();
        groupRule.setRecipientType("GROUP");
        groupRule.setRecipients(Arrays.asList("sales_team", "support_team"));
        assertThat(groupRule.getRecipientType()).isEqualTo("GROUP");
    }
}