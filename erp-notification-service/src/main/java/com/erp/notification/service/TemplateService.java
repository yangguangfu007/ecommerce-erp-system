package com.erp.notification.service;

import com.erp.notification.entity.NotificationTemplate;

import java.util.List;
import java.util.Map;

/**
 * 模板服务接口
 *
 * @author ERP System
 */
public interface TemplateService {

    /**
     * 渲染模板
     *
     * @param template 模板内容
     * @param variables 变量
     * @return 渲染后的内容
     */
    String renderTemplate(String template, Map<String, Object> variables);

    /**
     * 创建通知模板
     *
     * @param template 模板对象
     * @return 模板ID
     */
    Long createTemplate(NotificationTemplate template);

    /**
     * 更新通知模板
     *
     * @param template 模板对象
     * @return 是否成功
     */
    boolean updateTemplate(NotificationTemplate template);

    /**
     * 删除通知模板
     *
     * @param templateId 模板ID
     * @return 是否成功
     */
    boolean deleteTemplate(Long templateId);

    /**
     * 获取模板列表
     *
     * @param notificationType 通知类型
     * @return 模板列表
     */
    List<NotificationTemplate> getTemplates(String notificationType);

    /**
     * 验证模板语法
     *
     * @param template 模板内容
     * @return 是否有效
     */
    boolean validateTemplate(String template);
}