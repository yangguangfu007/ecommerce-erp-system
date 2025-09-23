package com.erp.notification.entity;

import com.erp.notification.enums.NotificationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 通知模板实体类单元测试
 *
 * @author ERP System
 */
@DisplayName("通知模板实体类测试")
class NotificationTemplateEntityTest {

    @Test
    @DisplayName("测试通知模板基本属性设置")
    void testNotificationTemplateBasicProperties() {
        // 准备测试数据
        NotificationTemplate template = new NotificationTemplate();
        template.setTemplateCode("ORDER_CREATED");
        template.setTemplateName("订单创建通知模板");
        template.setNotificationType(NotificationType.SYSTEM);
        template.setTitle("新订单创建");
        template.setContent("您有一个新订单：${orderNumber}");
        template.setEnabled(true);
        template.setDescription("订单创建时发送的通知模板");
        template.setCategory("订单通知");
        template.setSortOrder(1);

        // 验证属性设置
        assertThat(template.getTemplateCode()).isEqualTo("ORDER_CREATED");
        assertThat(template.getTemplateName()).isEqualTo("订单创建通知模板");
        assertThat(template.getNotificationType()).isEqualTo(NotificationType.SYSTEM);
        assertThat(template.getTitle()).isEqualTo("新订单创建");
        assertThat(template.getContent()).isEqualTo("您有一个新订单：${orderNumber}");
        assertThat(template.getEnabled()).isTrue();
        assertThat(template.getDescription()).isEqualTo("订单创建时发送的通知模板");
        assertThat(template.getCategory()).isEqualTo("订单通知");
        assertThat(template.getSortOrder()).isEqualTo(1);
    }

    @Test
    @DisplayName("测试模板变量JSON字段")
    void testVariablesJsonField() {
        // 准备测试数据
        NotificationTemplate template = new NotificationTemplate();
        List<String> variables = Arrays.asList("orderNumber", "customerName", "amount");
        
        // 设置模板变量
        template.setVariables(variables);
        
        // 验证模板变量
        assertThat(template.getVariables()).isNotNull();
        assertThat(template.getVariables()).hasSize(3);
        assertThat(template.getVariables()).contains("orderNumber", "customerName", "amount");
    }

    @Test
    @DisplayName("测试模板配置JSON字段")
    void testTemplateConfigJsonField() {
        // 准备测试数据
        NotificationTemplate template = new NotificationTemplate();
        Map<String, Object> config = new HashMap<>();
        config.put("priority", "HIGH");
        config.put("expireHours", 24);
        config.put("allowMarkdown", true);
        
        // 设置模板配置
        template.setTemplateConfig(config);
        
        // 验证模板配置
        assertThat(template.getTemplateConfig()).isNotNull();
        assertThat(template.getTemplateConfig().get("priority")).isEqualTo("HIGH");
        assertThat(template.getTemplateConfig().get("expireHours")).isEqualTo(24);
        assertThat(template.getTemplateConfig().get("allowMarkdown")).isEqualTo(true);
    }

    @Test
    @DisplayName("测试模板启用状态判断")
    void testIsEnabledMethod() {
        // 准备测试数据
        NotificationTemplate template = new NotificationTemplate();
        
        // 测试null值
        assertThat(template.isEnabled()).isFalse();
        
        // 测试false值
        template.setEnabled(false);
        assertThat(template.isEnabled()).isFalse();
        
        // 测试true值
        template.setEnabled(true);
        assertThat(template.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("测试不同通知类型")
    void testNotificationTypes() {
        // 测试系统通知类型
        NotificationTemplate systemTemplate = new NotificationTemplate();
        systemTemplate.setNotificationType(NotificationType.SYSTEM);
        assertThat(systemTemplate.getNotificationType()).isEqualTo(NotificationType.SYSTEM);
        
        // 测试邮件通知类型
        NotificationTemplate emailTemplate = new NotificationTemplate();
        emailTemplate.setNotificationType(NotificationType.EMAIL);
        assertThat(emailTemplate.getNotificationType()).isEqualTo(NotificationType.EMAIL);
        
        // 测试短信通知类型
        NotificationTemplate smsTemplate = new NotificationTemplate();
        smsTemplate.setNotificationType(NotificationType.SMS);
        assertThat(smsTemplate.getNotificationType()).isEqualTo(NotificationType.SMS);
        
        // 测试推送通知类型
        NotificationTemplate pushTemplate = new NotificationTemplate();
        pushTemplate.setNotificationType(NotificationType.PUSH);
        assertThat(pushTemplate.getNotificationType()).isEqualTo(NotificationType.PUSH);
    }

    @Test
    @DisplayName("测试实体描述信息")
    void testEntityDescription() {
        // 准备测试数据
        NotificationTemplate template = new NotificationTemplate();
        template.setId(1L);
        template.setTemplateCode("ORDER_CREATED");
        template.setTemplateName("订单创建通知模板");
        
        // 验证实体描述
        String description = template.getEntityDescription();
        assertThat(description).contains("通知模板");
        assertThat(description).contains("id=1");
        assertThat(description).contains("code=ORDER_CREATED");
        assertThat(description).contains("name=订单创建通知模板");
    }

    @Test
    @DisplayName("测试继承BaseEntity的功能")
    void testBaseEntityInheritance() {
        // 准备测试数据
        NotificationTemplate template = new NotificationTemplate();
        
        // 测试新实体判断
        assertThat(template.isNew()).isTrue();
        
        // 设置ID后测试
        template.setId(1L);
        assertThat(template.isNew()).isFalse();
        
        // 测试逻辑删除判断
        assertThat(template.isLogicallyDeleted()).isFalse();
        
        template.setDeleted(1);
        assertThat(template.isLogicallyDeleted()).isTrue();
    }

    @Test
    @DisplayName("测试模板内容和变量的关联")
    void testContentAndVariablesRelation() {
        // 准备测试数据
        NotificationTemplate template = new NotificationTemplate();
        template.setContent("订单${orderNumber}已创建，客户：${customerName}，金额：${amount}元");
        template.setVariables(Arrays.asList("orderNumber", "customerName", "amount"));
        
        // 验证内容和变量的关联
        String content = template.getContent();
        List<String> variables = template.getVariables();
        
        assertThat(content).contains("${orderNumber}");
        assertThat(content).contains("${customerName}");
        assertThat(content).contains("${amount}");
        
        assertThat(variables).contains("orderNumber");
        assertThat(variables).contains("customerName");
        assertThat(variables).contains("amount");
    }
}