package com.erp.notification.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.notification.entity.Notification;
import com.erp.notification.enums.NotificationPriority;
import com.erp.notification.enums.NotificationStatus;
import com.erp.notification.enums.NotificationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 通知Mapper单元测试
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("通知Mapper测试")
class NotificationMapperTest {

    @Autowired
    private NotificationMapper notificationMapper;

    @Test
    @DisplayName("测试BaseMapperPlus的基本CRUD操作")
    void testBaseMapperPlusCrudOperations() {
        // 准备测试数据
        Notification notification = new Notification();
        notification.setTitle("测试通知");
        notification.setContent("这是一条测试通知内容");
        notification.setType(NotificationType.SYSTEM);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setPriority(NotificationPriority.NORMAL);
        notification.setRecipientId(1L);
        notification.setRecipientName("测试用户");
        notification.setBusinessType("TEST");
        notification.setBusinessId("TEST001");

        // 测试插入
        int insertResult = notificationMapper.insert(notification);
        assertThat(insertResult).isEqualTo(1);
        assertThat(notification.getId()).isNotNull();

        // 测试根据ID查询
        Notification found = notificationMapper.selectById(notification.getId());
        assertThat(found).isNotNull();
        assertThat(found.getTitle()).isEqualTo("测试通知");
        assertThat(found.getType()).isEqualTo(NotificationType.SYSTEM);
        assertThat(found.getStatus()).isEqualTo(NotificationStatus.UNREAD);

        // 测试更新
        found.setStatus(NotificationStatus.READ);
        found.setReadTime(LocalDateTime.now());
        int updateResult = notificationMapper.updateById(found);
        assertThat(updateResult).isEqualTo(1);

        // 验证更新结果
        Notification updated = notificationMapper.selectById(notification.getId());
        assertThat(updated.getStatus()).isEqualTo(NotificationStatus.READ);
        assertThat(updated.getReadTime()).isNotNull();

        // 测试逻辑删除
        int deleteResult = notificationMapper.deleteById(notification.getId());
        assertThat(deleteResult).isEqualTo(1);

        // 验证逻辑删除结果（应该查询不到）
        Notification deleted = notificationMapper.selectById(notification.getId());
        assertThat(deleted).isNull();
    }

    @Test
    @DisplayName("测试BaseMapperPlus的增强查询方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 准备测试数据
        Notification notification1 = createTestNotification("通知1", NotificationStatus.UNREAD, 1L);
        Notification notification2 = createTestNotification("通知2", NotificationStatus.READ, 1L);
        Notification notification3 = createTestNotification("通知3", NotificationStatus.UNREAD, 2L);

        notificationMapper.insert(notification1);
        notificationMapper.insert(notification2);
        notificationMapper.insert(notification3);

        // 测试条件查询数量
        Long unreadCount = notificationMapper.selectCountByCondition(
            new LambdaQueryWrapper<Notification>()
                .eq(Notification::getRecipientId, 1L)
                .eq(Notification::getStatus, NotificationStatus.UNREAD)
        );
        assertThat(unreadCount).isEqualTo(1L);

        // 测试条件存在性检查
        boolean exists = notificationMapper.existsByCondition(
            new LambdaQueryWrapper<Notification>()
                .eq(Notification::getRecipientId, 2L)
                .eq(Notification::getStatus, NotificationStatus.UNREAD)
        );
        assertThat(exists).isTrue();

        // 测试条件查询列表
        List<Notification> userNotifications = notificationMapper.selectAllByCondition(
            new LambdaQueryWrapper<Notification>()
                .eq(Notification::getRecipientId, 1L)
                .orderByDesc(Notification::getCreateTime)
        );
        assertThat(userNotifications).hasSize(2);
        assertThat(userNotifications.get(0).getTitle()).contains("通知");

        // 清理测试数据
        notificationMapper.deleteById(notification1.getId());
        notificationMapper.deleteById(notification2.getId());
        notificationMapper.deleteById(notification3.getId());
    }

    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 准备测试数据
        Notification notification1 = createTestNotification("未读通知1", NotificationStatus.UNREAD, 1L);
        Notification notification2 = createTestNotification("未读通知2", NotificationStatus.UNREAD, 1L);
        Notification notification3 = createTestNotification("已读通知", NotificationStatus.READ, 1L);

        notificationMapper.insert(notification1);
        notificationMapper.insert(notification2);
        notificationMapper.insert(notification3);

        // 测试查询未读通知数量
        Long unreadCount = notificationMapper.countUnreadByRecipientId(1L);
        assertThat(unreadCount).isEqualTo(2L);

        // 测试查询最近通知
        List<Notification> recentNotifications = notificationMapper.selectRecentByRecipientId(1L, 5);
        assertThat(recentNotifications).hasSize(3);

        // 测试按业务查询
        notification1.setBusinessType("ORDER");
        notification1.setBusinessId("ORDER001");
        notificationMapper.updateById(notification1);

        List<Notification> businessNotifications = notificationMapper.selectByBusiness("ORDER", "ORDER001");
        assertThat(businessNotifications).hasSize(1);
        assertThat(businessNotifications.get(0).getTitle()).isEqualTo("未读通知1");

        // 测试按类型统计
        Long systemCount = notificationMapper.countByType(NotificationType.SYSTEM.getCode());
        assertThat(systemCount).isGreaterThanOrEqualTo(3L);

        // 清理测试数据
        notificationMapper.deleteById(notification1.getId());
        notificationMapper.deleteById(notification2.getId());
        notificationMapper.deleteById(notification3.getId());
    }

    /**
     * 创建测试通知
     */
    private Notification createTestNotification(String title, NotificationStatus status, Long recipientId) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setContent("测试内容");
        notification.setType(NotificationType.SYSTEM);
        notification.setStatus(status);
        notification.setPriority(NotificationPriority.NORMAL);
        notification.setRecipientId(recipientId);
        notification.setRecipientName("测试用户" + recipientId);
        return notification;
    }
}