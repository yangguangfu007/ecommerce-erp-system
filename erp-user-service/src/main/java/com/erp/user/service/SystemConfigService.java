package com.erp.user.service;

import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.user.dto.SystemConfigQueryDTO;
import com.erp.user.entity.SystemConfig;
import com.erp.user.enums.ConfigType;

import java.util.List;
import java.util.Map;

/**
 * 系统配置服务接口
 * 继承BaseServicePlus获得增强的业务方法
 * 
 * @author ERP System
 */
public interface SystemConfigService extends BaseServicePlus<SystemConfig> {
    
    /**
     * 分页查询系统配置
     * 
     * @param page 页码
     * @param size 每页大小
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    PageResult<SystemConfig> getConfigPage(Long page, Long size, SystemConfigQueryDTO queryDTO);
    
    /**
     * 根据配置键名获取配置
     * 
     * @param configKey 配置键名
     * @return 配置信息
     */
    SystemConfig getConfigByKey(String configKey);
    
    /**
     * 根据配置分类获取配置列表
     * 
     * @param category 配置分类
     * @return 配置列表
     */
    List<SystemConfig> getConfigsByCategory(ConfigType category);
    
    /**
     * 创建系统配置
     * 
     * @param config 配置信息
     * @return 创建的配置
     */
    SystemConfig createConfig(SystemConfig config);
    
    /**
     * 更新系统配置
     * 
     * @param config 配置信息
     * @return 更新的配置
     */
    SystemConfig updateConfig(SystemConfig config);
    
    /**
     * 批量更新配置启用状态
     * 
     * @param ids 配置ID列表
     * @param enabled 启用状态
     * @return 更新的记录数
     */
    int batchUpdateEnabled(List<Long> ids, Boolean enabled);
    
    /**
     * 获取配置分类统计
     * 
     * @return 分类统计结果
     */
    List<Map<String, Object>> getCategoryStats();
    
    /**
     * 获取启用的配置数量
     * 
     * @return 启用的配置数量
     */
    Long getEnabledConfigCount();
    
    /**
     * 根据分类统计配置数量
     * 
     * @param category 配置分类
     * @return 配置数量
     */
    Long getConfigCountByCategory(ConfigType category);
    
    /**
     * 验证配置键名是否唯一
     * 
     * @param configKey 配置键名
     * @param excludeId 排除的ID
     * @return 是否唯一
     */
    boolean isConfigKeyUnique(String configKey, Long excludeId);
    
    /**
     * 获取系统配置值（泛型方法）
     * 
     * @param configKey 配置键名
     * @param defaultValue 默认值
     * @param valueClass 值类型
     * @param <T> 值类型
     * @return 配置值
     */
    <T> T getConfigValue(String configKey, T defaultValue, Class<T> valueClass);
    
    /**
     * 设置系统配置值
     * 
     * @param configKey 配置键名
     * @param value 配置值
     * @return 是否成功
     */
    boolean setConfigValue(String configKey, Object value);
}