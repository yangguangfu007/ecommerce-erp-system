package com.erp.notification.mapper;

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

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 简单Mapper测试
 * 验证BaseMapperPlus的基本功能和erp-common集成
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("简单Mapper测试")
class SimpleMapperTest {

    @Autowired
    private NotificationMapper notificationMapper;

    @Test
    @DisplayName("测试基本的CRUD操作和BaseMapperPlus功能")
    void testBasicCrudOperations() {
        // 准备测试数据
        Notification notification = new Notification();
        notification.setTitle("测试通知");
        notification.setContent("这是一条测试通知内容");
        notification.setType(NotificationType.SYSTEM);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setPriority(NotificationPriority.NORMAL);
        notification.setRecipientId(1L);
        notification.setRecipientName("测试用户");

        // 测试插入（BaseMapperPlus继承的方法）
        int insertResult = notificationMapper.insert(notification);
        assertThat(insertResult).isEqualTo(1);
        assertThat(notification.getId()).isNotNull();

        // 测试根据ID查询（BaseMapperPlus继承的方法）
        Notification found = notificationMapper.selectById(notification.getId());
        assertThat(found).isNotNull();
        assertThat(found.getTitle()).isEqualTo("测试通知");
        assertThat(found.getType()).isEqualTo(NotificationType.SYSTEM);
        assertThat(found.getStatus()).isEqualTo(NotificationStatus.UNREAD);

        // 验证BaseEntity的审计字段自动填充
        assertThat(found.getCreateTime()).isNotNull();
        assertThat(found.getUpdateTime()).isNotNull();
        assertThat(found.getDeleted()).isEqualTo(0);
        assertThat(found.getVersion()).isEqualTo(1);

        // 测试自定义查询方法
        Long unreadCount = notificationMapper.countUnreadByRecipientId(1L);
        assertThat(unreadCount).isGreaterThanOrEqualTo(1L);

        // 测试更新（BaseMapperPlus继承的方法）
        found.setStatus(NotificationStatus.READ);
        int updateResult = notificationMapper.updateById(found);
        assertThat(updateResult).isEqualTo(1);

        // 验证更新结果
        Notification updated = notificationMapper.selectById(notification.getId());
        assertThat(updated.getStatus()).isEqualTo(NotificationStatus.READ);

        // 测试逻辑删除（BaseMapperPlus继承的方法）
        int deleteResult = notificationMapper.deleteById(notification.getId());
        assertThat(deleteResult).isEqualTo(1);

        // 验证逻辑删除结果（应该查询不到，因为erp-common配置了逻辑删除）
        Notification deleted = notificationMapper.selectById(notification.getId());
        assertThat(deleted).isNull();
    }

    @Test
    @DisplayName("测试BaseMapperPlus的增强方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 准备测试数据
        Notification notification = new Notification();
        notification.setTitle("增强方法测试");
        notification.setContent("测试BaseMapperPlus的增强方法");
        notification.setType(NotificationType.SYSTEM);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setPriority(NotificationPriority.HIGH);
        notification.setRecipientId(2L);
        notification.setRecipientName("测试用户2");

        // 插入测试数据
        notificationMapper.insert(notification);

        // 测试BaseMapperPlus的selectCountByCondition方法
        Long count = notificationMapper.selectCountByCondition(null);
        assertThat(count).isGreaterThanOrEqualTo(1L);

        // 测试BaseMapperPlus的existsByCondition方法
        boolean exists = notificationMapper.existsByCondition(null);
        assertThat(exists).isTrue();

        // 清理测试数据
        notificationMapper.deleteById(notification.getId());
    }
}