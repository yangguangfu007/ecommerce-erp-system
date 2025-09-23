package com.erp.user.service;

import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.user.dto.SystemStatusQueryDTO;
import com.erp.user.entity.SystemStatus;
import com.erp.user.enums.ServiceStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 系统状态服务接口
 * 继承BaseServicePlus获得增强的业务方法
 * 
 * @author ERP System
 */
public interface SystemStatusService extends BaseServicePlus<SystemStatus> {
    
    /**
     * 分页查询系统状态
     * 
     * @param page 页码
     * @param size 每页大小
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    PageResult<SystemStatus> getStatusPage(Long page, Long size, SystemStatusQueryDTO queryDTO);
    
    /**
     * 根据服务名称获取系统状态
     * 
     * @param serviceName 服务名称
     * @return 系统状态
     */
    SystemStatus getStatusByServiceName(String serviceName);
    
    /**
     * 根据服务状态查询服务列表
     * 
     * @param serviceStatus 服务状态
     * @return 服务状态列表
     */
    List<SystemStatus> getStatusesByServiceStatus(ServiceStatus serviceStatus);
    
    /**
     * 查询启用监控的服务列表
     * 
     * @return 启用监控的服务列表
     */
    List<SystemStatus> getMonitorEnabledServices();
    
    /**
     * 统计各种服务状态的数量
     * 
     * @return 状态统计结果
     */
    List<Map<String, Object>> getServiceStatusStats();
    
    /**
     * 根据服务状态统计数量
     * 
     * @param serviceStatus 服务状态
     * @return 服务数量
     */
    Long countByServiceStatus(ServiceStatus serviceStatus);
    
    /**
     * 查询需要进行健康检查的服务
     * 
     * @param currentTime 当前时间
     * @return 需要检查的服务列表
     */
    List<SystemStatus> getServicesForHealthCheck(LocalDateTime currentTime);
    
    /**
     * 更新服务健康检查结果
     * 
     * @param serviceName 服务名称
     * @param serviceStatus 服务状态
     * @param responseTime 响应时间
     * @param lastCheckTime 检查时间
     * @param errorMessage 错误信息
     * @param failureCount 失败次数
     * @return 更新的记录数
     */
    int updateHealthCheckResult(String serviceName, ServiceStatus serviceStatus, 
                               Long responseTime, LocalDateTime lastCheckTime, 
                               String errorMessage, Integer failureCount);
    
    /**
     * 查询异常服务列表
     * 
     * @return 异常服务列表
     */
    List<SystemStatus> getAbnormalServices();
    
    /**
     * 查询响应时间超过阈值的服务
     * 
     * @param responseTimeThreshold 响应时间阈值（毫秒）
     * @return 慢响应服务列表
     */
    List<SystemStatus> getSlowResponseServices(Long responseTimeThreshold);
    
    /**
     * 重置服务失败计数
     * 
     * @param serviceName 服务名称
     * @return 更新的记录数
     */
    int resetFailureCount(String serviceName);
    
    /**
     * 批量更新监控启用状态
     * 
     * @param serviceNames 服务名称列表
     * @param monitorEnabled 监控启用状态
     * @return 更新的记录数
     */
    int batchUpdateMonitorEnabled(List<String> serviceNames, Boolean monitorEnabled);
    
    /**
     * 查询平均响应时间
     * 
     * @return 平均响应时间
     */
    Double getAverageResponseTime();
    
    /**
     * 查询系统整体健康度
     * 
     * @return 健康度百分比
     */
    Double getSystemHealthPercentage();
    
    /**
     * 执行服务健康检查
     * 
     * @param serviceName 服务名称
     * @return 健康检查结果
     */
    SystemStatus performHealthCheck(String serviceName);
    
    /**
     * 执行所有服务的健康检查
     * 
     * @return 检查的服务数量
     */
    int performAllHealthChecks();
    
    /**
     * 创建或更新服务状态
     * 
     * @param serviceName 服务名称
     * @param serviceUrl 服务地址
     * @param monitorEnabled 是否启用监控
     * @param monitorInterval 监控间隔
     * @return 服务状态
     */
    SystemStatus createOrUpdateServiceStatus(String serviceName, String serviceUrl, 
                                           Boolean monitorEnabled, Integer monitorInterval);
}