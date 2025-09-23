package com.erp.notification.service;

import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.notification.entity.NotificationTemplate;
import com.erp.notification.enums.NotificationType;

import java.util.List;

/**
 * 通知模板服务接口
 * 继承BaseServicePlus获得增强的业务方法
 *
 * @author ERP System
 */
public interface NotificationTemplateServicePlus extends BaseServicePlus<NotificationTemplate> {

    /**
     * 分页查询通知模板
     *
     * @param page 页码
     * @param size 每页大小
     * @param type 通知类型（可选）
     * @param category 模板分类（可选）
     * @param enabled 是否启用（可选）
     * @return 分页结果
     */
    PageResult<NotificationTemplate> getTemplatePage(Long page, Long size, NotificationType type, 
                                                   String category, Boolean enabled);

    /**
     * 根据模板编码获取模板
     *
     * @param templateCode 模板编码
     * @return 通知模板
     */
    NotificationTemplate getByTemplateCode(String templateCode);

    /**
     * 根据通知类型获取启用的模板列表
     *
     * @param type 通知类型
     * @return 模板列表
     */
    List<NotificationTemplate> getEnabledTemplatesByType(NotificationType type);

    /**
     * 根据分类获取模板列表
     *
     * @param category 模板分类
     * @return 模板列表
     */
    List<NotificationTemplate> getTemplatesByCategory(String category);

    /**
     * 获取所有模板分类
     *
     * @return 分类列表
     */
    List<String> getAllCategories();

    /**
     * 创建通知模板
     *
     * @param template 模板对象
     * @return 创建的模板
     */
    NotificationTemplate createTemplate(NotificationTemplate template);

    /**
     * 更新通知模板
     *
     * @param template 模板对象
     * @return 更新的模板
     */
    NotificationTemplate updateTemplate(NotificationTemplate template);

    /**
     * 启用或禁用模板
     *
     * @param templateId 模板ID
     * @param enabled 是否启用
     * @return 是否成功
     */
    boolean toggleTemplateStatus(Long templateId, Boolean enabled);

    /**
     * 批量启用或禁用模板
     *
     * @param templateIds 模板ID列表
     * @param enabled 是否启用
     * @return 成功更新的数量
     */
    int batchToggleTemplateStatus(List<Long> templateIds, Boolean enabled);

    /**
     * 验证模板编码是否唯一
     *
     * @param templateCode 模板编码
     * @param excludeId 排除的ID（用于更新时验证）
     * @return 是否唯一
     */
    boolean isTemplateCodeUnique(String templateCode, Long excludeId);

    /**
     * 获取模板统计信息
     *
     * @return 统计信息Map
     */
    java.util.Map<String, Object> getTemplateStats();
}