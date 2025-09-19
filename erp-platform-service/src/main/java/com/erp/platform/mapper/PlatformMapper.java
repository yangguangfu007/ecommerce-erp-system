package com.erp.platform.mapper;

import com.erp.common.mapper.BaseMapperPlus;
import com.erp.platform.entity.Platform;
import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 平台信息数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 * 提供平台相关的数据库操作功能
 *
 * @author ERP System
 */
@Mapper
public interface PlatformMapper extends BaseMapperPlus<Platform> {
    
    /**
     * 根据平台类型查询平台列表
     * 使用自定义SQL查询，演示BaseMapperPlus的扩展能力
     *
     * @param platformType 平台类型
     * @return 平台列表
     */
    @Select("SELECT * FROM platforms WHERE platform_type = #{platformType} AND deleted = 0 ORDER BY sort_order ASC, create_time DESC")
    List<Platform> selectByPlatformType(@Param("platformType") PlatformType platformType);
    
    /**
     * 根据平台状态查询平台列表
     * 使用自定义SQL查询，支持多状态查询
     *
     * @param status 平台状态
     * @return 平台列表
     */
    @Select("SELECT * FROM platforms WHERE status = #{status} AND deleted = 0 ORDER BY sort_order ASC, create_time DESC")
    List<Platform> selectByStatus(@Param("status") PlatformStatus status);
    
    /**
     * 根据平台代码查询平台信息
     * 平台代码应该是唯一的，用于快速查找
     *
     * @param platformCode 平台代码
     * @return 平台信息
     */
    @Select("SELECT * FROM platforms WHERE platform_code = #{platformCode} AND deleted = 0")
    Platform selectByPlatformCode(@Param("platformCode") String platformCode);
    
    /**
     * 查询启用的平台列表
     * 只返回启用状态的平台，按排序顺序排列
     *
     * @return 启用的平台列表
     */
    @Select("SELECT * FROM platforms WHERE enabled = 1 AND deleted = 0 ORDER BY sort_order ASC, create_time DESC")
    List<Platform> selectEnabledPlatforms();
    
    /**
     * 统计各状态的平台数量
     * 返回每种状态的平台数量统计
     *
     * @return 状态统计结果，格式：[{status: 'ACTIVE', count: 5}, ...]
     */
    @Select("SELECT status, COUNT(*) as count FROM platforms WHERE deleted = 0 GROUP BY status")
    List<java.util.Map<String, Object>> countByStatus();
    
    /**
     * 查询需要同步的平台列表
     * 查询启用且状态正常的平台，用于数据同步任务
     *
     * @return 需要同步的平台列表
     */
    @Select("SELECT * FROM platforms WHERE enabled = 1 AND status IN ('ACTIVE', 'SYNCING') AND deleted = 0 ORDER BY sort_order ASC")
    List<Platform> selectPlatformsForSync();
    
    /**
     * 根据平台名称模糊查询
     * 支持平台名称的模糊搜索
     *
     * @param platformName 平台名称关键字
     * @return 匹配的平台列表
     */
    @Select("SELECT * FROM platforms WHERE platform_name LIKE CONCAT('%', #{platformName}, '%') AND deleted = 0 ORDER BY sort_order ASC, create_time DESC")
    List<Platform> selectByPlatformNameLike(@Param("platformName") String platformName);
    
    /**
     * 检查平台代码是否已存在
     * 用于验证平台代码的唯一性
     *
     * @param platformCode 平台代码
     * @param excludeId 排除的平台ID（用于更新时的唯一性检查）
     * @return 是否存在
     */
    @Select("SELECT COUNT(*) FROM platforms WHERE platform_code = #{platformCode} AND id != #{excludeId} AND deleted = 0")
    int countByPlatformCodeExcludeId(@Param("platformCode") String platformCode, @Param("excludeId") Long excludeId);
    
    /**
     * 获取最大排序顺序
     * 用于新增平台时设置排序顺序
     *
     * @return 最大排序顺序
     */
    @Select("SELECT COALESCE(MAX(sort_order), 0) FROM platforms WHERE deleted = 0")
    Integer selectMaxSortOrder();
}