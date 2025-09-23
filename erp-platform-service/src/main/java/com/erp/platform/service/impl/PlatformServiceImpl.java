package com.erp.platform.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.response.PageResult;
import com.erp.common.service.impl.BaseServicePlusImpl;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.platform.dto.PlatformDTO;
import com.erp.platform.dto.PlatformQueryDTO;
import com.erp.platform.entity.Platform;
import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import com.erp.platform.mapper.PlatformMapper;
import com.erp.platform.service.PlatformService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 平台服务实现类
 * 继承BaseServicePlusImpl<PlatformMapper, Platform>获得增强的CRUD方法
 * 负责处理平台相关的业务逻辑，使用erp-common的增强功能
 *
 * @author ERP System
 */
@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class PlatformServiceImpl extends BaseServicePlusImpl<PlatformMapper, Platform> implements PlatformService {

    @Override
    public Platform createPlatform(PlatformDTO platformDTO) {
        log.info("创建平台，平台名称：{}", platformDTO.getPlatformName());
        
        // 检查平台代码唯一性
        if (isPlatformCodeExists(platformDTO.getPlatformCode(), null)) {
            throw new RuntimeException("平台代码已存在：" + platformDTO.getPlatformCode());
        }
        
        Platform platform = new Platform();
        BeanUtils.copyProperties(platformDTO, platform);
        
        // 设置默认值
        if (platform.getEnabled() == null) {
            platform.setEnabled(true);
        }
        if (platform.getSortOrder() == null) {
            // 获取最大排序顺序并加1
            Integer maxSortOrder = baseMapper.selectMaxSortOrder();
            platform.setSortOrder(maxSortOrder + 1);
        }
        platform.setLastUpdated(LocalDateTime.now());
        
        // 使用BaseServicePlus的save方法，自动处理审计字段
        boolean result = save(platform);
        if (result) {
            log.info("平台创建成功，平台ID：{}", platform.getId());
            return platform;
        } else {
            throw new RuntimeException("平台创建失败");
        }
    }

    @Override
    public Platform updatePlatform(Long id, PlatformDTO platformDTO) {
        log.info("更新平台，平台ID：{}", id);
        
        // 使用BaseServicePlus的getById方法
        Platform existingPlatform = getById(id);
        if (existingPlatform == null) {
            throw new RuntimeException("平台不存在，ID：" + id);
        }
        
        // 检查平台代码唯一性（排除当前记录）
        if (isPlatformCodeExists(platformDTO.getPlatformCode(), id)) {
            throw new RuntimeException("平台代码已存在：" + platformDTO.getPlatformCode());
        }
        
        // 复制属性，排除ID、创建时间、创建人等字段
        BeanUtils.copyProperties(platformDTO, existingPlatform, "id", "createTime", "createBy", "deleted", "version");
        existingPlatform.setLastUpdated(LocalDateTime.now());
        
        // 使用BaseServicePlus的updateById方法，自动处理版本号和更新时间
        boolean result = updateById(existingPlatform);
        if (result) {
            log.info("平台更新成功，平台ID：{}", id);
            return existingPlatform;
        } else {
            throw new RuntimeException("平台更新失败，可能是版本冲突");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<Platform> getPlatformPage(Long page, Long size, PlatformQueryDTO queryDTO) {
        log.info("分页查询平台列表，页码：{}，每页大小：{}", page, size);
        
        // 创建分页对象
        Page<Platform> pageObj = new Page<>(page, size);
        
        // 使用QueryWrapperUtils构建查询条件
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        
        // 根据平台类型筛选
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getPlatformType, queryDTO.getPlatformType());
        
        // 根据状态筛选
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getStatus, queryDTO.getStatus());
        
        // 根据启用状态筛选
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getEnabled, queryDTO.getEnabled());
        
        // 关键词搜索（平台名称或描述）
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> {
                QueryWrapperUtils.likeIfPresent(w, Platform::getPlatformName, queryDTO.getKeyword());
                w.or();
                QueryWrapperUtils.likeIfPresent(w, Platform::getDescription, queryDTO.getKeyword());
            });
        }
        
        // 排序
        if (StringUtils.hasText(queryDTO.getSortField())) {
            if ("desc".equalsIgnoreCase(queryDTO.getSortDirection())) {
                wrapper.orderByDesc(Platform::getCreateTime);
            } else {
                wrapper.orderByAsc(Platform::getCreateTime);
            }
        } else {
            // 默认按排序顺序和创建时间排序
            wrapper.orderByAsc(Platform::getSortOrder).orderByDesc(Platform::getCreateTime);
        }
        
        // 使用BaseServicePlus的pageQuery方法，返回PageResult统一分页格式
        return pageQuery(pageObj, wrapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Platform> getPlatformsByType(PlatformType platformType) {
        log.info("根据类型获取平台列表，类型：{}", platformType);
        
        // 使用QueryWrapperUtils构建查询条件
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getPlatformType, platformType);
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getEnabled, true);
        wrapper.orderByAsc(Platform::getSortOrder);
        
        // 使用BaseServicePlus的listByCondition方法
        return listByCondition(wrapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Platform> getPlatformsByStatus(PlatformStatus status) {
        log.info("根据状态获取平台列表，状态：{}", status);
        
        // 使用QueryWrapperUtils构建查询条件
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getStatus, status);
        wrapper.orderByAsc(Platform::getSortOrder);
        
        // 使用BaseServicePlus的listByCondition方法
        return listByCondition(wrapper);
    }

    @Override
    @Transactional(readOnly = true)
    public Platform getPlatformByCode(String platformCode) {
        log.info("根据平台代码获取平台信息，平台代码：{}", platformCode);
        
        // 使用BaseServicePlus的getByField方法
        return getByField("platform_code", platformCode);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isPlatformCodeExists(String platformCode, Long excludeId) {
        log.debug("检查平台代码是否存在，平台代码：{}，排除ID：{}", platformCode, excludeId);
        
        if (excludeId == null) {
            // 使用BaseServicePlus的existsByField方法
            return existsByField("platform_code", platformCode);
        } else {
            // 使用自定义Mapper方法检查唯一性
            int count = baseMapper.countByPlatformCodeExcludeId(platformCode, excludeId);
            return count > 0;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Platform> getEnabledPlatforms() {
        log.info("获取启用的平台列表");
        
        // 使用QueryWrapperUtils构建查询条件
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getEnabled, true);
        wrapper.orderByAsc(Platform::getSortOrder).orderByDesc(Platform::getCreateTime);
        
        // 使用BaseServicePlus的listByCondition方法
        return listByCondition(wrapper);
    }

    @Override
    public int batchUpdateStatus(List<Long> platformIds, PlatformStatus status) {
        log.info("批量更新平台状态，平台ID列表：{}，目标状态：{}", platformIds, status);
        
        if (platformIds == null || platformIds.isEmpty()) {
            return 0;
        }
        
        // 查询要更新的平台
        List<Platform> platforms = listByIds(platformIds);
        if (platforms.isEmpty()) {
            log.warn("未找到要更新的平台，平台ID列表：{}", platformIds);
            return 0;
        }
        
        // 更新状态和最后更新时间
        platforms.forEach(platform -> {
            platform.setStatus(status);
            platform.setLastUpdated(LocalDateTime.now());
        });
        
        // 使用BaseServicePlus的updateBatchByIdEnhanced方法
        int result = updateBatchByIdEnhanced(platforms);
        log.info("批量更新平台状态完成，更新数量：{}", result);
        return result;
    }

    @Override
    public boolean syncPlatform(Long id) {
        log.info("同步平台数据，平台ID：{}", id);
        
        // 使用BaseServicePlus的getById方法
        Platform platform = getById(id);
        if (platform == null) {
            throw new RuntimeException("平台不存在，ID：" + id);
        }
        
        try {
            // 这里可以添加具体的同步逻辑
            // 例如：调用平台API获取最新数据，更新本地数据库等
            
            platform.setLastUpdated(LocalDateTime.now());
            
            // 使用BaseServicePlus的updateById方法
            boolean result = updateById(platform);
            
            if (result) {
                log.info("平台数据同步成功，平台ID：{}", id);
                return true;
            } else {
                log.error("平台数据同步失败，平台ID：{}", id);
                return false;
            }
        } catch (Exception e) {
            log.error("平台数据同步失败，平台ID：{}，错误信息：{}", id, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public int batchSyncPlatforms(List<Long> platformIds) {
        log.info("批量同步平台数据，平台ID列表：{}", platformIds);
        
        if (platformIds == null || platformIds.isEmpty()) {
            return 0;
        }
        
        // 查询要同步的平台
        List<Platform> platforms = listByIds(platformIds);
        if (platforms.isEmpty()) {
            log.warn("未找到要同步的平台，平台ID列表：{}", platformIds);
            return 0;
        }
        
        int successCount = 0;
        LocalDateTime now = LocalDateTime.now();
        
        // 更新最后同步时间
        List<Platform> platformsToUpdate = platforms.stream()
                .filter(platform -> {
                    try {
                        // 这里可以添加具体的同步逻辑
                        platform.setLastUpdated(now);
                        return true;
                    } catch (Exception e) {
                        log.error("平台同步失败，平台ID：{}，错误信息：{}", platform.getId(), e.getMessage(), e);
                        return false;
                    }
                })
                .collect(Collectors.toList());
        
        if (!platformsToUpdate.isEmpty()) {
            // 使用BaseServicePlus的updateBatchByIdEnhanced方法
            successCount = updateBatchByIdEnhanced(platformsToUpdate);
        }
        
        log.info("批量同步平台数据完成，成功数量：{}", successCount);
        return successCount;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPlatformStatusStats() {
        log.info("获取平台状态统计信息");
        
        Map<String, Object> stats = new HashMap<>();
        
        // 使用BaseServicePlus的countByCondition方法统计各状态数量
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        
        // 总数
        long totalCount = count();
        stats.put("total", totalCount);
        
        // 各状态统计
        stats.put("active", countByField("status", PlatformStatus.ACTIVE.getCode()));
        stats.put("inactive", countByField("status", PlatformStatus.INACTIVE.getCode()));
        stats.put("maintenance", countByField("status", PlatformStatus.MAINTENANCE.getCode()));
        stats.put("error", countByField("status", PlatformStatus.ERROR.getCode()));
        
        // 启用状态统计
        stats.put("enabled", countByField("enabled", true));
        stats.put("disabled", countByField("enabled", false));
        
        // 按类型统计
        Map<String, Long> typeStats = new HashMap<>();
        for (PlatformType type : PlatformType.values()) {
            long count = countByField("platform_type", type.getCode());
            typeStats.put(type.getCode(), count);
        }
        stats.put("byType", typeStats);
        
        // 使用自定义Mapper方法获取状态统计
        List<Map<String, Object>> statusStats = baseMapper.countByStatus();
        stats.put("statusDetails", statusStats);
        
        stats.put("lastUpdate", LocalDateTime.now().toString());
        
        log.debug("平台状态统计信息：{}", stats);
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Platform> getPlatformsForSync() {
        log.info("获取需要同步的平台列表");
        
        // 使用自定义Mapper方法查询需要同步的平台
        List<Platform> platforms = baseMapper.selectPlatformsForSync();
        
        log.info("找到需要同步的平台数量：{}", platforms.size());
        return platforms;
    }
}