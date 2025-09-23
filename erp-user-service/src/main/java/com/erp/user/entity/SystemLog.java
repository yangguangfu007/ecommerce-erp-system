package com.erp.user.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.common.handler.JsonTypeHandler;
import com.erp.user.enums.LogLevel;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Map;

/**
 * 系统日志实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 * 
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("system_logs")
public class SystemLog extends BaseEntity {
    
    /**
     * 日志级别
     */
    @TableField("log_level")
    private LogLevel logLevel;
    
    /**
     * 日志消息
     */
    @TableField("message")
    private String message;
    
    /**
     * 模块名称
     */
    @TableField("module_name")
    private String moduleName;
    
    /**
     * 操作用户ID
     */
    @TableField("user_id")
    private Long userId;
    
    /**
     * 用户名
     */
    @TableField("username")
    private String username;
    
    /**
     * 客户端IP地址
     */
    @TableField("client_ip")
    private String clientIp;
    
    /**
     * 用户代理信息
     */
    @TableField("user_agent")
    private String userAgent;
    
    /**
     * 请求URI
     */
    @TableField("request_uri")
    private String requestUri;
    
    /**
     * 请求方法
     */
    @TableField("request_method")
    private String requestMethod;
    
    /**
     * 请求参数（JSON格式）
     */
    @TableField(value = "request_params", typeHandler = JsonTypeHandler.class)
    private Map<String, Object> requestParams;
    
    /**
     * 响应状态码
     */
    @TableField("response_status")
    private Integer responseStatus;
    
    /**
     * 执行时间（毫秒）
     */
    @TableField("execution_time")
    private Long executionTime;
    
    /**
     * 异常信息
     */
    @TableField("exception_message")
    private String exceptionMessage;
    
    /**
     * 异常堆栈信息
     */
    @TableField("stack_trace")
    private String stackTrace;
    
    /**
     * 获取实体描述信息
     * 
     * @return 实体描述
     */
    @Override
    public String getEntityDescription() {
        return "SystemLog(level=" + logLevel + ", module=" + moduleName + ", user=" + username + ")";
    }
}