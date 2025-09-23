package com.erp.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.exception.BusinessException;
import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.common.service.impl.BaseServicePlusImpl;
import com.erp.common.util.PageUtils;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.user.dto.SystemConfigQueryDTO;
import com.erp.user.entity.SystemConfig;
import com.erp.user.enums.ConfigType;
import com.erp.user.mapper.SystemConfigMapper;
import com.erp.user.service.SystemConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 系统配置服务实现类
 * 继承ServiceImpl<SystemConfigMapper, SystemConfig>并实现BaseServicePlus接口
 * 
 * @author ERP System
 */
@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class SystemConfigServiceImpl extends BaseServicePlusImpl<SystemConfigMapper, SystemConfig> 
    implements SystemConfigService {
    
    @Override
    public PageResult<SystemConfig> getConfigPage(Long page, Long size, SystemConfigQueryDTO queryDTO) {
        log.info("分页查询系统配置，页码：{}，大小：{}，查询条件：{}", page, size, queryDTO);
        
        // 创建分页对象
        Page<SystemConfig> pageObj = PageUtils.createPage(page, size);
        
        // 构建查询条件
        LambdaQueryWrapper<SystemConfig> wrapper = QueryWrapperUtils.lambdaQuery(SystemConfig.class);
        QueryWrapperUtils.eqIfPresent(wrapper, SystemConfig::getCategory, queryDTO.getCategory());
        QueryWrapperUtils.likeIfPresent(wrapper, SystemConfig::getConfigKey, queryDTO.getConfigKey());
        QueryWrapperUtils.likeIfPresent(wrapper, SystemConfig::getDescription, queryDTO.getDescription());
        QueryWrapperUtils.eqIfPresent(wrapper, SystemConfig::getEnabled, queryDTO.getEnabled());
        QueryWrapperUtils.eqIfPresent(wrapper, SystemConfig::getEditable, queryDTO.getEditable());
        QueryWrapperUtils.eqIfPresent(wrapper, SystemConfig::getValueType, queryDTO.getValueType());
        
        // 排序：按分类、排序号、创建时间
        wrapper.orderByAsc(SystemConfig::getCategory)
               .orderByAsc(SystemConfig::getSortOrder)
               .orderByDesc(SystemConfig::getCreateTime);
        
        // 执行分页查询
        IPage<SystemConfig> result = baseMapper.selectConfigPage(pageObj, wrapper);
        
        log.info("查询完成，总记录数：{}，当前页记录数：{}", result.getTotal(), result.getRecords().size());
        return PageUtils.toPageResult(result);
    }
    
    @Override
    @Cacheable(value = "systemConfig", key = "#configKey", unless = "#result == null")
    public SystemConfig getConfigByKey(String configKey) {
        log.info("根据配置键名获取配置：{}", configKey);
        
        if (configKey == null || configKey.trim().isEmpty()) {
            throw new BusinessException("配置键名不能为空");
        }
        
        SystemConfig config = baseMapper.selectByConfigKey(configKey);
        if (config == null) {
            log.warn("未找到配置键名为 {} 的配置", configKey);
        }
        
        return config;
    }
    
    @Override
    @Cacheable(value = "systemConfigList", key = "#category.code", unless = "#result.isEmpty()")
    public List<SystemConfig> getConfigsByCategory(ConfigType category) {
        log.info("根据配置分类获取配置列表：{}", category);
        
        if (category == null) {
            throw new BusinessException("配置分类不能为空");
        }
        
        List<SystemConfig> configs = baseMapper.selectByCategory(category);
        log.info("查询完成，分类 {} 下共有 {} 个配置", category.getDescription(), configs.size());
        
        return configs;
    }
    
    @Override
    @CacheEvict(value = {"systemConfig", "systemConfigList"}, allEntries = true)
    public SystemConfig createConfig(SystemConfig config) {
        log.info("创建系统配置：{}", config.getConfigKey());
        
        // 参数验证
        validateConfig(config);
        
        // 检查配置键名唯一性
        if (!isConfigKeyUnique(config.getConfigKey(), null)) {
            throw new BusinessException("配置键名已存在：" + config.getConfigKey());
        }
        
        // 设置默认值
        if (config.getEnabled() == null) {
            config.setEnabled(true);
        }
        if (config.getEditable() == null) {
            config.setEditable(true);
        }
        if (config.getSortOrder() == null) {
            config.setSortOrder(0);
        }
        
        // 保存配置
        boolean success = save(config);
        if (!success) {
            throw new BusinessException("创建配置失败");
        }
        
        log.info("配置创建成功，ID：{}", config.getId());
        return config;
    }
    
    @Override
    @CacheEvict(value = {"systemConfig", "systemConfigList"}, allEntries = true)
    public SystemConfig updateConfig(SystemConfig config) {
        log.info("更新系统配置：{}", config.getConfigKey());
        
        // 参数验证
        if (config.getId() == null) {
            throw new BusinessException("配置ID不能为空");
        }
        
        validateConfig(config);
        
        // 检查配置是否存在
        SystemConfig existingConfig = getById(config.getId());
        if (existingConfig == null) {
            throw new BusinessException("配置不存在，ID：" + config.getId());
        }
        
        // 检查配置键名唯一性（排除当前记录）
        if (!isConfigKeyUnique(config.getConfigKey(), config.getId())) {
            throw new BusinessException("配置键名已存在：" + config.getConfigKey());
        }
        
        // 使用MyBatis Plus的saveOrUpdate方法
        boolean success = saveOrUpdate(config);
        if (!success) {
            throw new BusinessException("更新配置失败");
        }
        
        log.info("配置更新成功，ID：{}", config.getId());
        return config;
    }
    
    @Override
    @CacheEvict(value = {"systemConfig", "systemConfigList"}, allEntries = true)
    public int batchUpdateEnabled(List<Long> ids, Boolean enabled) {
        log.info("批量更新配置启用状态，ID列表：{}，启用状态：{}", ids, enabled);
        
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException("配置ID列表不能为空");
        }
        
        if (enabled == null) {
            throw new BusinessException("启用状态不能为空");
        }
        
        // 构建ID字符串
        String idsStr = ids.stream().map(String::valueOf).collect(Collectors.joining(","));
        
        // 执行批量更新
        int updateCount = baseMapper.batchUpdateEnabled(idsStr, enabled);
        
        log.info("批量更新完成，更新记录数：{}", updateCount);
        return updateCount;
    }
    
    @Override
    public List<Map<String, Object>> getCategoryStats() {
        log.info("获取配置分类统计");
        
        List<Map<String, Object>> stats = baseMapper.selectCategoryStats();
        
        log.info("分类统计查询完成，共 {} 个分类", stats.size());
        return stats;
    }
    
    @Override
    public Long getEnabledConfigCount() {
        log.info("获取启用的配置数量");
        
        Long count = baseMapper.countEnabledConfigs();
        
        log.info("启用的配置数量：{}", count);
        return count;
    }
    
    @Override
    public Long getConfigCountByCategory(ConfigType category) {
        log.info("根据分类统计配置数量：{}", category);
        
        if (category == null) {
            throw new BusinessException("配置分类不能为空");
        }
        
        Long count = baseMapper.countByCategory(category);
        
        log.info("分类 {} 下的配置数量：{}", category.getDescription(), count);
        return count;
    }
    
    @Override
    public boolean isConfigKeyUnique(String configKey, Long excludeId) {
        if (configKey == null || configKey.trim().isEmpty()) {
            return false;
        }
        
        Long id = excludeId != null ? excludeId : -1L;
        return !baseMapper.existsConfigKey(configKey, id);
    }
    
    @Override
    @Cacheable(value = "configValue", key = "#configKey", unless = "#result == null")
    @SuppressWarnings("unchecked")
    public <T> T getConfigValue(String configKey, T defaultValue, Class<T> valueClass) {
        log.debug("获取配置值：{}，默认值：{}，类型：{}", configKey, defaultValue, valueClass.getSimpleName());
        
        try {
            SystemConfig config = getConfigByKey(configKey);
            if (config == null || config.getConfigValue() == null) {
                log.debug("配置不存在或值为空，返回默认值：{}", defaultValue);
                return defaultValue;
            }
            
            String configValue = config.getConfigValue();
            
            if (configValue == null || configValue.trim().isEmpty()) {
                return defaultValue;
            }
            
            // 类型转换
            if (valueClass == String.class) {
                return (T) configValue;
            } else if (valueClass == Integer.class) {
                try {
                    return (T) Integer.valueOf(configValue);
                } catch (NumberFormatException e) {
                    log.warn("配置值无法转换为Integer，配置键：{}，值：{}", configKey, configValue);
                    return defaultValue;
                }
            } else if (valueClass == Long.class) {
                try {
                    return (T) Long.valueOf(configValue);
                } catch (NumberFormatException e) {
                    log.warn("配置值无法转换为Long，配置键：{}，值：{}", configKey, configValue);
                    return defaultValue;
                }
            } else if (valueClass == Boolean.class) {
                return (T) Boolean.valueOf(configValue);
            } else {
                log.warn("不支持的配置值类型转换，配置键：{}，值：{}，目标类型：{}", configKey, configValue, valueClass);
                return defaultValue;
            }
            
        } catch (Exception e) {
            log.error("获取配置值失败，配置键：" + configKey, e);
            return defaultValue;
        }
    }
    
    @Override
    @CacheEvict(value = {"systemConfig", "systemConfigList", "configValue"}, allEntries = true)
    public boolean setConfigValue(String configKey, Object value) {
        log.info("设置配置值：{}，值：{}", configKey, value);
        
        try {
            SystemConfig config = getConfigByKey(configKey);
            if (config == null) {
                log.warn("配置不存在，无法设置值：{}", configKey);
                return false;
            }
            
            // 更新配置值
            config.setConfigValue(String.valueOf(value));
            
            // 保存更新
            boolean success = updateById(config);
            
            log.info("配置值设置{}，配置键：{}", success ? "成功" : "失败", configKey);
            return success;
            
        } catch (Exception e) {
            log.error("设置配置值失败，配置键：" + configKey, e);
            return false;
        }
    }
    

    
    /**
     * 验证配置参数
     * 
     * @param config 配置对象
     */
    private void validateConfig(SystemConfig config) {
        if (config == null) {
            throw new BusinessException("配置对象不能为空");
        }
        
        if (config.getCategory() == null) {
            throw new BusinessException("配置分类不能为空");
        }
        
        if (config.getConfigKey() == null || config.getConfigKey().trim().isEmpty()) {
            throw new BusinessException("配置键名不能为空");
        }
        
        if (config.getValueType() == null || config.getValueType().trim().isEmpty()) {
            throw new BusinessException("配置类型不能为空");
        }
        
        // 验证配置键名格式（只允许字母、数字、点号、下划线、中划线）
        if (!config.getConfigKey().matches("^[a-zA-Z0-9._-]+$")) {
            throw new BusinessException("配置键名格式不正确，只允许字母、数字、点号、下划线、中划线");
        }
    }
}