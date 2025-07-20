package com.erp.notification.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.notification.entity.NotificationConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 通知配置Mapper
 *
 * @author ERP System
 */
@Mapper
public interface NotificationConfigMapper extends BaseMapper<NotificationConfig> {

    /**
     * 根据用户ID和业务类型查询配置
     *
     * @param userId 用户ID
     * @param businessType 业务类型
     * @return 通知配置列表
     */
    List<NotificationConfig> selectByUserAndBusiness(
            @Param("userId") Long userId,
            @Param("businessType") String businessType
    );

    /**
     * 根据用户ID查询启用的配置
     *
     * @param userId 用户ID
     * @return 通知配置列表
     */
    List<NotificationConfig> selectEnabledByUser(@Param("userId") Long userId);

    /**
     * 查询用户的通知偏好
     *
     * @param userId 用户ID
     * @param notificationType 通知类型
     * @param businessType 业务类型
     * @return 通知配置
     */
    NotificationConfig selectUserPreference(
            @Param("userId") Long userId,
            @Param("notificationType") String notificationType,
            @Param("businessType") String businessType
    );
}