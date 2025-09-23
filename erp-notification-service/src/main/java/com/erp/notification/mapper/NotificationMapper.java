package com.erp.notification.mapper;

import com.erp.common.mapper.BaseMapperPlus;
import com.erp.notification.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 通知数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 *
 * @author ERP System
 */
@Mapper
public interface NotificationMapper extends BaseMapperPlus<Notification> {

    /**
     * 根据接收用户ID查询未读通知数量
     *
     * @param recipientId 接收用户ID
     * @return 未读通知数量
     */
    @Select("SELECT COUNT(*) FROM notifications WHERE recipient_id = #{recipientId} AND status = 'UNREAD' AND deleted = 0")
    Long countUnreadByRecipientId(@Param("recipientId") Long recipientId);

    /**
     * 根据接收用户ID查询通知列表（按创建时间倒序）
     *
     * @param recipientId 接收用户ID
     * @param limit 限制数量
     * @return 通知列表
     */
    @Select("SELECT * FROM notifications WHERE recipient_id = #{recipientId} AND deleted = 0 ORDER BY create_time DESC LIMIT #{limit}")
    List<Notification> selectRecentByRecipientId(@Param("recipientId") Long recipientId, @Param("limit") Integer limit);

    /**
     * 根据业务类型和业务ID查询通知列表
     *
     * @param businessType 业务类型
     * @param businessId 业务ID
     * @return 通知列表
     */
    @Select("SELECT * FROM notifications WHERE business_type = #{businessType} AND business_id = #{businessId} AND deleted = 0 ORDER BY create_time DESC")
    List<Notification> selectByBusiness(@Param("businessType") String businessType, @Param("businessId") String businessId);

    /**
     * 根据通知类型统计数量
     *
     * @param type 通知类型
     * @return 通知数量
     */
    @Select("SELECT COUNT(*) FROM notifications WHERE type = #{type} AND deleted = 0")
    Long countByType(@Param("type") String type);

    /**
     * 查询即将过期的通知列表
     *
     * @return 即将过期的通知列表
     */
    @Select("SELECT * FROM notifications WHERE expire_time IS NOT NULL AND expire_time <= NOW() AND status != 'DELETED' AND deleted = 0")
    List<Notification> selectExpiredNotifications();

    /**
     * 批量更新通知状态为已读
     *
     * @param notificationIds 通知ID列表
     * @param recipientId 接收用户ID（用于安全验证）
     * @return 更新的记录数
     */
    @Select("UPDATE notifications SET status = 'READ', read_time = NOW(), update_time = NOW() WHERE id IN (${notificationIds}) AND recipient_id = #{recipientId} AND deleted = 0")
    int batchMarkAsRead(@Param("notificationIds") String notificationIds, @Param("recipientId") Long recipientId);
}