package com.erp.notification.service.impl;

import com.erp.notification.entity.NotificationTemplate;
import com.erp.notification.mapper.NotificationTemplateMapper;
import com.erp.notification.service.TemplateService;
import com.erp.common.exception.BusinessException;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import cn.hutool.core.util.StrUtil;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 模板服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    private final NotificationTemplateMapper templateMapper;
    private final TemplateEngine templateEngine;

    // 简单的变量替换模式 ${variableName}
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\$\\{([^}]+)\\}");

    @Override
    public String renderTemplate(String template, Map<String, Object> variables) {
        if (!StrUtil.isNotBlank(template)) {
            return template;
        }

        try {
            // 使用简单的字符串替换方式
            String result = template;
            if (variables != null && !variables.isEmpty()) {
                Matcher matcher = VARIABLE_PATTERN.matcher(template);
                StringBuffer sb = new StringBuffer();
                
                while (matcher.find()) {
                    String variableName = matcher.group(1);
                    Object value = variables.get(variableName);
                    String replacement = value != null ? value.toString() : "";
                    matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
                }
                matcher.appendTail(sb);
                result = sb.toString();
            }

            log.debug("模板渲染完成: template={}, result={}", template, result);
            return result;

        } catch (Exception e) {
            log.error("模板渲染失败: template={}", template, e);
            return template; // 渲染失败时返回原模板
        }
    }

    @Override
    public Long createTemplate(NotificationTemplate template) {
        log.info("创建通知模板: templateCode={}", template.getTemplateCode());

        // 验证模板编码唯一性
        QueryWrapper<NotificationTemplate> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("template_code", template.getTemplateCode());
        NotificationTemplate existing = templateMapper.selectOne(queryWrapper);
        if (existing != null) {
            throw new BusinessException("模板编码已存在: " + template.getTemplateCode());
        }

        // 验证模板语法
        if (!validateTemplate(template.getTitle()) || !validateTemplate(template.getContent())) {
            throw new BusinessException("模板语法错误");
        }

        template.setEnabled(true);
        templateMapper.insert(template);

        log.info("通知模板创建成功: templateId={}, templateCode={}", template.getId(), template.getTemplateCode());
        return template.getId();
    }

    @Override
    public boolean updateTemplate(NotificationTemplate template) {
        log.info("更新通知模板: templateId={}", template.getId());

        NotificationTemplate existing = templateMapper.selectById(template.getId());
        if (existing == null) {
            throw new BusinessException("模板不存在: " + template.getId());
        }

        // 验证模板语法
        if (!validateTemplate(template.getTitle()) || !validateTemplate(template.getContent())) {
            throw new BusinessException("模板语法错误");
        }

        int updated = templateMapper.updateById(template);
        boolean success = updated > 0;

        if (success) {
            log.info("通知模板更新成功: templateId={}", template.getId());
        } else {
            log.warn("通知模板更新失败: templateId={}", template.getId());
        }

        return success;
    }

    @Override
    public boolean deleteTemplate(Long templateId) {
        log.info("删除通知模板: templateId={}", templateId);

        NotificationTemplate template = templateMapper.selectById(templateId);
        if (template == null) {
            log.warn("模板不存在: templateId={}", templateId);
            return false;
        }

        // 软删除：设置状态为禁用
        template.setEnabled(false);
        int updated = templateMapper.updateById(template);
        boolean success = updated > 0;

        if (success) {
            log.info("通知模板删除成功: templateId={}", templateId);
        } else {
            log.warn("通知模板删除失败: templateId={}", templateId);
        }

        return success;
    }

    @Override
    public List<NotificationTemplate> getTemplates(String notificationType) {
        QueryWrapper<NotificationTemplate> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", "ACTIVE");
        
        if (StrUtil.isNotBlank(notificationType)) {
            queryWrapper.eq("notification_type", notificationType);
        }
        
        queryWrapper.orderByDesc("created_at");
        return templateMapper.selectList(queryWrapper);
    }

    @Override
    public boolean validateTemplate(String template) {
        if (!StrUtil.isNotBlank(template)) {
            return true; // 空模板认为是有效的
        }

        try {
            // 验证变量语法
            Matcher matcher = VARIABLE_PATTERN.matcher(template);
            while (matcher.find()) {
                String variableName = matcher.group(1);
                if (!StrUtil.isNotBlank(variableName)) {
                    log.warn("模板变量名为空: {}", template);
                    return false;
                }
                // 验证变量名格式（只允许字母、数字、下划线）
                if (!variableName.matches("^[a-zA-Z_][a-zA-Z0-9_]*$")) {
                    log.warn("模板变量名格式错误: {}", variableName);
                    return false;
                }
            }

            return true;

        } catch (Exception e) {
            log.error("模板验证失败: template={}", template, e);
            return false;
        }
    }
}