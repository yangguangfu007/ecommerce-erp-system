package com.erp.user.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.mapper.BaseMapperPlus;
import com.erp.user.entity.SystemStatus;
import com.erp.user.enums.ServiceStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 系统状态数据访问层
 * 继承BaseMapperPlus获得增强的CRUD方法
 * 
 * @author ERP System
 */
@Mapper
public interface SystemStatusMapper extends BaseMapperPlus<SystemStatus> {
    
    /**
     * 根据服务名称查询系统状态
     * 
     * @param serviceName 服务名称
     * @return 系统状态
     */
    @Select("SELECT * FROM system_status WHERE service_name = #{serviceName} AND deleted = 0 LIMIT 1")
    SystemStatus selectByServiceName(@Param("serviceName") String serviceName);
    
    /**
     * 根据服务状态查询服务列表
     * 
     * @param serviceStatus 服务状态
     * @return 服务状态列表
     */
    @Select("SELECT * FROM system_status WHERE service_status = #{serviceStatus} AND deleted = 0 ORDER BY service_name ASC")
    List<SystemStatus> selectByServiceStatus(@Param("serviceStatus") ServiceStatus serviceStatus);
    
    /**
     * 查询启用监控的服务列表
     * 
     * @return 启用监控的服务列表
     */
    @Select("SELECT * FROM system_status WHERE monitor_enabled = 1 AND deleted = 0 ORDER BY service_name ASC")
    List<SystemStatus> selectMonitorEnabledServices();
    
    /**
     * 统计各种服务状态的数量
     * 
     * @return 状态统计结果
     */
    @Select("SELECT service_status, COUNT(*) as count FROM system_status WHERE deleted = 0 GROUP BY service_status ORDER BY service_status")
    List<java.util.Map<String, Object>> selectServiceStatusStats();
    
    /**
     * 根据服务状态统计数量
     * 
     * @param serviceStatus 服务状态
     * @return 服务数量
     */
    @Select("SELECT COUNT(*) FROM system_status WHERE service_status = #{serviceStatus} AND deleted = 0")
    Long countByServiceStatus(@Param("serviceStatus") ServiceStatus serviceStatus);
    
    /**
     * 查询需要进行健康检查的服务（基于监控间隔）
     * 
     * @param currentTime 当前时间
     * @return 需要检查的服务列表
     */
    @Select("SELECT * FROM system_status WHERE monitor_enabled = 1 AND deleted = 0 AND " +
            "(last_check_time IS NULL OR TIMESTAMPDIFF(SECOND, last_check_time, #{currentTime}) >= monitor_interval) " +
            "ORDER BY last_check_time ASC")
    List<SystemStatus> selectServicesForHealthCheck(@Param("currentTime") LocalDateTime currentTime);
    
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
    @Update("UPDATE system_status SET service_status = #{serviceStatus}, response_time = #{responseTime}, " +
            "last_check_time = #{lastCheckTime}, error_message = #{errorMessage}, failure_count = #{failureCount}, " +
            "update_time = NOW() WHERE service_name = #{serviceName} AND deleted = 0")
    int updateHealthCheckResult(@Param("serviceName") String serviceName,
                               @Param("serviceStatus") ServiceStatus serviceStatus,
                               @Param("responseTime") Long responseTime,
                               @Param("lastCheckTime") LocalDateTime lastCheckTime,
                               @Param("errorMessage") String errorMessage,
                               @Param("failureCount") Integer failureCount);
    
    /**
     * 分页查询系统状态（支持状态筛选）
     * 使用BaseMapperPlus的增强分页方法
     * 
     * @param page 分页对象
     * @param queryWrapper 查询条件
     * @return 分页结果
     */
    default IPage<SystemStatus> selectStatusPage(IPage<SystemStatus> page, LambdaQueryWrapper<SystemStatus> queryWrapper) {
        return selectPageByCondition(page, queryWrapper);
    }
    
    /**
     * 查询异常服务列表（状态为DOWN或DEGRADED）
     * 
     * @return 异常服务列表
     */
    @Select("SELECT * FROM system_status WHERE service_status IN ('DOWN', 'DEGRADED') AND deleted = 0 ORDER BY failure_count DESC, last_check_time DESC")
    List<SystemStatus> selectAbnormalServices();
    
    /**
     * 查询响应时间超过阈值的服务
     * 
     * @param responseTimeThreshold 响应时间阈值（毫秒）
     * @return 慢响应服务列表
     */
    @Select("SELECT * FROM system_status WHERE response_time > #{responseTimeThreshold} AND deleted = 0 ORDER BY response_time DESC")
    List<SystemStatus> selectSlowResponseServices(@Param("responseTimeThreshold") Long responseTimeThreshold);
    
    /**
     * 重置服务失败计数
     * 
     * @param serviceName 服务名称
     * @return 更新的记录数
     */
    @Update("UPDATE system_status SET failure_count = 0, update_time = NOW() WHERE service_name = #{serviceName} AND deleted = 0")
    int resetFailureCount(@Param("serviceName") String serviceName);
    
    /**
     * 批量更新监控启用状态
     * 
     * @param serviceNames 服务名称列表
     * @param monitorEnabled 监控启用状态
     * @return 更新的记录数
     */
    @Update("UPDATE system_status SET monitor_enabled = #{monitorEnabled}, update_time = NOW() WHERE service_name IN (${serviceNames}) AND deleted = 0")
    int batchUpdateMonitorEnabled(@Param("serviceNames") String serviceNames, @Param("monitorEnabled") Boolean monitorEnabled);
    
    /**
     * 查询平均响应时间
     * 
     * @return 平均响应时间
     */
    @Select("SELECT AVG(response_time) FROM system_status WHERE service_status = 'UP' AND response_time IS NOT NULL AND deleted = 0")
    Double selectAverageResponseTime();
    
    /**
     * 查询系统整体健康度（正常服务占比）
     * 
     * @return 健康度百分比
     */
    @Select("SELECT ROUND((COUNT(CASE WHEN service_status = 'UP' THEN 1 END) * 100.0 / COUNT(*)), 2) as health_percentage " +
            "FROM system_status WHERE deleted = 0")
    Double selectSystemHealthPercentage();
}