package com.erp.notification.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.notification.entity.NotificationTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 通知模板Mapper
 *
 * @author ERP System
 */
@Mapper
public interface NotificationTemplateMapper extends BaseMapper<NotificationTemplate> {

    /**
     * 根据模板编码查询模板
     *
     * @param templateCode 模板编码
     * @return 通知模板
     */
    NotificationTemplate selectByTemplateCode(@Param("templateCode") String templateCode);

    /**
     * 根据通知类型查询模板列表
     *
     * @param notificationType 通知类型
     * @return 模板列表
     */
    List<NotificationTemplate> selectByNotificationType(@Param("notificationType") String notificationType);

    /**
     * 查询启用的模板列表
     *
     * @return 模板列表
     */
    List<NotificationTemplate> selectActiveTemplates();
}