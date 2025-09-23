package com.erp.notification.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.service.impl.BaseServicePlusImpl;
import com.erp.common.exception.BusinessException;
import com.erp.common.response.PageResult;
import com.erp.notification.entity.NotificationTemplate;
import com.erp.notification.enums.NotificationType;
import com.erp.notification.mapper.NotificationTemplateMapper;
import com.erp.notification.service.NotificationTemplateServicePlus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 通知模板服务实现类
 * 继承ServiceImpl并实现BaseServicePlus接口，获得完整的增强功能
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class NotificationTemplateServicePlusImpl extends com.erp.common.service.impl.BaseServicePlusImpl<NotificationTemplateMapper, NotificationTemplate> 
    implements NotificationTemplateServicePlus {

    private final NotificationTemplateMapper templateMapper;

    @Override
    public PageResult<NotificationTemplate> getTemplatePage(Long page, Long size, NotificationType type, 
                                                          String category, Boolean enabled) {
        log.debug("分页查询通知模板，页码：{}，大小：{}，类型：{}，分类：{}，启用状态：{}", 
                 page, size, type, category, enabled);

        // 创建分页对象
        IPage<NotificationTemplate> pageObj = new Page<>(page, size);

        // 构建查询条件
        LambdaQueryWrapper<NotificationTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(type != null, NotificationTemplate::getNotificationType, type)
               .eq(StringUtils.hasText(category), NotificationTemplate::getCategory, category)
               .eq(enabled != null, NotificationTemplate::getEnabled, enabled)
               .orderByAsc(NotificationTemplate::getSortOrder)
               .orderByDesc(NotificationTemplate::getCreateTime);

        // 使用BaseServicePlus的pageQuery方法
        return pageQuery(pageObj, wrapper);
    }

    @Override
    public NotificationTemplate getByTemplateCode(String templateCode) {
        log.debug("根据模板编码查询模板，编码：{}", templateCode);

        if (!StringUtils.hasText(templateCode)) {
            return null;
        }

        // 使用自定义Mapper方法
        return templateMapper.selectByTemplateCode(templateCode);
    }

    @Override
    public List<NotificationTemplate> getEnabledTemplatesByType(NotificationType type) {
        log.debug("根据通知类型查询启用的模板，类型：{}", type);

        if (type == null) {
            return templateMapper.selectEnabledTemplates();
        }

        // 使用自定义Mapper方法
        return templateMapper.selectByNotificationType(type.getCode());
    }

    @Override
    public List<NotificationTemplate> getTemplatesByCategory(String category) {
        log.debug("根据分类查询模板，分类：{}", category);

        if (!StringUtils.hasText(category)) {
            return list();
        }

        // 使用自定义Mapper方法
        return templateMapper.selectByCategory(category);
    }

    @Override
    public List<String> getAllCategories() {
        log.debug("查询所有模板分类");

        // 使用自定义Mapper方法
        return templateMapper.selectAllCategories();
    }

    @Override
    public NotificationTemplate createTemplate(NotificationTemplate template) {
        log.debug("创建通知模板，编码：{}，名称：{}", template.getTemplateCode(), template.getTemplateName());

        // 验证模板编码唯一性
        if (!isTemplateCodeUnique(template.getTemplateCode(), null)) {
            throw new BusinessException("模板编码已存在：" + template.getTemplateCode());
        }

        // 设置默认值
        if (template.getEnabled() == null) {
            template.setEnabled(true);
        }
        if (template.getSortOrder() == null) {
            template.setSortOrder(0);
        }

        // 使用BaseServicePlus的save方法
        boolean success = save(template);

        if (success) {
            log.info("通知模板创建成功，模板ID：{}，编码：{}", template.getId(), template.getTemplateCode());
        } else {
            log.error("通知模板创建失败，编码：{}", template.getTemplateCode());
            throw new BusinessException("通知模板创建失败");
        }

        return template;
    }

    @Override
    public NotificationTemplate updateTemplate(NotificationTemplate template) {
        log.debug("更新通知模板，ID：{}，编码：{}", template.getId(), template.getTemplateCode());

        if (template.getId() == null) {
            throw new BusinessException("模板ID不能为空");
        }

        // 验证模板编码唯一性（排除当前模板）
        if (!isTemplateCodeUnique(template.getTemplateCode(), template.getId())) {
            throw new BusinessException("模板编码已存在：" + template.getTemplateCode());
        }

        // 使用BaseServicePlus的updateById方法
        boolean success = updateById(template);

        if (success) {
            log.info("通知模板更新成功，模板ID：{}，编码：{}", template.getId(), template.getTemplateCode());
        } else {
            log.error("通知模板更新失败，模板ID：{}", template.getId());
            throw new BusinessException("通知模板更新失败");
        }

        return template;
    }

    @Override
    public boolean toggleTemplateStatus(Long templateId, Boolean enabled) {
        log.debug("切换模板状态，模板ID：{}，启用状态：{}", templateId, enabled);

        if (templateId == null || enabled == null) {
            return false;
        }

        // 构建更新条件
        LambdaUpdateWrapper<NotificationTemplate> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(NotificationTemplate::getId, templateId)
               .set(NotificationTemplate::getEnabled, enabled);

        boolean success = update(wrapper);

        if (success) {
            log.info("模板状态切换成功，模板ID：{}，启用状态：{}", templateId, enabled);
        } else {
            log.warn("模板状态切换失败，模板ID：{}", templateId);
        }

        return success;
    }

    @Override
    public int batchToggleTemplateStatus(List<Long> templateIds, Boolean enabled) {
        log.debug("批量切换模板状态，模板ID列表：{}，启用状态：{}", templateIds, enabled);

        if (templateIds == null || templateIds.isEmpty() || enabled == null) {
            return 0;
        }

        // 先查询符合条件的记录数
        LambdaQueryWrapper<NotificationTemplate> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.in(NotificationTemplate::getId, templateIds);
        
        long count = count(queryWrapper);
        
        if (count > 0) {
            // 构建批量更新条件
            LambdaUpdateWrapper<NotificationTemplate> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.in(NotificationTemplate::getId, templateIds)
                        .set(NotificationTemplate::getEnabled, enabled);

            update(updateWrapper);
        }
        
        int updated = (int) count;
        log.info("批量切换模板状态完成，成功数量：{}，启用状态：{}", updated, enabled);

        return updated;
    }

    @Override
    public boolean isTemplateCodeUnique(String templateCode, Long excludeId) {
        if (!StringUtils.hasText(templateCode)) {
            return false;
        }

        if (excludeId == null) {
            // 新建时检查唯一性
            return !existsByField("template_code", templateCode);
        } else {
            // 更新时检查唯一性（排除当前记录）
            return !templateMapper.existsByTemplateCodeExcludeId(templateCode, excludeId);
        }
    }

    @Override
    public Map<String, Object> getTemplateStats() {
        log.debug("获取模板统计信息");

        Map<String, Object> stats = new HashMap<>();

        // 总模板数
        long totalCount = count();
        stats.put("totalCount", totalCount);

        // 启用模板数
        Long enabledCount = templateMapper.countEnabledTemplates();
        stats.put("enabledCount", enabledCount);

        // 禁用模板数
        long disabledCount = totalCount - enabledCount;
        stats.put("disabledCount", disabledCount);

        // 各类型模板数量
        for (NotificationType type : NotificationType.values()) {
            long typeCount = countByCondition(new LambdaQueryWrapper<NotificationTemplate>()
                    .eq(NotificationTemplate::getNotificationType, type));
            stats.put(type.getCode().toLowerCase() + "Count", typeCount);
        }

        // 各分类模板数量
        List<String> categories = getAllCategories();
        for (String category : categories) {
            long categoryCount = countByCondition(new LambdaQueryWrapper<NotificationTemplate>()
                    .eq(NotificationTemplate::getCategory, category));
            stats.put("category_" + category + "_count", categoryCount);
        }

        log.debug("模板统计信息：{}", stats);
        return stats;
    }
}