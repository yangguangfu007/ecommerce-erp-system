package com.erp.notification.entity;

import com.erp.notification.enums.NotificationPriority;
import com.erp.notification.enums.NotificationStatus;
import com.erp.notification.enums.NotificationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 通知实体类单元测试
 *
 * @author ERP System
 */
@DisplayName("通知实体类测试")
class NotificationEntityTest {

    @Test
    @DisplayName("测试通知实体基本属性设置")
    void testNotificationBasicProperties() {
        // 准备测试数据
        Notification notification = new Notification();
        notification.setTitle("测试通知");
        notification.setContent("这是一条测试通知内容");
        notification.setType(NotificationType.SYSTEM);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setPriority(NotificationPriority.NORMAL);
        notification.setRecipientId(1L);
        notification.setRecipientName("测试用户");

        // 验证属性设置
        assertThat(notification.getTitle()).isEqualTo("测试通知");
        assertThat(notification.getContent()).isEqualTo("这是一条测试通知内容");
        assertThat(notification.getType()).isEqualTo(NotificationType.SYSTEM);
        assertThat(notification.getStatus()).isEqualTo(NotificationStatus.UNREAD);
        assertThat(notification.getPriority()).isEqualTo(NotificationPriority.NORMAL);
        assertThat(notification.getRecipientId()).isEqualTo(1L);
        assertThat(notification.getRecipientName()).isEqualTo("测试用户");
    }

    @Test
    @DisplayName("测试通知已读状态判断")
    void testIsReadMethod() {
        // 准备测试数据
        Notification notification = new Notification();
        
        // 测试未读状态
        notification.setStatus(NotificationStatus.UNREAD);
        assertThat(notification.isRead()).isFalse();
        
        // 测试已读状态
        notification.setStatus(NotificationStatus.READ);
        assertThat(notification.isRead()).isTrue();
    }

    @Test
    @DisplayName("测试通知过期状态判断")
    void testIsExpiredMethod() {
        // 准备测试数据
        Notification notification = new Notification();
        
        // 测试无过期时间
        assertThat(notification.isExpired()).isFalse();
        
        // 测试未过期
        notification.setExpireTime(LocalDateTime.now().plusDays(1));
        assertThat(notification.isExpired()).isFalse();
        
        // 测试已过期
        notification.setExpireTime(LocalDateTime.now().minusDays(1));
        assertThat(notification.isExpired()).isTrue();
    }

    @Test
    @DisplayName("测试标记为已读功能")
    void testMarkAsReadMethod() {
        // 准备测试数据
        Notification notification = new Notification();
        notification.setStatus(NotificationStatus.UNREAD);
        
        // 执行标记已读
        notification.markAsRead();
        
        // 验证结果
        assertThat(notification.getStatus()).isEqualTo(NotificationStatus.READ);
        assertThat(notification.getReadTime()).isNotNull();
        assertThat(notification.isRead()).isTrue();
    }

    @Test
    @DisplayName("测试扩展数据JSON字段")
    void testExtraDataJsonField() {
        // 准备测试数据
        Notification notification = new Notification();
        Map<String, Object> extraData = new HashMap<>();
        extraData.put("orderId", "ORDER123");
        extraData.put("amount", 1000.50);
        extraData.put("urgent", true);
        
        // 设置扩展数据
        notification.setExtraData(extraData);
        
        // 验证扩展数据
        assertThat(notification.getExtraData()).isNotNull();
        assertThat(notification.getExtraData().get("orderId")).isEqualTo("ORDER123");
        assertThat(notification.getExtraData().get("amount")).isEqualTo(1000.50);
        assertThat(notification.getExtraData().get("urgent")).isEqualTo(true);
    }

    @Test
    @DisplayName("测试业务相关字段")
    void testBusinessFields() {
        // 准备测试数据
        Notification notification = new Notification();
        notification.setBusinessType("ORDER");
        notification.setBusinessId("ORDER123");
        notification.setActionUrl("/orders/ORDER123");
        notification.setActionText("查看订单");
        notification.setIcon("order-icon");
        
        // 验证业务字段
        assertThat(notification.getBusinessType()).isEqualTo("ORDER");
        assertThat(notification.getBusinessId()).isEqualTo("ORDER123");
        assertThat(notification.getActionUrl()).isEqualTo("/orders/ORDER123");
        assertThat(notification.getActionText()).isEqualTo("查看订单");
        assertThat(notification.getIcon()).isEqualTo("order-icon");
    }

    @Test
    @DisplayName("测试实体描述信息")
    void testEntityDescription() {
        // 准备测试数据
        Notification notification = new Notification();
        notification.setId(1L);
        notification.setTitle("测试通知");
        notification.setRecipientName("测试用户");
        
        // 验证实体描述
        String description = notification.getEntityDescription();
        assertThat(description).contains("通知");
        assertThat(description).contains("id=1");
        assertThat(description).contains("title=测试通知");
        assertThat(description).contains("recipient=测试用户");
    }

    @Test
    @DisplayName("测试继承BaseEntity的功能")
    void testBaseEntityInheritance() {
        // 准备测试数据
        Notification notification = new Notification();
        
        // 测试新实体判断
        assertThat(notification.isNew()).isTrue();
        
        // 设置ID后测试
        notification.setId(1L);
        assertThat(notification.isNew()).isFalse();
        
        // 测试逻辑删除判断
        assertThat(notification.isLogicallyDeleted()).isFalse();
        
        notification.setDeleted(1);
        assertThat(notification.isLogicallyDeleted()).isTrue();
    }
}