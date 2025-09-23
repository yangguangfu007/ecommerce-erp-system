package com.erp.user.entity;

import com.erp.user.enums.ServiceStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 系统状态实体类测试
 * 验证BaseEntity继承和JsonTypeHandler处理
 * 
 * @author ERP System
 */
@DisplayName("系统状态实体类测试")
class SystemStatusEntityTest {
    
    @Test
    @DisplayName("测试系统状态实体类基本属性")
    void testSystemStatusBasicProperties() {
        // 准备测试数据
        SystemStatus status = new SystemStatus();
        status.setId(1L);
        status.setServiceName("用户服务");
        status.setServiceStatus(ServiceStatus.UP);
        status.setServiceUrl("http://localhost:8001/actuator/health");
        status.setResponseTime(120L);
        status.setLastCheckTime(LocalDateTime.now());
        
        Map<String, Object> healthDetails = new HashMap<>();
        healthDetails.put("status", "UP");
        healthDetails.put("diskSpace", Map.of("status", "UP", "total", 1000000000L, "free", 800000000L));
        healthDetails.put("db", Map.of("status", "UP", "database", "MySQL", "validationQuery", "isValid()"));
        status.setHealthDetails(healthDetails);
        
        status.setFailureCount(0);
        status.setMonitorEnabled(true);
        status.setMonitorInterval(60);
        
        // 设置BaseEntity字段
        status.setCreateTime(LocalDateTime.now());
        status.setUpdateTime(LocalDateTime.now());
        status.setCreateBy(1L);
        status.setUpdateBy(1L);
        status.setDeleted(0);
        status.setVersion(1);
        
        // 验证基本属性
        assertThat(status.getId()).isEqualTo(1L);
        assertThat(status.getServiceName()).isEqualTo("用户服务");
        assertThat(status.getServiceStatus()).isEqualTo(ServiceStatus.UP);
        assertThat(status.getServiceUrl()).isEqualTo("http://localhost:8001/actuator/health");
        assertThat(status.getResponseTime()).isEqualTo(120L);
        assertThat(status.getLastCheckTime()).isNotNull();
        assertThat(status.getHealthDetails()).isNotNull();
        assertThat(status.getHealthDetails().get("status")).isEqualTo("UP");
        assertThat(status.getFailureCount()).isEqualTo(0);
        assertThat(status.getMonitorEnabled()).isTrue();
        assertThat(status.getMonitorInterval()).isEqualTo(60);
        
        // 验证BaseEntity继承的字段
        assertThat(status.getCreateTime()).isNotNull();
        assertThat(status.getUpdateTime()).isNotNull();
        assertThat(status.getCreateBy()).isEqualTo(1L);
        assertThat(status.getUpdateBy()).isEqualTo(1L);
        assertThat(status.getDeleted()).isEqualTo(0);
        assertThat(status.getVersion()).isEqualTo(1);
    }
    
    @Test
    @DisplayName("测试系统状态实体类继承BaseEntity的方法")
    void testSystemStatusBaseEntityMethods() {
        // 准备测试数据
        SystemStatus status = new SystemStatus();
        status.setServiceName("订单服务");
        status.setServiceStatus(ServiceStatus.DOWN);
        
        // 测试新实体判断
        assertThat(status.isNew()).isTrue();
        
        // 设置ID后不再是新实体
        status.setId(1L);
        assertThat(status.isNew()).isFalse();
        
        // 测试逻辑删除判断
        status.setDeleted(0);
        assertThat(status.isLogicallyDeleted()).isFalse();
        
        status.setDeleted(1);
        assertThat(status.isLogicallyDeleted()).isTrue();
        
        // 测试实体描述
        String description = status.getEntityDescription();
        assertThat(description).contains("SystemStatus");
        assertThat(description).contains("订单服务");
        assertThat(description).contains("DOWN");
    }
    
    @Test
    @DisplayName("测试系统状态异常情况处理")
    void testSystemStatusErrorHandling() {
        // 准备测试数据
        SystemStatus status = new SystemStatus();
        status.setServiceName("数据库服务");
        status.setServiceStatus(ServiceStatus.DOWN);
        status.setErrorMessage("连接超时");
        status.setFailureCount(3);
        status.setResponseTime(5000L);
        
        Map<String, Object> healthDetails = new HashMap<>();
        healthDetails.put("status", "DOWN");
        healthDetails.put("error", "Connection timeout");
        healthDetails.put("lastSuccessTime", "2024-01-01T09:00:00");
        status.setHealthDetails(healthDetails);
        
        // 验证异常状态设置
        assertThat(status.getServiceStatus()).isEqualTo(ServiceStatus.DOWN);
        assertThat(status.getErrorMessage()).isEqualTo("连接超时");
        assertThat(status.getFailureCount()).isEqualTo(3);
        assertThat(status.getResponseTime()).isEqualTo(5000L);
        assertThat(status.getHealthDetails().get("status")).isEqualTo("DOWN");
        assertThat(status.getHealthDetails().get("error")).isEqualTo("Connection timeout");
    }
    
    @Test
    @DisplayName("测试服务状态枚举")
    void testServiceStatusEnum() {
        // 测试所有服务状态
        SystemStatus upStatus = new SystemStatus();
        upStatus.setServiceStatus(ServiceStatus.UP);
        assertThat(upStatus.getServiceStatus()).isEqualTo(ServiceStatus.UP);
        assertThat(upStatus.getServiceStatus().getCode()).isEqualTo("UP");
        assertThat(upStatus.getServiceStatus().getDescription()).isEqualTo("正常");
        
        SystemStatus downStatus = new SystemStatus();
        downStatus.setServiceStatus(ServiceStatus.DOWN);
        assertThat(downStatus.getServiceStatus()).isEqualTo(ServiceStatus.DOWN);
        assertThat(downStatus.getServiceStatus().getCode()).isEqualTo("DOWN");
        assertThat(downStatus.getServiceStatus().getDescription()).isEqualTo("异常");
        
        SystemStatus degradedStatus = new SystemStatus();
        degradedStatus.setServiceStatus(ServiceStatus.DEGRADED);
        assertThat(degradedStatus.getServiceStatus()).isEqualTo(ServiceStatus.DEGRADED);
        assertThat(degradedStatus.getServiceStatus().getCode()).isEqualTo("DEGRADED");
        assertThat(degradedStatus.getServiceStatus().getDescription()).isEqualTo("降级");
    }
    
    @Test
    @DisplayName("测试系统状态健康检查详情JSON处理")
    void testSystemStatusHealthDetailsJsonHandling() {
        // 准备测试数据
        SystemStatus status = new SystemStatus();
        
        // 测试复杂健康检查详情
        Map<String, Object> healthDetails = new HashMap<>();
        healthDetails.put("status", "UP");
        healthDetails.put("timestamp", System.currentTimeMillis());
        
        // 数据库健康信息
        Map<String, Object> dbHealth = new HashMap<>();
        dbHealth.put("status", "UP");
        dbHealth.put("database", "MySQL");
        dbHealth.put("version", "8.0.35");
        dbHealth.put("connectionPool", Map.of("active", 5, "idle", 10, "max", 20));
        healthDetails.put("db", dbHealth);
        
        // 磁盘空间信息
        Map<String, Object> diskSpace = new HashMap<>();
        diskSpace.put("status", "UP");
        diskSpace.put("total", 1000000000L);
        diskSpace.put("free", 800000000L);
        diskSpace.put("threshold", 10485760L);
        healthDetails.put("diskSpace", diskSpace);
        
        // Redis健康信息
        Map<String, Object> redisHealth = new HashMap<>();
        redisHealth.put("status", "UP");
        redisHealth.put("version", "7.2.3");
        redisHealth.put("memory", Map.of("used", "50MB", "max", "1GB"));
        healthDetails.put("redis", redisHealth);
        
        status.setHealthDetails(healthDetails);
        
        // 验证JSON字段设置
        assertThat(status.getHealthDetails()).isNotNull();
        assertThat(status.getHealthDetails().get("status")).isEqualTo("UP");
        assertThat(status.getHealthDetails().get("timestamp")).isNotNull();
        
        // 验证数据库健康信息
        @SuppressWarnings("unchecked")
        Map<String, Object> retrievedDbHealth = (Map<String, Object>) status.getHealthDetails().get("db");
        assertThat(retrievedDbHealth).isNotNull();
        assertThat(retrievedDbHealth.get("status")).isEqualTo("UP");
        assertThat(retrievedDbHealth.get("database")).isEqualTo("MySQL");
        assertThat(retrievedDbHealth.get("version")).isEqualTo("8.0.35");
        
        // 验证磁盘空间信息
        @SuppressWarnings("unchecked")
        Map<String, Object> retrievedDiskSpace = (Map<String, Object>) status.getHealthDetails().get("diskSpace");
        assertThat(retrievedDiskSpace).isNotNull();
        assertThat(retrievedDiskSpace.get("status")).isEqualTo("UP");
        assertThat(retrievedDiskSpace.get("total")).isEqualTo(1000000000L);
        assertThat(retrievedDiskSpace.get("free")).isEqualTo(800000000L);
        
        // 验证Redis健康信息
        @SuppressWarnings("unchecked")
        Map<String, Object> retrievedRedisHealth = (Map<String, Object>) status.getHealthDetails().get("redis");
        assertThat(retrievedRedisHealth).isNotNull();
        assertThat(retrievedRedisHealth.get("status")).isEqualTo("UP");
        assertThat(retrievedRedisHealth.get("version")).isEqualTo("7.2.3");
    }
}