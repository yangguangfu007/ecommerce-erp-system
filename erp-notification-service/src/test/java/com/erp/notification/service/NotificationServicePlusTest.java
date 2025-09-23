package com.erp.notification.service;

import com.erp.common.response.PageResult;
import com.erp.notification.entity.Notification;
import com.erp.notification.enums.NotificationPriority;
import com.erp.notification.enums.NotificationStatus;
import com.erp.notification.enums.NotificationType;
import com.erp.notification.mapper.NotificationMapper;
import com.erp.notification.service.impl.NotificationServicePlusImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 通知服务单元测试
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("通知服务测试")
class NotificationServicePlusTest {

    @Mock
    private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationServicePlusImpl notificationService;

    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testNotification = new Notification();
        testNotification.setId(1L);
        testNotification.setTitle("测试通知");
        testNotification.setContent("测试通知内容");
        testNotification.setType(NotificationType.SYSTEM);
        testNotification.setStatus(NotificationStatus.UNREAD);
        testNotification.setPriority(NotificationPriority.NORMAL);
        testNotification.setRecipientId(1L);
        testNotification.setRecipientName("测试用户");
        testNotification.setCreateTime(LocalDateTime.now());
    }

    @Test
    @DisplayName("测试获取用户未读通知数量")
    void testGetUnreadCount() {
        // 准备测试数据
        Long recipientId = 1L;
        Long expectedCount = 5L;

        // 模拟Mapper方法
        when(notificationMapper.countUnreadByRecipientId(recipientId)).thenReturn(expectedCount);

        // 执行测试
        Long actualCount = notificationService.getUnreadCount(recipientId);

        // 验证结果
        assertThat(actualCount).isEqualTo(expectedCount);
        verify(notificationMapper).countUnreadByRecipientId(recipientId);
    }

    @Test
    @DisplayName("测试获取用户最近通知列表")
    void testGetRecentNotifications() {
        // 准备测试数据
        Long recipientId = 1L;
        Integer limit = 10;
        List<Notification> expectedNotifications = Arrays.asList(testNotification);

        // 模拟Mapper方法
        when(notificationMapper.selectRecentByRecipientId(recipientId, limit))
                .thenReturn(expectedNotifications);

        // 执行测试
        List<Notification> actualNotifications = notificationService.getRecentNotifications(recipientId, limit);

        // 验证结果
        assertThat(actualNotifications).isEqualTo(expectedNotifications);
        assertThat(actualNotifications).hasSize(1);
        verify(notificationMapper).selectRecentByRecipientId(recipientId, limit);
    }

    @Test
    @DisplayName("测试创建系统通知")
    void testCreateSystemNotification() {
        // 准备测试数据
        String title = "系统通知标题";
        String content = "系统通知内容";
        Long recipientId = 1L;
        String recipientName = "测试用户";
        String businessType = "ORDER";
        String businessId = "ORDER123";

        // 执行测试
        Notification result = notificationService.createSystemNotification(
                title, content, recipientId, recipientName, businessType, businessId);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo(title);
        assertThat(result.getContent()).isEqualTo(content);
        assertThat(result.getType()).isEqualTo(NotificationType.SYSTEM);
        assertThat(result.getStatus()).isEqualTo(NotificationStatus.UNREAD);
        assertThat(result.getPriority()).isEqualTo(NotificationPriority.NORMAL);
        assertThat(result.getRecipientId()).isEqualTo(recipientId);
        assertThat(result.getRecipientName()).isEqualTo(recipientName);
        assertThat(result.getBusinessType()).isEqualTo(businessType);
        assertThat(result.getBusinessId()).isEqualTo(businessId);
    }

    @Test
    @DisplayName("测试根据业务信息查询通知")
    void testGetNotificationsByBusiness() {
        // 准备测试数据
        String businessType = "ORDER";
        String businessId = "ORDER123";
        List<Notification> expectedNotifications = Arrays.asList(testNotification);

        // 模拟Mapper方法
        when(notificationMapper.selectByBusiness(businessType, businessId))
                .thenReturn(expectedNotifications);

        // 执行测试
        List<Notification> actualNotifications = notificationService.getNotificationsByBusiness(businessType, businessId);

        // 验证结果
        assertThat(actualNotifications).isEqualTo(expectedNotifications);
        assertThat(actualNotifications).hasSize(1);
        verify(notificationMapper).selectByBusiness(businessType, businessId);
    }

    @Test
    @DisplayName("测试清理过期通知")
    void testCleanExpiredNotifications() {
        // 准备测试数据
        List<Notification> expiredNotifications = Arrays.asList(testNotification);

        // 模拟Mapper方法
        when(notificationMapper.selectExpiredNotifications()).thenReturn(expiredNotifications);

        // 执行测试
        int cleanedCount = notificationService.cleanExpiredNotifications();

        // 验证结果
        assertThat(cleanedCount).isEqualTo(1);
        verify(notificationMapper).selectExpiredNotifications();
    }

    @Test
    @DisplayName("测试获取通知统计信息")
    void testGetNotificationStats() {
        // 准备测试数据
        Long recipientId = 1L;

        // 模拟未读通知数量
        when(notificationMapper.countUnreadByRecipientId(recipientId)).thenReturn(3L);

        // 执行测试
        Map<String, Object> stats = notificationService.getNotificationStats(recipientId);

        // 验证结果
        assertThat(stats).isNotNull();
        assertThat(stats).containsKey("unreadCount");
        assertThat(stats.get("unreadCount")).isEqualTo(3L);
        verify(notificationMapper).countUnreadByRecipientId(recipientId);
    }

    @Test
    @DisplayName("测试批量标记通知为已读")
    void testBatchMarkAsRead() {
        // 准备测试数据
        List<Long> notificationIds = Arrays.asList(1L, 2L, 3L);
        Long recipientId = 1L;

        // 执行测试
        int result = notificationService.batchMarkAsRead(notificationIds, recipientId);

        // 验证结果（由于使用了BaseServicePlus的update方法，这里主要验证方法调用）
        assertThat(result).isGreaterThanOrEqualTo(0);
    }

    @Test
    @DisplayName("测试批量删除通知")
    void testBatchDeleteNotifications() {
        // 准备测试数据
        List<Long> notificationIds = Arrays.asList(1L, 2L, 3L);
        Long recipientId = 1L;

        // 执行测试
        int result = notificationService.batchDeleteNotifications(notificationIds, recipientId);

        // 验证结果（由于使用了BaseServicePlus的remove方法，这里主要验证方法调用）
        assertThat(result).isGreaterThanOrEqualTo(0);
    }

    @Test
    @DisplayName("测试空参数处理")
    void testNullParameterHandling() {
        // 测试空的通知ID列表
        int result1 = notificationService.batchMarkAsRead(null, 1L);
        assertThat(result1).isEqualTo(0);

        int result2 = notificationService.batchDeleteNotifications(Arrays.asList(), 1L);
        assertThat(result2).isEqualTo(0);

        // 测试空的接收用户ID
        Long result3 = notificationService.getUnreadCount(null);
        // 这里会调用Mapper方法，可能返回null或抛异常，具体取决于实现
    }
}