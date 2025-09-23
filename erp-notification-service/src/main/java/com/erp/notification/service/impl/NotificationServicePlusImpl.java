package com.erp.notification.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.service.impl.BaseServicePlusImpl;
import com.erp.common.response.PageResult;
import com.erp.common.util.PageUtils;
import com.erp.notification.entity.Notification;
import com.erp.notification.enums.NotificationPriority;
import com.erp.notification.enums.NotificationStatus;
import com.erp.notification.enums.NotificationType;
import com.erp.notification.mapper.NotificationMapper;
import com.erp.notification.service.NotificationServicePlus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 通知服务实现类
 * 继承ServiceImpl并实现BaseServicePlus接口，获得完整的增强功能
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class NotificationServicePlusImpl extends com.erp.common.service.impl.BaseServicePlusImpl<NotificationMapper, Notification> 
    implements NotificationServicePlus {

    private final NotificationMapper notificationMapper;

    @Override
    public PageResult<Notification> getNotificationPage(Long recipientId, Long page, Long size, 
                                                       NotificationStatus status, NotificationType type) {
        log.debug("分页查询用户通知，用户ID：{}，页码：{}，大小：{}，状态：{}，类型：{}", 
                 recipientId, page, size, status, type);

        // 创建分页对象
        IPage<Notification> pageObj = new Page<>(page, size);

        // 构建查询条件
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getRecipientId, recipientId)
               .eq(status != null, Notification::getStatus, status)
               .eq(type != null, Notification::getType, type)
               .orderByDesc(Notification::getCreateTime);

        // 使用BaseServicePlus的pageQuery方法
        return pageQuery(pageObj, wrapper);
    }

    @Override
    public Long getUnreadCount(Long recipientId) {
        log.debug("查询用户未读通知数量，用户ID：{}", recipientId);

        // 使用自定义Mapper方法
        return notificationMapper.countUnreadByRecipientId(recipientId);
    }

    @Override
    public List<Notification> getRecentNotifications(Long recipientId, Integer limit) {
        log.debug("查询用户最近通知，用户ID：{}，限制数量：{}", recipientId, limit);

        // 使用自定义Mapper方法
        return notificationMapper.selectRecentByRecipientId(recipientId, limit);
    }

    @Override
    public boolean markAsRead(Long notificationId, Long recipientId) {
        log.debug("标记通知为已读，通知ID：{}，用户ID：{}", notificationId, recipientId);

        // 构建更新条件（确保只能操作自己的通知）
        LambdaUpdateWrapper<Notification> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Notification::getId, notificationId)
               .eq(Notification::getRecipientId, recipientId)
               .eq(Notification::getStatus, NotificationStatus.UNREAD);

        // 设置更新字段
        wrapper.set(Notification::getStatus, NotificationStatus.READ)
               .set(Notification::getReadTime, LocalDateTime.now());

        boolean success = update(wrapper);

        if (success) {
            log.info("通知标记已读成功，通知ID：{}，用户ID：{}", notificationId, recipientId);
        } else {
            log.warn("通知标记已读失败，通知ID：{}，用户ID：{}", notificationId, recipientId);
        }

        return success;
    }

    @Override
    public int batchMarkAsRead(List<Long> notificationIds, Long recipientId) {
        log.debug("批量标记通知为已读，通知ID列表：{}，用户ID：{}", notificationIds, recipientId);

        if (notificationIds == null || notificationIds.isEmpty()) {
            return 0;
        }

        // 先查询符合条件的记录数
        LambdaQueryWrapper<Notification> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.in(Notification::getId, notificationIds)
                   .eq(Notification::getRecipientId, recipientId)
                   .eq(Notification::getStatus, NotificationStatus.UNREAD);
        
        long count = count(queryWrapper);
        
        if (count > 0) {
            // 构建批量更新条件
            LambdaUpdateWrapper<Notification> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.in(Notification::getId, notificationIds)
                        .eq(Notification::getRecipientId, recipientId)
                        .eq(Notification::getStatus, NotificationStatus.UNREAD);

            // 设置更新字段
            updateWrapper.set(Notification::getStatus, NotificationStatus.READ)
                        .set(Notification::getReadTime, LocalDateTime.now());

            update(updateWrapper);
        }
        
        int updated = (int) count;
        log.info("批量标记通知已读完成，成功数量：{}，用户ID：{}", updated, recipientId);

        return updated;
    }

    @Override
    public boolean deleteNotification(Long notificationId, Long recipientId) {
        log.debug("删除通知，通知ID：{}，用户ID：{}", notificationId, recipientId);

        // 构建查询条件（确保只能删除自己的通知）
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getId, notificationId)
               .eq(Notification::getRecipientId, recipientId);

        // 使用BaseServicePlus的逻辑删除
        boolean success = remove(wrapper);

        if (success) {
            log.info("通知删除成功，通知ID：{}，用户ID：{}", notificationId, recipientId);
        } else {
            log.warn("通知删除失败，通知ID：{}，用户ID：{}", notificationId, recipientId);
        }

        return success;
    }

    @Override
    public int batchDeleteNotifications(List<Long> notificationIds, Long recipientId) {
        log.debug("批量删除通知，通知ID列表：{}，用户ID：{}", notificationIds, recipientId);

        if (notificationIds == null || notificationIds.isEmpty()) {
            return 0;
        }

        // 构建批量删除条件
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Notification::getId, notificationIds)
               .eq(Notification::getRecipientId, recipientId);

        // 查询要删除的通知数量
        long count = count(wrapper);
        
        // 执行批量逻辑删除
        boolean success = remove(wrapper);
        int deleted = success ? (int) count : 0;

        log.info("批量删除通知完成，成功数量：{}，用户ID：{}", deleted, recipientId);
        return deleted;
    }

    @Override
    public Notification createSystemNotification(String title, String content, Long recipientId, 
                                               String recipientName, String businessType, String businessId) {
        log.debug("创建系统通知，标题：{}，接收用户：{}({})", title, recipientName, recipientId);

        // 创建通知对象
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setContent(content);
        notification.setType(NotificationType.SYSTEM);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setPriority(NotificationPriority.NORMAL);
        notification.setRecipientId(recipientId);
        notification.setRecipientName(recipientName);
        notification.setBusinessType(businessType);
        notification.setBusinessId(businessId);

        // 使用BaseServicePlus的save方法
        boolean success = save(notification);

        if (success) {
            log.info("系统通知创建成功，通知ID：{}，标题：{}，接收用户：{}", 
                    notification.getId(), title, recipientName);
        } else {
            log.error("系统通知创建失败，标题：{}，接收用户：{}", title, recipientName);
        }

        return success ? notification : null;
    }

    @Override
    public List<Notification> getNotificationsByBusiness(String businessType, String businessId) {
        log.debug("根据业务信息查询通知，业务类型：{}，业务ID：{}", businessType, businessId);

        // 使用自定义Mapper方法
        return notificationMapper.selectByBusiness(businessType, businessId);
    }

    @Override
    public int cleanExpiredNotifications() {
        log.debug("开始清理过期通知");

        // 查询过期通知
        List<Notification> expiredNotifications = notificationMapper.selectExpiredNotifications();
        
        if (expiredNotifications.isEmpty()) {
            log.debug("没有找到过期通知");
            return 0;
        }

        // 提取过期通知ID
        List<Long> expiredIds = expiredNotifications.stream()
                .map(Notification::getId)
                .collect(Collectors.toList());

        // 批量逻辑删除过期通知
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Notification::getId, expiredIds);

        boolean success = remove(wrapper);
        int cleaned = success ? expiredIds.size() : 0;

        log.info("过期通知清理完成，清理数量：{}", cleaned);
        return cleaned;
    }

    @Override
    public Map<String, Object> getNotificationStats(Long recipientId) {
        log.debug("获取用户通知统计信息，用户ID：{}", recipientId);

        Map<String, Object> stats = new HashMap<>();

        // 总通知数
        long totalCount = countByField("recipient_id", recipientId);
        stats.put("totalCount", totalCount);

        // 未读通知数
        Long unreadCount = getUnreadCount(recipientId);
        stats.put("unreadCount", unreadCount);

        // 已读通知数
        long readCount = countByCondition(new LambdaQueryWrapper<Notification>()
                .eq(Notification::getRecipientId, recipientId)
                .eq(Notification::getStatus, NotificationStatus.READ));
        stats.put("readCount", readCount);

        // 各类型通知数量
        for (NotificationType type : NotificationType.values()) {
            long typeCount = countByCondition(new LambdaQueryWrapper<Notification>()
                    .eq(Notification::getRecipientId, recipientId)
                    .eq(Notification::getType, type));
            stats.put(type.getCode().toLowerCase() + "Count", typeCount);
        }

        // 各优先级通知数量
        for (NotificationPriority priority : NotificationPriority.values()) {
            long priorityCount = countByCondition(new LambdaQueryWrapper<Notification>()
                    .eq(Notification::getRecipientId, recipientId)
                    .eq(Notification::getPriority, priority));
            stats.put(priority.getCode().toLowerCase() + "Count", priorityCount);
        }

        log.debug("用户通知统计信息：{}", stats);
        return stats;
    }
}