package com.erp.platform.service;

import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.platform.dto.PlatformDTO;
import com.erp.platform.dto.PlatformQueryDTO;
import com.erp.platform.entity.Platform;
import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;

import java.util.List;
import java.util.Map;

/**
 * 平台服务接口
 * 继承BaseServicePlus获得增强的CRUD方法
 * 提供平台相关的业务操作功能
 *
 * @author ERP System
 */
public interface PlatformService extends BaseServicePlus<Platform> {
    
    /**
     * 创建平台
     * 使用BaseServicePlus的save方法，自动处理审计字段
     *
     * @param platformDTO 平台信息
     * @return 创建的平台
     */
    Platform createPlatform(PlatformDTO platformDTO);
    
    /**
     * 更新平台
     * 使用BaseServicePlus的updateById方法，自动处理版本号和更新时间
     *
     * @param id 平台ID
     * @param platformDTO 平台信息
     * @return 更新的平台
     */
    Platform updatePlatform(Long id, PlatformDTO platformDTO);
    
    /**
     * 分页查询平台列表
     * 使用BaseServicePlus的pageQuery方法，返回PageResult统一分页格式
     *
     * @param page 页码
     * @param size 每页大小
     * @param queryDTO 查询条件
     * @return PageResult分页结果
     */
    PageResult<Platform> getPlatformPage(Long page, Long size, PlatformQueryDTO queryDTO);
    
    /**
     * 根据平台类型获取平台列表
     * 使用BaseServicePlus的listByCondition方法
     *
     * @param platformType 平台类型
     * @return 平台列表
     */
    List<Platform> getPlatformsByType(PlatformType platformType);
    
    /**
     * 根据状态获取平台列表
     * 使用BaseServicePlus的listByCondition方法
     *
     * @param status 平台状态
     * @return 平台列表
     */
    List<Platform> getPlatformsByStatus(PlatformStatus status);
    
    /**
     * 根据平台代码获取平台信息
     * 使用BaseServicePlus的getByField方法
     *
     * @param platformCode 平台代码
     * @return 平台信息
     */
    Platform getPlatformByCode(String platformCode);
    
    /**
     * 检查平台代码是否已存在
     * 使用BaseServicePlus的existsByField方法
     *
     * @param platformCode 平台代码
     * @param excludeId 排除的平台ID（用于更新时的唯一性检查）
     * @return 是否存在
     */
    boolean isPlatformCodeExists(String platformCode, Long excludeId);
    
    /**
     * 获取启用的平台列表
     * 按排序顺序返回
     *
     * @return 启用的平台列表
     */
    List<Platform> getEnabledPlatforms();
    
    /**
     * 批量更新平台状态
     * 使用BaseServicePlus的updateBatchByIdEnhanced方法
     *
     * @param platformIds 平台ID列表
     * @param status 目标状态
     * @return 更新成功的记录数
     */
    int batchUpdateStatus(List<Long> platformIds, PlatformStatus status);
    
    /**
     * 同步平台数据
     * 更新平台的最后同步时间
     *
     * @param id 平台ID
     * @return 同步结果
     */
    boolean syncPlatform(Long id);
    
    /**
     * 批量同步平台数据
     * 批量更新多个平台的同步状态
     *
     * @param platformIds 平台ID列表
     * @return 同步成功的平台数量
     */
    int batchSyncPlatforms(List<Long> platformIds);
    
    /**
     * 获取平台状态统计信息
     * 使用BaseServicePlus的countByCondition方法进行统计
     *
     * @return 状态统计信息
     */
    Map<String, Object> getPlatformStatusStats();
    
    /**
     * 获取需要同步的平台列表
     * 查询启用且状态正常的平台
     *
     * @return 需要同步的平台列表
     */
    List<Platform> getPlatformsForSync();
}