package com.erp.user.entity;

import com.erp.user.enums.ConfigType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 系统配置实体类测试
 * 验证BaseEntity继承和JsonTypeHandler处理
 * 
 * @author ERP System
 */
@DisplayName("系统配置实体类测试")
class SystemConfigEntityTest {
    
    @Test
    @DisplayName("测试系统配置实体类基本属性")
    void testSystemConfigBasicProperties() {
        // 准备测试数据
        SystemConfig config = new SystemConfig();
        config.setId(1L);
        config.setCategory(ConfigType.SYSTEM);
        config.setConfigKey("system.name");
        
        config.setConfigValue("ERP管理系统");
        
        config.setValueType("json");
        config.setDescription("系统名称配置");
        config.setEditable(true);
        config.setEnabled(true);
        config.setSortOrder(1);
        
        // 设置BaseEntity字段
        config.setCreateTime(LocalDateTime.now());
        config.setUpdateTime(LocalDateTime.now());
        config.setCreateBy(1L);
        config.setUpdateBy(1L);
        config.setDeleted(0);
        config.setVersion(1);
        
        // 验证基本属性
        assertThat(config.getId()).isEqualTo(1L);
        assertThat(config.getCategory()).isEqualTo(ConfigType.SYSTEM);
        assertThat(config.getConfigKey()).isEqualTo("system.name");
        assertThat(config.getConfigValue()).isNotNull();
        assertThat(config.getConfigValue()).isEqualTo("ERP管理系统");
        assertThat(config.getValueType()).isEqualTo("json");
        assertThat(config.getDescription()).isEqualTo("系统名称配置");
        assertThat(config.getEditable()).isTrue();
        assertThat(config.getEnabled()).isTrue();
        assertThat(config.getSortOrder()).isEqualTo(1);
        
        // 验证BaseEntity继承的字段
        assertThat(config.getCreateTime()).isNotNull();
        assertThat(config.getUpdateTime()).isNotNull();
        assertThat(config.getCreateBy()).isEqualTo(1L);
        assertThat(config.getUpdateBy()).isEqualTo(1L);
        assertThat(config.getDeleted()).isEqualTo(0);
        assertThat(config.getVersion()).isEqualTo(1);
    }
    
    @Test
    @DisplayName("测试系统配置实体类继承BaseEntity的方法")
    void testSystemConfigBaseEntityMethods() {
        // 准备测试数据
        SystemConfig config = new SystemConfig();
        config.setConfigKey("test.config");
        config.setCategory(ConfigType.BUSINESS);
        
        // 测试新实体判断
        assertThat(config.isNew()).isTrue();
        
        // 设置ID后不再是新实体
        config.setId(1L);
        assertThat(config.isNew()).isFalse();
        
        // 测试逻辑删除判断
        config.setDeleted(0);
        assertThat(config.isLogicallyDeleted()).isFalse();
        
        config.setDeleted(1);
        assertThat(config.isLogicallyDeleted()).isTrue();
        
        // 测试实体描述
        String description = config.getEntityDescription();
        assertThat(description).contains("SystemConfig");
        assertThat(description).contains("test.config");
        assertThat(description).contains("BUSINESS");
    }
    
    @Test
    @DisplayName("测试系统配置JSON字段处理")
    void testSystemConfigJsonHandling() {
        // 准备测试数据
        SystemConfig config = new SystemConfig();
        
        // 测试复杂JSON配置
        String complexConfigJson = "{\"enabled\":true,\"maxRetries\":3,\"timeout\":5000,\"endpoints\":{\"primary\":\"http://api.example.com\",\"backup\":\"http://backup.example.com\"}}";
        
        config.setConfigValue(complexConfigJson);
        
        // 验证JSON字段设置
        assertThat(config.getConfigValue()).isNotNull();
        assertThat(config.getConfigValue()).isEqualTo(complexConfigJson);
    }
    
    @Test
    @DisplayName("测试配置类型枚举")
    void testConfigTypeEnum() {
        // 测试所有配置类型
        SystemConfig systemConfig = new SystemConfig();
        systemConfig.setCategory(ConfigType.SYSTEM);
        assertThat(systemConfig.getCategory()).isEqualTo(ConfigType.SYSTEM);
        assertThat(systemConfig.getCategory().getCode()).isEqualTo("SYSTEM");
        assertThat(systemConfig.getCategory().getDescription()).isEqualTo("系统配置");
        
        SystemConfig businessConfig = new SystemConfig();
        businessConfig.setCategory(ConfigType.BUSINESS);
        assertThat(businessConfig.getCategory()).isEqualTo(ConfigType.BUSINESS);
        assertThat(businessConfig.getCategory().getCode()).isEqualTo("BUSINESS");
        assertThat(businessConfig.getCategory().getDescription()).isEqualTo("业务配置");
        
        SystemConfig securityConfig = new SystemConfig();
        securityConfig.setCategory(ConfigType.SECURITY);
        assertThat(securityConfig.getCategory()).isEqualTo(ConfigType.SECURITY);
        assertThat(securityConfig.getCategory().getCode()).isEqualTo("SECURITY");
        assertThat(securityConfig.getCategory().getDescription()).isEqualTo("安全配置");
    }
}