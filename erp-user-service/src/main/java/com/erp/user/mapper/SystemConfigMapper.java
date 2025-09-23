package com.erp.user.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.mapper.BaseMapperPlus;
import com.erp.user.entity.SystemConfig;
import com.erp.user.enums.ConfigType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 系统配置数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 * 
 * @author ERP System
 */
@Mapper
public interface SystemConfigMapper extends BaseMapperPlus<SystemConfig> {
    
    /**
     * 根据配置分类查询配置列表
     * 
     * @param category 配置分类
     * @return 配置列表
     */
    @Select("SELECT * FROM system_configs WHERE category = #{category} AND deleted = 0 AND enabled = 1 ORDER BY sort_order ASC, create_time ASC")
    List<SystemConfig> selectByCategory(@Param("category") ConfigType category);
    
    /**
     * 根据配置键名查询配置
     * 
     * @param configKey 配置键名
     * @return 配置信息
     */
    @Select("SELECT * FROM system_configs WHERE config_key = #{configKey} AND deleted = 0 LIMIT 1")
    SystemConfig selectByConfigKey(@Param("configKey") String configKey);
    
    /**
     * 查询启用的配置数量
     * 
     * @return 启用的配置数量
     */
    @Select("SELECT COUNT(*) FROM system_configs WHERE enabled = 1 AND deleted = 0")
    Long countEnabledConfigs();
    
    /**
     * 根据分类统计配置数量
     * 
     * @param category 配置分类
     * @return 配置数量
     */
    @Select("SELECT COUNT(*) FROM system_configs WHERE category = #{category} AND deleted = 0")
    Long countByCategory(@Param("category") ConfigType category);
    
    /**
     * 查询所有配置分类及其数量
     * 
     * @return 分类统计结果
     */
    @Select("SELECT category, COUNT(*) as count FROM system_configs WHERE deleted = 0 GROUP BY category ORDER BY category")
    List<java.util.Map<String, Object>> selectCategoryStats();
    
    /**
     * 分页查询系统配置（支持分类和关键字筛选）
     * 使用BaseMapperPlus的增强分页方法
     * 
     * @param page 分页对象
     * @param queryWrapper 查询条件
     * @return 分页结果
     */
    default IPage<SystemConfig> selectConfigPage(IPage<SystemConfig> page, LambdaQueryWrapper<SystemConfig> queryWrapper) {
        return selectPageByCondition(page, queryWrapper);
    }
    
    /**
     * 检查配置键名是否存在（排除指定ID）
     * 
     * @param configKey 配置键名
     * @param excludeId 排除的ID
     * @return 是否存在
     */
    @Select("SELECT COUNT(*) > 0 FROM system_configs WHERE config_key = #{configKey} AND id != #{excludeId} AND deleted = 0")
    boolean existsConfigKey(@Param("configKey") String configKey, @Param("excludeId") Long excludeId);
    
    /**
     * 批量更新配置启用状态
     * 
     * @param ids 配置ID列表
     * @param enabled 启用状态
     * @return 更新的记录数
     */
    @Select("UPDATE system_configs SET enabled = #{enabled}, update_time = NOW() WHERE id IN (${ids}) AND deleted = 0")
    int batchUpdateEnabled(@Param("ids") String ids, @Param("enabled") Boolean enabled);
}