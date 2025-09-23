package com.erp.notification.mapper;

import com.erp.common.mapper.BaseMapperPlus;
import com.erp.notification.entity.NotificationTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 通知模板数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 *
 * @author ERP System
 */
@Mapper
public interface NotificationTemplateMapper extends BaseMapperPlus<NotificationTemplate> {

    /**
     * 根据模板编码查询模板
     *
     * @param templateCode 模板编码
     * @return 通知模板
     */
    @Select("SELECT * FROM notification_templates WHERE template_code = #{templateCode} AND deleted = 0")
    NotificationTemplate selectByTemplateCode(@Param("templateCode") String templateCode);

    /**
     * 根据通知类型查询模板列表
     *
     * @param notificationType 通知类型
     * @return 模板列表
     */
    @Select("SELECT * FROM notification_templates WHERE notification_type = #{notificationType} AND deleted = 0 ORDER BY sort_order ASC")
    List<NotificationTemplate> selectByNotificationType(@Param("notificationType") String notificationType);

    /**
     * 查询启用的模板列表
     *
     * @return 模板列表
     */
    @Select("SELECT * FROM notification_templates WHERE enabled = 1 AND deleted = 0 ORDER BY sort_order ASC")
    List<NotificationTemplate> selectEnabledTemplates();

    /**
     * 根据分类查询模板列表
     *
     * @param category 模板分类
     * @return 模板列表
     */
    @Select("SELECT * FROM notification_templates WHERE category = #{category} AND deleted = 0 ORDER BY sort_order ASC")
    List<NotificationTemplate> selectByCategory(@Param("category") String category);

    /**
     * 查询启用的模板数量
     *
     * @return 启用的模板数量
     */
    @Select("SELECT COUNT(*) FROM notification_templates WHERE enabled = 1 AND deleted = 0")
    Long countEnabledTemplates();

    /**
     * 根据模板编码检查是否存在（排除指定ID）
     *
     * @param templateCode 模板编码
     * @param excludeId 排除的ID
     * @return 是否存在
     */
    @Select("SELECT COUNT(*) > 0 FROM notification_templates WHERE template_code = #{templateCode} AND id != #{excludeId} AND deleted = 0")
    boolean existsByTemplateCodeExcludeId(@Param("templateCode") String templateCode, @Param("excludeId") Long excludeId);

    /**
     * 查询所有模板分类
     *
     * @return 分类列表
     */
    @Select("SELECT DISTINCT category FROM notification_templates WHERE category IS NOT NULL AND deleted = 0 ORDER BY category")
    List<String> selectAllCategories();
}