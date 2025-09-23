package com.erp.user.entity;

import com.erp.user.enums.LogLevel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 系统日志实体类测试
 * 验证BaseEntity继承和JsonTypeHandler处理
 * 
 * @author ERP System
 */
@DisplayName("系统日志实体类测试")
class SystemLogEntityTest {
    
    @Test
    @DisplayName("测试系统日志实体类基本属性")
    void testSystemLogBasicProperties() {
        // 准备测试数据
        SystemLog log = new SystemLog();
        log.setId(1L);
        log.setLogLevel(LogLevel.INFO);
        log.setMessage("用户登录成功");
        log.setModuleName("用户管理");
        log.setUserId(1001L);
        log.setUsername("admin");
        log.setClientIp("192.168.1.100");
        log.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        log.setRequestUri("/api/users/login");
        log.setRequestMethod("POST");
        
        Map<String, Object> requestParams = new HashMap<>();
        requestParams.put("username", "admin");
        requestParams.put("loginTime", "2024-01-01 10:00:00");
        log.setRequestParams(requestParams);
        
        log.setResponseStatus(200);
        log.setExecutionTime(150L);
        
        // 设置BaseEntity字段
        log.setCreateTime(LocalDateTime.now());
        log.setUpdateTime(LocalDateTime.now());
        log.setCreateBy(1L);
        log.setUpdateBy(1L);
        log.setDeleted(0);
        log.setVersion(1);
        
        // 验证基本属性
        assertThat(log.getId()).isEqualTo(1L);
        assertThat(log.getLogLevel()).isEqualTo(LogLevel.INFO);
        assertThat(log.getMessage()).isEqualTo("用户登录成功");
        assertThat(log.getModuleName()).isEqualTo("用户管理");
        assertThat(log.getUserId()).isEqualTo(1001L);
        assertThat(log.getUsername()).isEqualTo("admin");
        assertThat(log.getClientIp()).isEqualTo("192.168.1.100");
        assertThat(log.getUserAgent()).contains("Mozilla/5.0");
        assertThat(log.getRequestUri()).isEqualTo("/api/users/login");
        assertThat(log.getRequestMethod()).isEqualTo("POST");
        assertThat(log.getRequestParams()).isNotNull();
        assertThat(log.getRequestParams().get("username")).isEqualTo("admin");
        assertThat(log.getResponseStatus()).isEqualTo(200);
        assertThat(log.getExecutionTime()).isEqualTo(150L);
        
        // 验证BaseEntity继承的字段
        assertThat(log.getCreateTime()).isNotNull();
        assertThat(log.getUpdateTime()).isNotNull();
        assertThat(log.getCreateBy()).isEqualTo(1L);
        assertThat(log.getUpdateBy()).isEqualTo(1L);
        assertThat(log.getDeleted()).isEqualTo(0);
        assertThat(log.getVersion()).isEqualTo(1);
    }
    
    @Test
    @DisplayName("测试系统日志实体类继承BaseEntity的方法")
    void testSystemLogBaseEntityMethods() {
        // 准备测试数据
        SystemLog log = new SystemLog();
        log.setLogLevel(LogLevel.ERROR);
        log.setModuleName("订单管理");
        log.setUsername("testuser");
        
        // 测试新实体判断
        assertThat(log.isNew()).isTrue();
        
        // 设置ID后不再是新实体
        log.setId(1L);
        assertThat(log.isNew()).isFalse();
        
        // 测试逻辑删除判断
        log.setDeleted(0);
        assertThat(log.isLogicallyDeleted()).isFalse();
        
        log.setDeleted(1);
        assertThat(log.isLogicallyDeleted()).isTrue();
        
        // 测试实体描述
        String description = log.getEntityDescription();
        assertThat(description).contains("SystemLog");
        assertThat(description).contains("ERROR");
        assertThat(description).contains("订单管理");
        assertThat(description).contains("testuser");
    }
    
    @Test
    @DisplayName("测试系统日志异常信息处理")
    void testSystemLogExceptionHandling() {
        // 准备测试数据
        SystemLog log = new SystemLog();
        log.setLogLevel(LogLevel.ERROR);
        log.setMessage("数据库连接失败");
        log.setExceptionMessage("Connection refused: connect");
        log.setStackTrace("java.sql.SQLException: Connection refused\n\tat com.mysql.cj.jdbc.ConnectionImpl.connectOneTryOnly");
        
        // 验证异常信息设置
        assertThat(log.getLogLevel()).isEqualTo(LogLevel.ERROR);
        assertThat(log.getMessage()).isEqualTo("数据库连接失败");
        assertThat(log.getExceptionMessage()).isEqualTo("Connection refused: connect");
        assertThat(log.getStackTrace()).contains("java.sql.SQLException");
        assertThat(log.getStackTrace()).contains("ConnectionImpl.connectOneTryOnly");
    }
    
    @Test
    @DisplayName("测试日志级别枚举")
    void testLogLevelEnum() {
        // 测试所有日志级别
        SystemLog debugLog = new SystemLog();
        debugLog.setLogLevel(LogLevel.DEBUG);
        assertThat(debugLog.getLogLevel()).isEqualTo(LogLevel.DEBUG);
        assertThat(debugLog.getLogLevel().getCode()).isEqualTo("DEBUG");
        assertThat(debugLog.getLogLevel().getDescription()).isEqualTo("调试");
        
        SystemLog infoLog = new SystemLog();
        infoLog.setLogLevel(LogLevel.INFO);
        assertThat(infoLog.getLogLevel()).isEqualTo(LogLevel.INFO);
        assertThat(infoLog.getLogLevel().getCode()).isEqualTo("INFO");
        assertThat(infoLog.getLogLevel().getDescription()).isEqualTo("信息");
        
        SystemLog warnLog = new SystemLog();
        warnLog.setLogLevel(LogLevel.WARN);
        assertThat(warnLog.getLogLevel()).isEqualTo(LogLevel.WARN);
        assertThat(warnLog.getLogLevel().getCode()).isEqualTo("WARN");
        assertThat(warnLog.getLogLevel().getDescription()).isEqualTo("警告");
        
        SystemLog errorLog = new SystemLog();
        errorLog.setLogLevel(LogLevel.ERROR);
        assertThat(errorLog.getLogLevel()).isEqualTo(LogLevel.ERROR);
        assertThat(errorLog.getLogLevel().getCode()).isEqualTo("ERROR");
        assertThat(errorLog.getLogLevel().getDescription()).isEqualTo("错误");
    }
    
    @Test
    @DisplayName("测试系统日志请求参数JSON处理")
    void testSystemLogRequestParamsJsonHandling() {
        // 准备测试数据
        SystemLog log = new SystemLog();
        
        // 测试复杂请求参数
        Map<String, Object> requestParams = new HashMap<>();
        requestParams.put("userId", 1001L);
        requestParams.put("action", "updateProfile");
        requestParams.put("timestamp", System.currentTimeMillis());
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("name", "张三");
        userInfo.put("email", "zhangsan@example.com");
        userInfo.put("phone", "13800138000");
        requestParams.put("userInfo", userInfo);
        
        log.setRequestParams(requestParams);
        
        // 验证JSON字段设置
        assertThat(log.getRequestParams()).isNotNull();
        assertThat(log.getRequestParams().get("userId")).isEqualTo(1001L);
        assertThat(log.getRequestParams().get("action")).isEqualTo("updateProfile");
        assertThat(log.getRequestParams().get("timestamp")).isNotNull();
        
        @SuppressWarnings("unchecked")
        Map<String, Object> retrievedUserInfo = (Map<String, Object>) log.getRequestParams().get("userInfo");
        assertThat(retrievedUserInfo).isNotNull();
        assertThat(retrievedUserInfo.get("name")).isEqualTo("张三");
        assertThat(retrievedUserInfo.get("email")).isEqualTo("zhangsan@example.com");
        assertThat(retrievedUserInfo.get("phone")).isEqualTo("13800138000");
    }
}