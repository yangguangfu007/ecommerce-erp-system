package com.erp.platform.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.platform.dto.PlatformDTO;
import com.erp.platform.dto.PlatformQueryDTO;
import com.erp.platform.entity.Platform;
import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.mapper.PlatformMapper;
import com.erp.platform.service.PlatformService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 平台服务实现类
 * 负责处理平台相关的业务逻辑
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class PlatformServiceImpl implements PlatformService {

    private final PlatformMapper platformMapper;

    @Override
    public Platform createPlatform(PlatformDTO platformDTO) {
        log.info("创建平台，平台名称：{}", platformDTO.getPlatformName());
        
        Platform platform = new Platform();
        BeanUtils.copyProperties(platformDTO, platform);
        platform.setCreateTime(LocalDateTime.now());
        platform.setUpdateTime(LocalDateTime.now());
        
        int result = platformMapper.insert(platform);
        if (result > 0) {
            log.info("平台创建成功，平台ID：{}", platform.getId());
            return platform;
        } else {
            throw new RuntimeException("平台创建失败");
        }
    }

    @Override
    public Platform updatePlatform(Long id, PlatformDTO platformDTO) {
        log.info("更新平台，平台ID：{}", id);
        
        Platform existingPlatform = platformMapper.selectById(id);
        if (existingPlatform == null) {
            throw new RuntimeException("平台不存在，ID：" + id);
        }
        
        BeanUtils.copyProperties(platformDTO, existingPlatform, "id", "createTime");
        existingPlatform.setUpdateTime(LocalDateTime.now());
        
        int result = platformMapper.updateById(existingPlatform);
        if (result > 0) {
            log.info("平台更新成功，平台ID：{}", id);
            return existingPlatform;
        } else {
            throw new RuntimeException("平台更新失败");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Platform getPlatformById(Long id) {
        log.info("根据ID获取平台信息，平台ID：{}", id);
        
        Platform platform = platformMapper.selectById(id);
        if (platform == null) {
            throw new RuntimeException("平台不存在，ID：" + id);
        }
        
        return platform;
    }

    @Override
    @Transactional(readOnly = true)
    public IPage<Platform> getPlatformPage(Page<Platform> page, PlatformQueryDTO queryDTO) {
        log.info("分页查询平台列表，页码：{}，每页大小：{}", page.getCurrent(), page.getSize());
        
        LambdaQueryWrapper<Platform> wrapper = new LambdaQueryWrapper<>();
        
        // 根据平台类型筛选
        if (queryDTO.getPlatformType() != null) {
            wrapper.eq(Platform::getPlatformType, queryDTO.getPlatformType());
        }
        
        // 根据状态筛选
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Platform::getStatus, queryDTO.getStatus());
        }
        
        // 根据启用状态筛选
        if (queryDTO.getEnabled() != null) {
            wrapper.eq(Platform::getEnabled, queryDTO.getEnabled());
        }
        
        // 关键词搜索（平台名称或描述）
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(Platform::getPlatformName, queryDTO.getKeyword())
                    .or()
                    .like(Platform::getDescription, queryDTO.getKeyword()));
        }
        
        // 排序
        if (StringUtils.hasText(queryDTO.getSortField())) {
            if ("desc".equalsIgnoreCase(queryDTO.getSortDirection())) {
                wrapper.orderByDesc(Platform::getCreateTime);
            } else {
                wrapper.orderByAsc(Platform::getCreateTime);
            }
        } else {
            wrapper.orderByDesc(Platform::getCreateTime);
        }
        
        return platformMapper.selectPage(page, wrapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Platform> getPlatformsByType(String type) {
        log.info("根据类型获取平台列表，类型：{}", type);
        
        LambdaQueryWrapper<Platform> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Platform::getPlatformType, type);
        wrapper.eq(Platform::getEnabled, true);
        wrapper.orderByAsc(Platform::getSortOrder);
        
        return platformMapper.selectList(wrapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Platform> getPlatformsByStatus(PlatformStatus status) {
        log.info("根据状态获取平台列表，状态：{}", status);
        
        LambdaQueryWrapper<Platform> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Platform::getStatus, status);
        wrapper.orderByAsc(Platform::getSortOrder);
        
        return platformMapper.selectList(wrapper);
    }

    @Override
    public boolean deletePlatform(Long id) {
        log.info("删除平台，平台ID：{}", id);
        
        Platform platform = platformMapper.selectById(id);
        if (platform == null) {
            throw new RuntimeException("平台不存在，ID：" + id);
        }
        
        int result = platformMapper.deleteById(id);
        if (result > 0) {
            log.info("平台删除成功，平台ID：{}", id);
            return true;
        } else {
            log.error("平台删除失败，平台ID：{}", id);
            return false;
        }
    }

    @Override
    public boolean syncPlatform(Long id) {
        log.info("同步平台数据，平台ID：{}", id);
        
        Platform platform = platformMapper.selectById(id);
        if (platform == null) {
            throw new RuntimeException("平台不存在，ID：" + id);
        }
        
        try {
            // 这里可以添加具体的同步逻辑
            // 例如：调用平台API获取最新数据，更新本地数据库等
            
            platform.setLastUpdated(LocalDateTime.now());
            platform.setUpdateTime(LocalDateTime.now());
            platformMapper.updateById(platform);
            
            log.info("平台数据同步成功，平台ID：{}", id);
            return true;
        } catch (Exception e) {
            log.error("平台数据同步失败，平台ID：{}，错误信息：{}", id, e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Object getPlatformStatus() {
        log.info("获取平台状态监控信息");
        
        // 统计各状态的平台数量
        LambdaQueryWrapper<Platform> wrapper = new LambdaQueryWrapper<>();
        
        long totalCount = platformMapper.selectCount(wrapper);
        
        wrapper.clear();
        wrapper.eq(Platform::getStatus, PlatformStatus.ACTIVE);
        long activeCount = platformMapper.selectCount(wrapper);
        
        wrapper.clear();
        wrapper.eq(Platform::getStatus, PlatformStatus.INACTIVE);
        long inactiveCount = platformMapper.selectCount(wrapper);
        
        wrapper.clear();
        wrapper.eq(Platform::getEnabled, true);
        long enabledCount = platformMapper.selectCount(wrapper);
        
        return new Object() {
            public final long total = totalCount;
            public final long active = activeCount;
            public final long inactive = inactiveCount;
            public final long enabled = enabledCount;
            public final String lastUpdate = LocalDateTime.now().toString();
        };
    }
}