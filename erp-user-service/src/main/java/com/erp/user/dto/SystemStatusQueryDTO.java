package com.erp.user.dto;

import com.erp.user.enums.ServiceStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 系统状态查询DTO
 * 
 * @author ERP System
 */
@Data
public class SystemStatusQueryDTO {
    
    /**
     * 服务名称（模糊查询）
     */
    private String serviceName;
    
    /**
     * 服务状态
     */
    private ServiceStatus serviceStatus;
    
    /**
     * 是否启用监控
     */
    private Boolean monitorEnabled;
    
    /**
     * 最小响应时间（毫秒）
     */
    private Long minResponseTime;
    
    /**
     * 最大响应时间（毫秒）
     */
    private Long maxResponseTime;
    
    /**
     * 最小失败次数
     */
    private Integer minFailureCount;
    
    /**
     * 最大失败次数
     */
    private Integer maxFailureCount;
    
    /**
     * 最后检查开始时间
     */
    private LocalDateTime lastCheckStartTime;
    
    /**
     * 最后检查结束时间
     */
    private LocalDateTime lastCheckEndTime;
    
    /**
     * 是否有错误信息
     */
    private Boolean hasError;
}