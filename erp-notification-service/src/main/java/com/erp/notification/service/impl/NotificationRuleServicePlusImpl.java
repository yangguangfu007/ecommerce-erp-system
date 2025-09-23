package com.erp.notification.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.service.impl.BaseServicePlusImpl;
import com.erp.common.exception.BusinessException;
import com.erp.common.response.PageResult;
import com.erp.notification.entity.NotificationRule;
import com.erp.notification.mapper.NotificationRuleMapper;
import com.erp.notification.service.NotificationRuleServicePlus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 通知规则服务实现类
 * 继承ServiceImpl并实现BaseServicePlus接口，获得完整的增强功能
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class NotificationRuleServicePlusImpl extends com.erp.common.service.impl.BaseServicePlusImpl<NotificationRuleMapper, NotificationRule> 
    implements NotificationRuleServicePlus {

    private final NotificationRuleMapper ruleMapper;

    @Override
    public PageResult<NotificationRule> getRulePage(Long page, Long size, String eventType, 
                                                  String businessType, Boolean enabled) {
        log.debug("分页查询通知规则，页码：{}，大小：{}，事件类型：{}，业务类型：{}，启用状态：{}", 
                 page, size, eventType, businessType, enabled);

        // 创建分页对象
        IPage<NotificationRule> pageObj = new Page<>(page, size);

        // 构建查询条件
        LambdaQueryWrapper<NotificationRule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(eventType), NotificationRule::getEventType, eventType)
               .eq(StringUtils.hasText(businessType), NotificationRule::getBusinessType, businessType)
               .eq(enabled != null, NotificationRule::getEnabled, enabled)
               .orderByDesc(NotificationRule::getPriority)
               .orderByDesc(NotificationRule::getCreateTime);

        // 使用BaseServicePlus的pageQuery方法
        return pageQuery(pageObj, wrapper);
    }

    @Override
    public List<NotificationRule> getEnabledRulesByEventType(String eventType) {
        log.debug("根据事件类型查询启用的规则，事件类型：{}", eventType);

        if (!StringUtils.hasText(eventType)) {
            return List.of();
        }

        // 使用自定义Mapper方法
        return ruleMapper.selectEnabledByEventType(eventType);
    }

    @Override
    public List<NotificationRule> getEnabledRulesByBusinessType(String businessType) {
        log.debug("根据业务类型查询启用的规则，业务类型：{}", businessType);

        if (!StringUtils.hasText(businessType)) {
            return List.of();
        }

        // 使用自定义Mapper方法
        return ruleMapper.selectEnabledByBusinessType(businessType);
    }

    @Override
    public List<NotificationRule> getRulesByTemplateId(Long templateId) {
        log.debug("根据模板ID查询规则，模板ID：{}", templateId);

        if (templateId == null) {
            return List.of();
        }

        // 使用自定义Mapper方法
        return ruleMapper.selectByTemplateId(templateId);
    }

    @Override
    public List<NotificationRule> getRulesByRecipient(String recipientType, String recipient) {
        log.debug("根据接收者查询规则，接收者类型：{}，接收者：{}", recipientType, recipient);

        if (!StringUtils.hasText(recipientType) || !StringUtils.hasText(recipient)) {
            return List.of();
        }

        // 使用自定义Mapper方法
        return ruleMapper.selectByRecipient(recipientType, recipient);
    }

    @Override
    public NotificationRule createRule(NotificationRule rule) {
        log.debug("创建通知规则，名称：{}，事件类型：{}", rule.getRuleName(), rule.getEventType());

        // 设置默认值
        if (rule.getEnabled() == null) {
            rule.setEnabled(true);
        }
        if (rule.getPriority() == null) {
            rule.setPriority(1);
        }
        if (rule.getExecutionLimit() == null) {
            rule.setExecutionLimit(0);
        }
        if (rule.getExecutionCount() == null) {
            rule.setExecutionCount(0);
        }

        // 使用BaseServicePlus的save方法
        boolean success = save(rule);

        if (success) {
            log.info("通知规则创建成功，规则ID：{}，名称：{}", rule.getId(), rule.getRuleName());
        } else {
            log.error("通知规则创建失败，名称：{}", rule.getRuleName());
            throw new BusinessException("通知规则创建失败");
        }

        return rule;
    }

    @Override
    public NotificationRule updateRule(NotificationRule rule) {
        log.debug("更新通知规则，ID：{}，名称：{}", rule.getId(), rule.getRuleName());

        if (rule.getId() == null) {
            throw new BusinessException("规则ID不能为空");
        }

        // 使用BaseServicePlus的updateById方法
        boolean success = updateById(rule);

        if (success) {
            log.info("通知规则更新成功，规则ID：{}，名称：{}", rule.getId(), rule.getRuleName());
        } else {
            log.error("通知规则更新失败，规则ID：{}", rule.getId());
            throw new BusinessException("通知规则更新失败");
        }

        return rule;
    }

    @Override
    public boolean toggleRuleStatus(Long ruleId, Boolean enabled) {
        log.debug("切换规则状态，规则ID：{}，启用状态：{}", ruleId, enabled);

        if (ruleId == null || enabled == null) {
            return false;
        }

        // 构建更新条件
        LambdaUpdateWrapper<NotificationRule> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(NotificationRule::getId, ruleId)
               .set(NotificationRule::getEnabled, enabled);

        boolean success = update(wrapper);

        if (success) {
            log.info("规则状态切换成功，规则ID：{}，启用状态：{}", ruleId, enabled);
        } else {
            log.warn("规则状态切换失败，规则ID：{}", ruleId);
        }

        return success;
    }

    @Override
    public int batchToggleRuleStatus(List<Long> ruleIds, Boolean enabled) {
        log.debug("批量切换规则状态，规则ID列表：{}，启用状态：{}", ruleIds, enabled);

        if (ruleIds == null || ruleIds.isEmpty() || enabled == null) {
            return 0;
        }

        // 使用自定义Mapper方法
        String ruleIdsStr = ruleIds.stream()
                .map(String::valueOf)
                .reduce((a, b) -> a + "," + b)
                .orElse("");

        int updated = ruleMapper.batchUpdateEnabled(ruleIdsStr, enabled);
        log.info("批量切换规则状态完成，成功数量：{}，启用状态：{}", updated, enabled);

        return updated;
    }

    @Override
    public boolean incrementExecutionCount(Long ruleId) {
        log.debug("增加规则执行次数，规则ID：{}", ruleId);

        if (ruleId == null) {
            return false;
        }

        // 使用自定义Mapper方法
        int updated = ruleMapper.incrementExecutionCount(ruleId);
        boolean success = updated > 0;

        if (success) {
            log.debug("规则执行次数增加成功，规则ID：{}", ruleId);
        } else {
            log.warn("规则执行次数增加失败，规则ID：{}", ruleId);
        }

        return success;
    }

    @Override
    public boolean isExecutionLimitReached(Long ruleId) {
        if (ruleId == null) {
            return false;
        }

        NotificationRule rule = getById(ruleId);
        if (rule == null) {
            return false;
        }

        return rule.isExecutionLimitReached();
    }

    @Override
    public List<NotificationRule> getOverLimitRules() {
        log.debug("查询超过执行限制的规则");

        // 使用自定义Mapper方法
        return ruleMapper.selectOverLimitRules();
    }

    @Override
    public boolean resetExecutionCount(Long ruleId) {
        log.debug("重置规则执行次数，规则ID：{}", ruleId);

        if (ruleId == null) {
            return false;
        }

        // 构建更新条件
        LambdaUpdateWrapper<NotificationRule> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(NotificationRule::getId, ruleId)
               .set(NotificationRule::getExecutionCount, 0);

        boolean success = update(wrapper);

        if (success) {
            log.info("规则执行次数重置成功，规则ID：{}", ruleId);
        } else {
            log.warn("规则执行次数重置失败，规则ID：{}", ruleId);
        }

        return success;
    }

    @Override
    public int batchResetExecutionCount(List<Long> ruleIds) {
        log.debug("批量重置规则执行次数，规则ID列表：{}", ruleIds);

        if (ruleIds == null || ruleIds.isEmpty()) {
            return 0;
        }

        // 先查询符合条件的记录数
        LambdaQueryWrapper<NotificationRule> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.in(NotificationRule::getId, ruleIds);
        
        long count = count(queryWrapper);
        
        if (count > 0) {
            // 构建批量更新条件
            LambdaUpdateWrapper<NotificationRule> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.in(NotificationRule::getId, ruleIds)
                        .set(NotificationRule::getExecutionCount, 0);

            update(updateWrapper);
        }
        
        int updated = (int) count;
        log.info("批量重置规则执行次数完成，成功数量：{}", updated);

        return updated;
    }

    @Override
    public Map<String, Object> getRuleStats() {
        log.debug("获取规则统计信息");

        Map<String, Object> stats = new HashMap<>();

        // 总规则数
        long totalCount = count();
        stats.put("totalCount", totalCount);

        // 启用规则数
        Long enabledCount = ruleMapper.countEnabledRules();
        stats.put("enabledCount", enabledCount);

        // 禁用规则数
        long disabledCount = totalCount - enabledCount;
        stats.put("disabledCount", disabledCount);

        // 超过执行限制的规则数
        List<NotificationRule> overLimitRules = getOverLimitRules();
        stats.put("overLimitCount", overLimitRules.size());

        // 各接收者类型规则数量
        String[] recipientTypes = {"USER", "ROLE", "GROUP"};
        for (String type : recipientTypes) {
            long typeCount = countByCondition(new LambdaQueryWrapper<NotificationRule>()
                    .eq(NotificationRule::getRecipientType, type));
            stats.put(type.toLowerCase() + "TypeCount", typeCount);
        }

        // 平均执行次数
        List<NotificationRule> allRules = list();
        double avgExecutionCount = allRules.stream()
                .mapToInt(rule -> rule.getExecutionCount() != null ? rule.getExecutionCount() : 0)
                .average()
                .orElse(0.0);
        stats.put("avgExecutionCount", Math.round(avgExecutionCount * 100.0) / 100.0);

        log.debug("规则统计信息：{}", stats);
        return stats;
    }
}