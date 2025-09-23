package com.erp.user.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.common.handler.JsonTypeHandler;
import com.erp.user.enums.ServiceStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 系统状态实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 * 
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("system_status")
public class SystemStatus extends BaseEntity {
    
    /**
     * 服务名称
     */
    @TableField("service_name")
    private String serviceName;
    
    /**
     * 服务状态
     */
    @TableField("service_status")
    private ServiceStatus serviceStatus;
    
    /**
     * 服务地址
     */
    @TableField("service_url")
    private String serviceUrl;
    
    /**
     * 响应时间（毫秒）
     */
    @TableField("response_time")
    private Long responseTime;
    
    /**
     * 最后检查时间
     */
    @TableField("last_check_time")
    private LocalDateTime lastCheckTime;
    
    /**
     * 健康检查详情（JSON格式）
     */
    @TableField(value = "health_details", typeHandler = JsonTypeHandler.class)
    private Map<String, Object> healthDetails;
    
    /**
     * 错误信息
     */
    @TableField("error_message")
    private String errorMessage;
    
    /**
     * 连续失败次数
     */
    @TableField("failure_count")
    private Integer failureCount;
    
    /**
     * 是否启用监控
     */
    @TableField("monitor_enabled")
    private Boolean monitorEnabled;
    
    /**
     * 监控间隔（秒）
     */
    @TableField("monitor_interval")
    private Integer monitorInterval;
    
    /**
     * 获取实体描述信息
     * 
     * @return 实体描述
     */
    @Override
    public String getEntityDescription() {
        return "SystemStatus(serviceName=" + serviceName + ", status=" + serviceStatus + ")";
    }
}