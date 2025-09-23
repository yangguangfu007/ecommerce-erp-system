package com.erp.notification.entity;

import com.erp.notification.enums.NotificationStatus;
import com.erp.notification.enums.NotificationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BaseEntity集成测试
 * 验证通知实体类继承BaseEntity的功能和JsonTypeHandler处理
 *
 * @author ERP System
 */
@DisplayName("BaseEntity集成测试")
class BaseEntityIntegrationTest {

    @Test
    @DisplayName("测试Notification继承BaseEntity的审计字段")
    void testNotificationBaseEntityAuditFields() {
        // 准备测试数据
        Notification notification = new Notification();
        notification.setTitle("测试通知");
        notification.setContent("测试内容");
        notification.setType(NotificationType.SYSTEM);
        notification.setStatus(NotificationStatus.UNREAD);
        
        // 模拟MyMetaObjectHandler自动填充的字段
        LocalDateTime now = LocalDateTime.now();
        notification.setCreateTime(now);
        notification.setUpdateTime(now);
        notification.setCreateBy(1L);
        notification.setUpdateBy(1L);
        notification.setDeleted(0);
        notification.setVersion(1);
        
        // 验证BaseEntity的审计字段
        assertThat(notification.getCreateTime()).isEqualTo(now);
        assertThat(notification.getUpdateTime()).isEqualTo(now);
        assertThat(notification.getCreateBy()).isEqualTo(1L);
        assertThat(notification.getUpdateBy()).isEqualTo(1L);
        assertThat(notification.getDeleted()).isEqualTo(0);
        assertThat(notification.getVersion()).isEqualTo(1);
        
        // 验证BaseEntity的方法
        assertThat(notification.isLogicallyDeleted()).isFalse();
    }

    @Test
    @DisplayName("测试NotificationTemplate继承BaseEntity的审计字段")
    void testNotificationTemplateBaseEntityAuditFields() {
        // 准备测试数据
        NotificationTemplate template = new NotificationTemplate();
        template.setTemplateCode("TEST_TEMPLATE");
        template.setTemplateName("测试模板");
        template.setNotificationType(NotificationType.SYSTEM);
        template.setTitle("测试标题");
        template.setContent("测试内容");
        
        // 模拟MyMetaObjectHandler自动填充的字段
        LocalDateTime now = LocalDateTime.now();
        template.setCreateTime(now);
        template.setUpdateTime(now);
        template.setCreateBy(1L);
        template.setUpdateBy(1L);
        template.setDeleted(0);
        template.setVersion(1);
        
        // 验证BaseEntity的审计字段
        assertThat(template.getCreateTime()).isEqualTo(now);
        assertThat(template.getUpdateTime()).isEqualTo(now);
        assertThat(template.getCreateBy()).isEqualTo(1L);
        assertThat(template.getUpdateBy()).isEqualTo(1L);
        assertThat(template.getDeleted()).isEqualTo(0);
        assertThat(template.getVersion()).isEqualTo(1);
        
        // 验证BaseEntity的方法
        assertThat(template.isLogicallyDeleted()).isFalse();
    }

    @Test
    @DisplayName("测试NotificationRule继承BaseEntity的审计字段")
    void testNotificationRuleBaseEntityAuditFields() {
        // 准备测试数据
        NotificationRule rule = new NotificationRule();
        rule.setRuleName("测试规则");
        rule.setEventType("TEST_EVENT");
        rule.setTemplateId(1L);
        
        // 模拟MyMetaObjectHandler自动填充的字段
        LocalDateTime now = LocalDateTime.now();
        rule.setCreateTime(now);
        rule.setUpdateTime(now);
        rule.setCreateBy(1L);
        rule.setUpdateBy(1L);
        rule.setDeleted(0);
        rule.setVersion(1);
        
        // 验证BaseEntity的审计字段
        assertThat(rule.getCreateTime()).isEqualTo(now);
        assertThat(rule.getUpdateTime()).isEqualTo(now);
        assertThat(rule.getCreateBy()).isEqualTo(1L);
        assertThat(rule.getUpdateBy()).isEqualTo(1L);
        assertThat(rule.getDeleted()).isEqualTo(0);
        assertThat(rule.getVersion()).isEqualTo(1);
        
        // 验证BaseEntity的方法
        assertThat(rule.isLogicallyDeleted()).isFalse();
    }

    @Test
    @DisplayName("测试JsonTypeHandler处理复杂JSON字段")
    void testJsonTypeHandlerProcessing() {
        // 测试Notification的extraData字段
        Notification notification = new Notification();
        Map<String, Object> extraData = new HashMap<>();
        extraData.put("orderId", "ORDER123");
        extraData.put("amount", 1000.50);
        extraData.put("items", Arrays.asList("item1", "item2", "item3"));
        extraData.put("metadata", Map.of("source", "web", "priority", "high"));
        
        notification.setExtraData(extraData);
        
        // 验证JSON字段设置和获取
        assertThat(notification.getExtraData()).isNotNull();
        assertThat(notification.getExtraData().get("orderId")).isEqualTo("ORDER123");
        assertThat(notification.getExtraData().get("amount")).isEqualTo(1000.50);
        assertThat(notification.getExtraData().get("items")).isInstanceOf(java.util.List.class);
        assertThat(notification.getExtraData().get("metadata")).isInstanceOf(java.util.Map.class);
        
        // 测试NotificationTemplate的variables字段
        NotificationTemplate template = new NotificationTemplate();
        template.setVariables(Arrays.asList("userName", "orderNumber", "amount"));
        
        assertThat(template.getVariables()).isNotNull();
        assertThat(template.getVariables()).hasSize(3);
        assertThat(template.getVariables()).contains("userName", "orderNumber", "amount");
        
        // 测试NotificationTemplate的templateConfig字段
        Map<String, Object> templateConfig = new HashMap<>();
        templateConfig.put("priority", "HIGH");
        templateConfig.put("expireHours", 24);
        templateConfig.put("allowMarkdown", true);
        template.setTemplateConfig(templateConfig);
        
        assertThat(template.getTemplateConfig()).isNotNull();
        assertThat(template.getTemplateConfig().get("priority")).isEqualTo("HIGH");
        assertThat(template.getTemplateConfig().get("expireHours")).isEqualTo(24);
        assertThat(template.getTemplateConfig().get("allowMarkdown")).isEqualTo(true);
    }

    @Test
    @DisplayName("测试逻辑删除功能")
    void testLogicalDeletion() {
        // 准备测试数据
        Notification notification = new Notification();
        notification.setTitle("测试通知");
        notification.setDeleted(0); // 未删除
        
        // 验证未删除状态
        assertThat(notification.isLogicallyDeleted()).isFalse();
        
        // 模拟逻辑删除
        notification.setDeleted(1);
        assertThat(notification.isLogicallyDeleted()).isTrue();
        
        // 测试模板的逻辑删除
        NotificationTemplate template = new NotificationTemplate();
        template.setTemplateName("测试模板");
        template.setDeleted(0);
        
        assertThat(template.isLogicallyDeleted()).isFalse();
        
        template.setDeleted(1);
        assertThat(template.isLogicallyDeleted()).isTrue();
        
        // 测试规则的逻辑删除
        NotificationRule rule = new NotificationRule();
        rule.setRuleName("测试规则");
        rule.setDeleted(0);
        
        assertThat(rule.isLogicallyDeleted()).isFalse();
        
        rule.setDeleted(1);
        assertThat(rule.isLogicallyDeleted()).isTrue();
    }

    @Test
    @DisplayName("测试乐观锁版本控制")
    void testOptimisticLockingVersion() {
        // 准备测试数据
        Notification notification = new Notification();
        notification.setTitle("测试通知");
        notification.setVersion(1); // 初始版本
        
        // 验证初始版本
        assertThat(notification.getVersion()).isEqualTo(1);
        
        // 模拟版本更新
        notification.setVersion(2);
        assertThat(notification.getVersion()).isEqualTo(2);
        
        // 测试模板的版本控制
        NotificationTemplate template = new NotificationTemplate();
        template.setTemplateName("测试模板");
        template.setVersion(1);
        
        assertThat(template.getVersion()).isEqualTo(1);
        
        template.setVersion(2);
        assertThat(template.getVersion()).isEqualTo(2);
        
        // 测试规则的版本控制
        NotificationRule rule = new NotificationRule();
        rule.setRuleName("测试规则");
        rule.setVersion(1);
        
        assertThat(rule.getVersion()).isEqualTo(1);
        
        rule.setVersion(2);
        assertThat(rule.getVersion()).isEqualTo(2);
    }

    @Test
    @DisplayName("测试实体新建状态判断")
    void testEntityNewStatus() {
        // 测试Notification新建状态
        Notification notification = new Notification();
        assertThat(notification.isNew()).isTrue();
        
        notification.setId(1L);
        assertThat(notification.isNew()).isFalse();
        
        // 测试NotificationTemplate新建状态
        NotificationTemplate template = new NotificationTemplate();
        assertThat(template.isNew()).isTrue();
        
        template.setId(1L);
        assertThat(template.isNew()).isFalse();
        
        // 测试NotificationRule新建状态
        NotificationRule rule = new NotificationRule();
        assertThat(rule.isNew()).isTrue();
        
        rule.setId(1L);
        assertThat(rule.isNew()).isFalse();
    }
}