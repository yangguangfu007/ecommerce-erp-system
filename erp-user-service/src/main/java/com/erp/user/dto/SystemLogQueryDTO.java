package com.erp.user.dto;

import com.erp.user.enums.LogLevel;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 系统日志查询DTO
 * 
 * @author ERP System
 */
@Data
public class SystemLogQueryDTO {
    
    /**
     * 日志级别
     */
    private LogLevel logLevel;
    
    /**
     * 日志消息（模糊查询）
     */
    private String message;
    
    /**
     * 模块名称
     */
    private String moduleName;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 用户名（模糊查询）
     */
    private String username;
    
    /**
     * 客户端IP
     */
    private String clientIp;
    
    /**
     * 请求URI（模糊查询）
     */
    private String requestUri;
    
    /**
     * 请求方法
     */
    private String requestMethod;
    
    /**
     * 响应状态码
     */
    private Integer responseStatus;
    
    /**
     * 开始时间
     */
    private LocalDateTime startTime;
    
    /**
     * 结束时间
     */
    private LocalDateTime endTime;
    
    /**
     * 最小执行时间（毫秒）
     */
    private Long minExecutionTime;
    
    /**
     * 最大执行时间（毫秒）
     */
    private Long maxExecutionTime;
    
    /**
     * 是否包含异常信息
     */
    private Boolean hasException;
}