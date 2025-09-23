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
import com.erp.user.dto.SystemStatusQueryDTO;
import com.erp.user.entity.SystemStatus;
import com.erp.user.enums.ServiceStatus;
import com.erp.user.mapper.SystemStatusMapper;
import com.erp.user.service.SystemStatusService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 系统状态服务实现类
 * 继承ServiceImpl<SystemStatusMapper, SystemStatus>并实现BaseServicePlus接口
 * 
 * @author ERP System
 */
@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class SystemStatusServiceImpl extends BaseServicePlusImpl<SystemStatusMapper, SystemStatus> 
    implements SystemStatusService {
    
    @Override
    public PageResult<SystemStatus> getStatusPage(Long page, Long size, SystemStatusQueryDTO queryDTO) {
        log.info("分页查询系统状态，页码：{}，大小：{}，查询条件：{}", page, size, queryDTO);
        
        // 创建分页对象
        Page<SystemStatus> pageObj = PageUtils.createPage(page, size);
        
        // 构建查询条件
        LambdaQueryWrapper<SystemStatus> wrapper = QueryWrapperUtils.lambdaQuery(SystemStatus.class);
        QueryWrapperUtils.likeIfPresent(wrapper, SystemStatus::getServiceName, queryDTO.getServiceName());
        QueryWrapperUtils.eqIfPresent(wrapper, SystemStatus::getServiceStatus, queryDTO.getServiceStatus());
        QueryWrapperUtils.eqIfPresent(wrapper, SystemStatus::getMonitorEnabled, queryDTO.getMonitorEnabled());
        QueryWrapperUtils.geIfPresent(wrapper, SystemStatus::getResponseTime, queryDTO.getMinResponseTime());
        QueryWrapperUtils.leIfPresent(wrapper, SystemStatus::getResponseTime, queryDTO.getMaxResponseTime());
        QueryWrapperUtils.geIfPresent(wrapper, SystemStatus::getFailureCount, queryDTO.getMinFailureCount());
        QueryWrapperUtils.leIfPresent(wrapper, SystemStatus::getFailureCount, queryDTO.getMaxFailureCount());
        
        // 最后检查时间范围查询
        QueryWrapperUtils.betweenTime(wrapper, SystemStatus::getLastCheckTime, 
                                     queryDTO.getLastCheckStartTime(), queryDTO.getLastCheckEndTime());
        
        // 是否有错误信息
        if (queryDTO.getHasError() != null && queryDTO.getHasError()) {
            wrapper.isNotNull(SystemStatus::getErrorMessage);
        }
        
        // 排序：按服务状态、失败次数、服务名称
        wrapper.orderByAsc(SystemStatus::getServiceStatus)
               .orderByDesc(SystemStatus::getFailureCount)
               .orderByAsc(SystemStatus::getServiceName);
        
        // 执行分页查询
        IPage<SystemStatus> result = baseMapper.selectStatusPage(pageObj, wrapper);
        
        log.info("查询完成，总记录数：{}，当前页记录数：{}", result.getTotal(), result.getRecords().size());
        return PageUtils.toPageResult(result);
    }
    
    @Override
    public SystemStatus getStatusByServiceName(String serviceName) {
        log.info("根据服务名称获取系统状态：{}", serviceName);
        
        if (serviceName == null || serviceName.trim().isEmpty()) {
            throw new BusinessException("服务名称不能为空");
        }
        
        SystemStatus status = baseMapper.selectByServiceName(serviceName);
        if (status == null) {
            log.warn("未找到服务名称为 {} 的状态记录", serviceName);
        }
        
        return status;
    }
    
    @Override
    public List<SystemStatus> getStatusesByServiceStatus(ServiceStatus serviceStatus) {
        log.info("根据服务状态查询服务列表：{}", serviceStatus);
        
        if (serviceStatus == null) {
            throw new BusinessException("服务状态不能为空");
        }
        
        List<SystemStatus> statuses = baseMapper.selectByServiceStatus(serviceStatus);
        log.info("查询完成，状态 {} 的服务数量：{}", serviceStatus.getDescription(), statuses.size());
        
        return statuses;
    }
    
    @Override
    public List<SystemStatus> getMonitorEnabledServices() {
        log.info("查询启用监控的服务列表");
        
        List<SystemStatus> services = baseMapper.selectMonitorEnabledServices();
        log.info("查询完成，启用监控的服务数量：{}", services.size());
        
        return services;
    }
    
    @Override
    public List<Map<String, Object>> getServiceStatusStats() {
        log.info("统计各种服务状态的数量");
        
        List<Map<String, Object>> stats = baseMapper.selectServiceStatusStats();
        
        log.info("状态统计查询完成，共 {} 种状态", stats.size());
        return stats;
    }
    
    @Override
    public Long countByServiceStatus(ServiceStatus serviceStatus) {
        log.info("根据服务状态统计数量：{}", serviceStatus);
        
        if (serviceStatus == null) {
            throw new BusinessException("服务状态不能为空");
        }
        
        Long count = baseMapper.countByServiceStatus(serviceStatus);
        log.info("状态 {} 的服务数量：{}", serviceStatus.getDescription(), count);
        
        return count;
    }
    
    @Override
    public List<SystemStatus> getServicesForHealthCheck(LocalDateTime currentTime) {
        log.info("查询需要进行健康检查的服务，当前时间：{}", currentTime);
        
        if (currentTime == null) {
            currentTime = LocalDateTime.now();
        }
        
        List<SystemStatus> services = baseMapper.selectServicesForHealthCheck(currentTime);
        log.info("查询完成，需要健康检查的服务数量：{}", services.size());
        
        return services;
    }
    
    @Override
    public int updateHealthCheckResult(String serviceName, ServiceStatus serviceStatus, 
                                     Long responseTime, LocalDateTime lastCheckTime, 
                                     String errorMessage, Integer failureCount) {
        log.info("更新服务健康检查结果：{}，状态：{}，响应时间：{}ms", serviceName, serviceStatus, responseTime);
        
        if (serviceName == null || serviceName.trim().isEmpty()) {
            throw new BusinessException("服务名称不能为空");
        }
        
        if (serviceStatus == null) {
            throw new BusinessException("服务状态不能为空");
        }
        
        if (lastCheckTime == null) {
            lastCheckTime = LocalDateTime.now();
        }
        
        if (failureCount == null) {
            failureCount = 0;
        }
        
        int updateCount = baseMapper.updateHealthCheckResult(serviceName, serviceStatus, 
                                                           responseTime, lastCheckTime, 
                                                           errorMessage, failureCount);
        
        log.info("健康检查结果更新完成，更新记录数：{}", updateCount);
        return updateCount;
    }
    
    @Override
    public List<SystemStatus> getAbnormalServices() {
        log.info("查询异常服务列表");
        
        List<SystemStatus> abnormalServices = baseMapper.selectAbnormalServices();
        log.info("查询完成，异常服务数量：{}", abnormalServices.size());
        
        return abnormalServices;
    }
    
    @Override
    public List<SystemStatus> getSlowResponseServices(Long responseTimeThreshold) {
        log.info("查询响应时间超过阈值的服务，阈值：{}ms", responseTimeThreshold);
        
        if (responseTimeThreshold == null || responseTimeThreshold <= 0) {
            responseTimeThreshold = 1000L; // 默认1秒
        }
        
        List<SystemStatus> slowServices = baseMapper.selectSlowResponseServices(responseTimeThreshold);
        log.info("查询完成，慢响应服务数量：{}", slowServices.size());
        
        return slowServices;
    }
    
    @Override
    public int resetFailureCount(String serviceName) {
        log.info("重置服务失败计数：{}", serviceName);
        
        if (serviceName == null || serviceName.trim().isEmpty()) {
            throw new BusinessException("服务名称不能为空");
        }
        
        int updateCount = baseMapper.resetFailureCount(serviceName);
        log.info("失败计数重置完成，更新记录数：{}", updateCount);
        
        return updateCount;
    }
    
    @Override
    public int batchUpdateMonitorEnabled(List<String> serviceNames, Boolean monitorEnabled) {
        log.info("批量更新监控启用状态，服务列表：{}，启用状态：{}", serviceNames, monitorEnabled);
        
        if (serviceNames == null || serviceNames.isEmpty()) {
            throw new BusinessException("服务名称列表不能为空");
        }
        
        if (monitorEnabled == null) {
            throw new BusinessException("监控启用状态不能为空");
        }
        
        // 构建服务名称字符串
        String serviceNamesStr = serviceNames.stream()
                                           .map(name -> "'" + name + "'")
                                           .collect(Collectors.joining(","));
        
        int updateCount = baseMapper.batchUpdateMonitorEnabled(serviceNamesStr, monitorEnabled);
        log.info("批量更新完成，更新记录数：{}", updateCount);
        
        return updateCount;
    }
    
    @Override
    public Double getAverageResponseTime() {
        log.info("查询平均响应时间");
        
        Double avgResponseTime = baseMapper.selectAverageResponseTime();
        if (avgResponseTime == null) {
            avgResponseTime = 0.0;
        }
        
        log.info("平均响应时间：{}ms", avgResponseTime);
        return avgResponseTime;
    }
    
    @Override
    public Double getSystemHealthPercentage() {
        log.info("查询系统整体健康度");
        
        Double healthPercentage = baseMapper.selectSystemHealthPercentage();
        if (healthPercentage == null) {
            healthPercentage = 0.0;
        }
        
        log.info("系统健康度：{}%", healthPercentage);
        return healthPercentage;
    }
    
    @Override
    public SystemStatus performHealthCheck(String serviceName) {
        log.info("执行服务健康检查：{}", serviceName);
        
        if (serviceName == null || serviceName.trim().isEmpty()) {
            throw new BusinessException("服务名称不能为空");
        }
        
        SystemStatus status = getStatusByServiceName(serviceName);
        if (status == null) {
            log.warn("服务状态记录不存在：{}", serviceName);
            return null;
        }
        
        if (!status.getMonitorEnabled()) {
            log.info("服务监控未启用：{}", serviceName);
            return status;
        }
        
        try {
            // 模拟健康检查逻辑
            long startTime = System.currentTimeMillis();
            
            // 这里应该实现实际的健康检查逻辑，比如HTTP请求、数据库连接测试等
            // 为了演示，这里使用简单的模拟逻辑
            boolean isHealthy = simulateHealthCheck(status.getServiceUrl());
            
            long responseTime = System.currentTimeMillis() - startTime;
            LocalDateTime checkTime = LocalDateTime.now();
            
            ServiceStatus newStatus;
            String errorMessage = null;
            int newFailureCount = status.getFailureCount();
            
            if (isHealthy) {
                newStatus = ServiceStatus.UP;
                newFailureCount = 0; // 重置失败计数
                
                // 更新健康详情
                Map<String, Object> healthDetails = new HashMap<>();
                healthDetails.put("status", "UP");
                healthDetails.put("timestamp", System.currentTimeMillis());
                healthDetails.put("responseTime", responseTime);
                status.setHealthDetails(healthDetails);
                
            } else {
                newStatus = ServiceStatus.DOWN;
                newFailureCount = status.getFailureCount() + 1;
                errorMessage = "健康检查失败";
                
                // 更新健康详情
                Map<String, Object> healthDetails = new HashMap<>();
                healthDetails.put("status", "DOWN");
                healthDetails.put("timestamp", System.currentTimeMillis());
                healthDetails.put("error", errorMessage);
                status.setHealthDetails(healthDetails);
            }
            
            // 更新健康检查结果
            updateHealthCheckResult(serviceName, newStatus, responseTime, checkTime, errorMessage, newFailureCount);
            
            // 更新状态对象
            status.setServiceStatus(newStatus);
            status.setResponseTime(responseTime);
            status.setLastCheckTime(checkTime);
            status.setErrorMessage(errorMessage);
            status.setFailureCount(newFailureCount);
            
            log.info("健康检查完成：{}，状态：{}，响应时间：{}ms", serviceName, newStatus, responseTime);
            
        } catch (Exception e) {
            log.error("健康检查异常：" + serviceName, e);
            
            // 更新为异常状态
            updateHealthCheckResult(serviceName, ServiceStatus.DOWN, null, LocalDateTime.now(), 
                                  e.getMessage(), status.getFailureCount() + 1);
        }
        
        return status;
    }
    
    @Override
    public int performAllHealthChecks() {
        log.info("执行所有服务的健康检查");
        
        LocalDateTime currentTime = LocalDateTime.now();
        List<SystemStatus> servicesToCheck = getServicesForHealthCheck(currentTime);
        
        int checkedCount = 0;
        for (SystemStatus service : servicesToCheck) {
            try {
                performHealthCheck(service.getServiceName());
                checkedCount++;
            } catch (Exception e) {
                log.error("健康检查失败：" + service.getServiceName(), e);
            }
        }
        
        log.info("所有服务健康检查完成，检查服务数量：{}", checkedCount);
        return checkedCount;
    }
    
    @Override
    public SystemStatus createOrUpdateServiceStatus(String serviceName, String serviceUrl, 
                                                  Boolean monitorEnabled, Integer monitorInterval) {
        log.info("创建或更新服务状态：{}，地址：{}，监控启用：{}，监控间隔：{}s", 
                serviceName, serviceUrl, monitorEnabled, monitorInterval);
        
        if (serviceName == null || serviceName.trim().isEmpty()) {
            throw new BusinessException("服务名称不能为空");
        }
        
        // 查找现有记录
        SystemStatus existingStatus = getStatusByServiceName(serviceName);
        
        SystemStatus status;
        if (existingStatus != null) {
            // 更新现有记录
            status = existingStatus;
            status.setServiceUrl(serviceUrl);
            if (monitorEnabled != null) {
                status.setMonitorEnabled(monitorEnabled);
            }
            if (monitorInterval != null) {
                status.setMonitorInterval(monitorInterval);
            }
            
            boolean success = updateById(status);
            if (!success) {
                throw new BusinessException("更新服务状态失败");
            }
            
            log.info("服务状态更新成功：{}", serviceName);
            
        } else {
            // 创建新记录
            status = new SystemStatus();
            status.setServiceName(serviceName);
            status.setServiceUrl(serviceUrl);
            status.setServiceStatus(ServiceStatus.UP);
            status.setMonitorEnabled(monitorEnabled != null ? monitorEnabled : true);
            status.setMonitorInterval(monitorInterval != null ? monitorInterval : 60);
            status.setFailureCount(0);
            
            boolean success = save(status);
            if (!success) {
                throw new BusinessException("创建服务状态失败");
            }
            
            log.info("服务状态创建成功：{}", serviceName);
        }
        
        return status;
    }
    
    /**
     * 模拟健康检查逻辑
     * 
     * @param serviceUrl 服务地址
     * @return 是否健康
     */
    private boolean simulateHealthCheck(String serviceUrl) {
        // 这里应该实现实际的健康检查逻辑
        // 比如HTTP请求、数据库连接测试、文件系统检查等
        
        if (serviceUrl == null || serviceUrl.trim().isEmpty()) {
            return false;
        }
        
        // 简单模拟：90%的概率返回健康状态
        return Math.random() > 0.1;
    }
    

}