package com.erp.platform.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.platform.dto.PlatformDTO;
import com.erp.platform.dto.PlatformQueryDTO;
import com.erp.platform.entity.Platform;
import com.erp.platform.enums.PlatformStatus;

import java.util.List;

/**
 * 平台服务接口
 */
public interface PlatformService {
    
    /**
     * 创建平台
     * @param platformDTO 平台信息
     * @return 创建的平台
     */
    Platform createPlatform(PlatformDTO platformDTO);
    
    /**
     * 更新平台
     * @param id 平台ID
     * @param platformDTO 平台信息
     * @return 更新的平台
     */
    Platform updatePlatform(Long id, PlatformDTO platformDTO);
    
    /**
     * 根据ID获取平台
     * @param id 平台ID
     * @return 平台信息
     */
    Platform getPlatformById(Long id);
    
    /**
     * 分页查询平台列表
     * @param page 分页参数
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    IPage<Platform> getPlatformPage(Page<Platform> page, PlatformQueryDTO queryDTO);
    
    /**
     * 根据类型获取平台列表
     * @param type 平台类型
     * @return 平台列表
     */
    List<Platform> getPlatformsByType(String type);
    
    /**
     * 根据状态获取平台列表
     * @param status 平台状态
     * @return 平台列表
     */
    List<Platform> getPlatformsByStatus(PlatformStatus status);
    
    /**
     * 删除平台
     * @param id 平台ID
     * @return 是否删除成功
     */
    boolean deletePlatform(Long id);
    
    /**
     * 同步平台数据
     * @param id 平台ID
     * @return 同步结果
     */
    boolean syncPlatform(Long id);
    
    /**
     * 获取平台状态监控信息
     * @return 状态监控信息
     */
    Object getPlatformStatus();
}