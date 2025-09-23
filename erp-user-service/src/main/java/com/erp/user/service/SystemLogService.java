package com.erp.user.service;

import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.user.dto.SystemLogQueryDTO;
import com.erp.user.entity.SystemLog;
import com.erp.user.enums.LogLevel;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 系统日志服务接口
 * 继承BaseServicePlus获得增强的业务方法
 * 
 * @author ERP System
 */
public interface SystemLogService extends BaseServicePlus<SystemLog> {
    
    /**
     * 分页查询系统日志
     * 
     * @param page 页码
     * @param size 每页大小
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    PageResult<SystemLog> getLogPage(Long page, Long size, SystemLogQueryDTO queryDTO);
    
    /**
     * 根据日志级别查询日志列表
     * 
     * @param logLevel 日志级别
     * @param limit 限制数量
     * @return 日志列表
     */
    List<SystemLog> getLogsByLevel(LogLevel logLevel, Integer limit);
    
    /**
     * 根据模块名称查询日志列表
     * 
     * @param moduleName 模块名称
     * @param limit 限制数量
     * @return 日志列表
     */
    List<SystemLog> getLogsByModule(String moduleName, Integer limit);
    
    /**
     * 根据用户ID查询日志列表
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 日志列表
     */
    List<SystemLog> getLogsByUser(Long userId, Integer limit);
    
    /**
     * 统计指定时间范围内的日志数量
     * 
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 日志数量
     */
    Long countLogsByTimeRange(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 根据日志级别统计数量
     * 
     * @param logLevel 日志级别
     * @return 日志数量
     */
    Long countLogsByLevel(LogLevel logLevel);
    
    /**
     * 获取日志级别统计
     * 
     * @return 级别统计结果
     */
    List<Map<String, Object>> getLogLevelStats();
    
    /**
     * 获取模块统计
     * 
     * @return 模块统计结果
     */
    List<Map<String, Object>> getModuleStats();
    
    /**
     * 获取最近的错误日志
     * 
     * @param limit 限制数量
     * @return 错误日志列表
     */
    List<SystemLog> getRecentErrors(Integer limit);
    
    /**
     * 统计指定时间范围内的异常日志数量
     * 
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 异常日志数量
     */
    Long countExceptionsByTimeRange(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 查询慢查询日志
     * 
     * @param executionTimeThreshold 执行时间阈值（毫秒）
     * @param limit 限制数量
     * @return 慢查询日志列表
     */
    List<SystemLog> getSlowLogs(Long executionTimeThreshold, Integer limit);
    
    /**
     * 清理指定时间之前的日志
     * 
     * @param beforeTime 时间点
     * @return 删除的记录数
     */
    int cleanupLogsBefore(LocalDateTime beforeTime);
    
    /**
     * 记录系统日志
     * 
     * @param logLevel 日志级别
     * @param message 日志消息
     * @param moduleName 模块名称
     * @param userId 用户ID
     * @param username 用户名
     * @param clientIp 客户端IP
     * @param requestUri 请求URI
     * @param requestMethod 请求方法
     * @param requestParams 请求参数
     * @param responseStatus 响应状态码
     * @param executionTime 执行时间
     * @param exceptionMessage 异常信息
     * @return 日志记录
     */
    SystemLog recordLog(LogLevel logLevel, String message, String moduleName, 
                       Long userId, String username, String clientIp, 
                       String requestUri, String requestMethod, Map<String, Object> requestParams,
                       Integer responseStatus, Long executionTime, String exceptionMessage);
}