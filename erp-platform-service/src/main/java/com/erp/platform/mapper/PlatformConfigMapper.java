package com.erp.platform.mapper;

import com.erp.common.mapper.BaseMapperPlus;
import com.erp.platform.entity.PlatformConfig;
import com.erp.platform.enums.ConfigType;
import com.erp.platform.enums.ValidationStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 平台配置数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 * 提供平台配置相关的数据库操作功能
 *
 * @author ERP System
 */
@Mapper
public interface PlatformConfigMapper extends BaseMapperPlus<PlatformConfig> {
    
    /**
     * 根据平台ID查询配置列表
     * 按配置分组和排序顺序排列
     *
     * @param platformId 平台ID
     * @return 配置列表
     */
    @Select("SELECT * FROM platform_configs WHERE platform_id = #{platformId} AND deleted = 0 ORDER BY config_group ASC, sort_order ASC, create_time ASC")
    List<PlatformConfig> selectByPlatformId(@Param("platformId") Long platformId);
    
    /**
     * 根据平台ID和配置键查询配置
     * 用于获取特定的配置项
     *
     * @param platformId 平台ID
     * @param configKey 配置键
     * @return 配置信息
     */
    @Select("SELECT * FROM platform_configs WHERE platform_id = #{platformId} AND config_key = #{configKey} AND deleted = 0")
    PlatformConfig selectByPlatformIdAndKey(@Param("platformId") Long platformId, @Param("configKey") String configKey);
    
    /**
     * 根据平台ID和配置分组查询配置列表
     * 用于按分组获取配置项
     *
     * @param platformId 平台ID
     * @param configGroup 配置分组
     * @return 配置列表
     */
    @Select("SELECT * FROM platform_configs WHERE platform_id = #{platformId} AND config_group = #{configGroup} AND deleted = 0 ORDER BY sort_order ASC, create_time ASC")
    List<PlatformConfig> selectByPlatformIdAndGroup(@Param("platformId") Long platformId, @Param("configGroup") String configGroup);
    
    /**
     * 根据平台ID查询必填配置列表
     * 用于验证平台配置的完整性
     *
     * @param platformId 平台ID
     * @return 必填配置列表
     */
    @Select("SELECT * FROM platform_configs WHERE platform_id = #{platformId} AND required = 1 AND deleted = 0 ORDER BY config_group ASC, sort_order ASC")
    List<PlatformConfig> selectRequiredByPlatformId(@Param("platformId") Long platformId);
    
    /**
     * 根据平台ID查询启用的配置列表
     * 只返回启用状态的配置项
     *
     * @param platformId 平台ID
     * @return 启用的配置列表
     */
    @Select("SELECT * FROM platform_configs WHERE platform_id = #{platformId} AND enabled = 1 AND deleted = 0 ORDER BY config_group ASC, sort_order ASC")
    List<PlatformConfig> selectEnabledByPlatformId(@Param("platformId") Long platformId);
    
    /**
     * 根据配置类型查询配置列表
     * 用于按类型管理配置项
     *
     * @param platformId 平台ID
     * @param configType 配置类型
     * @return 配置列表
     */
    @Select("SELECT * FROM platform_configs WHERE platform_id = #{platformId} AND config_type = #{configType} AND deleted = 0 ORDER BY sort_order ASC")
    List<PlatformConfig> selectByPlatformIdAndType(@Param("platformId") Long platformId, @Param("configType") ConfigType configType);
    
    /**
     * 根据验证状态查询配置列表
     * 用于查询验证失败或未验证的配置项
     *
     * @param platformId 平台ID
     * @param validationStatus 验证状态
     * @return 配置列表
     */
    @Select("SELECT * FROM platform_configs WHERE platform_id = #{platformId} AND validation_status = #{validationStatus} AND deleted = 0 ORDER BY config_group ASC, sort_order ASC")
    List<PlatformConfig> selectByPlatformIdAndValidationStatus(@Param("platformId") Long platformId, @Param("validationStatus") ValidationStatus validationStatus);
    
    /**
     * 统计平台配置数量
     * 按验证状态统计配置项数量
     *
     * @param platformId 平台ID
     * @return 状态统计结果
     */
    @Select("SELECT validation_status, COUNT(*) as count FROM platform_configs WHERE platform_id = #{platformId} AND deleted = 0 GROUP BY validation_status")
    List<java.util.Map<String, Object>> countByValidationStatus(@Param("platformId") Long platformId);
    
    /**
     * 检查配置键是否已存在
     * 用于验证配置键在同一平台下的唯一性
     *
     * @param platformId 平台ID
     * @param configKey 配置键
     * @param excludeId 排除的配置ID（用于更新时的唯一性检查）
     * @return 是否存在
     */
    @Select("SELECT COUNT(*) FROM platform_configs WHERE platform_id = #{platformId} AND config_key = #{configKey} AND id != #{excludeId} AND deleted = 0")
    int countByPlatformIdAndKeyExcludeId(@Param("platformId") Long platformId, @Param("configKey") String configKey, @Param("excludeId") Long excludeId);
    
    /**
     * 批量更新验证状态
     * 用于批量更新配置的验证状态
     *
     * @param platformId 平台ID
     * @param validationStatus 验证状态
     * @param validationError 验证错误信息
     * @param lastValidated 最后验证时间
     * @return 更新的记录数
     */
    @Update("UPDATE platform_configs SET validation_status = #{validationStatus}, validation_error = #{validationError}, last_validated = #{lastValidated} WHERE platform_id = #{platformId} AND deleted = 0")
    int updateValidationStatusByPlatformId(@Param("platformId") Long platformId, 
                                          @Param("validationStatus") ValidationStatus validationStatus,
                                          @Param("validationError") String validationError,
                                          @Param("lastValidated") LocalDateTime lastValidated);
    
    /**
     * 根据配置分组获取最大排序顺序
     * 用于新增配置时设置排序顺序
     *
     * @param platformId 平台ID
     * @param configGroup 配置分组
     * @return 最大排序顺序
     */
    @Select("SELECT COALESCE(MAX(sort_order), 0) FROM platform_configs WHERE platform_id = #{platformId} AND config_group = #{configGroup} AND deleted = 0")
    Integer selectMaxSortOrderByGroup(@Param("platformId") Long platformId, @Param("configGroup") String configGroup);
    
    /**
     * 查询加密配置列表
     * 用于安全管理，查询所有加密存储的配置项
     *
     * @param platformId 平台ID
     * @return 加密配置列表
     */
    @Select("SELECT * FROM platform_configs WHERE platform_id = #{platformId} AND encrypted = 1 AND deleted = 0 ORDER BY config_group ASC, sort_order ASC")
    List<PlatformConfig> selectEncryptedByPlatformId(@Param("platformId") Long platformId);
    
    /**
     * 根据配置名称模糊查询
     * 支持配置名称的模糊搜索
     *
     * @param platformId 平台ID
     * @param configName 配置名称关键字
     * @return 匹配的配置列表
     */
    @Select("SELECT * FROM platform_configs WHERE platform_id = #{platformId} AND config_name LIKE CONCAT('%', #{configName}, '%') AND deleted = 0 ORDER BY config_group ASC, sort_order ASC")
    List<PlatformConfig> selectByPlatformIdAndNameLike(@Param("platformId") Long platformId, @Param("configName") String configName);
}