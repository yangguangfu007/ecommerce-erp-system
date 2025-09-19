package com.erp.platform.entity;

import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 平台实体类单元测试
 * 验证继承BaseEntity的字段和功能
 *
 * @author ERP System
 */
@DisplayName("平台实体类测试")
class PlatformEntityTest {

    @Test
    @DisplayName("测试Platform实体类基本功能")
    void testPlatformEntity() {
        // 创建平台实体
        Platform platform = new Platform();
        platform.setPlatformName("沃尔玛市场");
        platform.setPlatformType(PlatformType.WALMART);
        platform.setPlatformCode("walmart");
        platform.setDescription("沃尔玛全球电商平台");
        platform.setStatus(PlatformStatus.ACTIVE);
        platform.setOfficialUrl("https://marketplace.walmart.com");
        platform.setApiBaseUrl("https://marketplace.walmartapis.com");
        
        // 设置JSON字段
        platform.setSupportedFeatures(Arrays.asList("product_upload", "order_sync", "inventory_sync"));
        Map<String, Object> configTemplate = new HashMap<>();
        configTemplate.put("clientId", "");
        configTemplate.put("clientSecret", "");
        configTemplate.put("environment", "sandbox");
        platform.setConfigTemplate(configTemplate);
        
        platform.setEnabled(true);
        platform.setSortOrder(1);
        platform.setLastUpdated(LocalDateTime.now());
        platform.setRemarks("测试平台");

        // 验证基本属性
        assertThat(platform.getPlatformName()).isEqualTo("沃尔玛市场");
        assertThat(platform.getPlatformType()).isEqualTo(PlatformType.WALMART);
        assertThat(platform.getPlatformCode()).isEqualTo("walmart");
        assertThat(platform.getStatus()).isEqualTo(PlatformStatus.ACTIVE);
        assertThat(platform.getEnabled()).isTrue();
        
        // 验证JSON字段
        assertThat(platform.getSupportedFeatures()).containsExactly("product_upload", "order_sync", "inventory_sync");
        assertThat(platform.getConfigTemplate()).containsKeys("clientId", "clientSecret", "environment");
        
        // 验证继承自BaseEntity的方法
        assertThat(platform.isNew()).isTrue(); // ID为空时是新实体
        assertThat(platform.isLogicallyDeleted()).isFalse(); // 默认未删除
        
        // 验证业务方法
        assertThat(platform.getDisplayName()).isEqualTo("沃尔玛");
        assertThat(platform.isAvailable()).isTrue();
        assertThat(platform.hasError()).isFalse();
        
        // 设置ID后验证
        platform.setId(1L);
        assertThat(platform.isNew()).isFalse();
        
        // 设置删除标志后验证
        platform.setDeleted(1);
        assertThat(platform.isLogicallyDeleted()).isTrue();
    }

    @Test
    @DisplayName("测试PlatformConfig实体类基本功能")
    void testPlatformConfigEntity() {
        // 创建平台配置实体
        PlatformConfig config = new PlatformConfig();
        config.setPlatformId(1L);
        config.setConfigName("客户端ID");
        config.setConfigKey("clientId");
        config.setConfigValue("test-client-id");
        config.setConfigType(com.erp.platform.enums.ConfigType.STRING);
        config.setEncrypted(false);
        config.setRequired(true);
        config.setDescription("沃尔玛API客户端ID");
        config.setConfigGroup("auth");
        config.setSortOrder(1);
        config.setEnabled(true);
        config.setValidationStatus(com.erp.platform.enums.ValidationStatus.VALID);

        // 验证基本属性
        assertThat(config.getPlatformId()).isEqualTo(1L);
        assertThat(config.getConfigName()).isEqualTo("客户端ID");
        assertThat(config.getConfigKey()).isEqualTo("clientId");
        assertThat(config.getConfigValue()).isEqualTo("test-client-id");
        assertThat(config.getConfigType()).isEqualTo(com.erp.platform.enums.ConfigType.STRING);
        assertThat(config.getRequired()).isTrue();
        
        // 验证业务方法
        assertThat(config.isValid()).isTrue();
        assertThat(config.checkRequired()).isTrue();
        assertThat(config.checkEncrypted()).isFalse();
        assertThat(config.getDisplayValue()).isEqualTo("test-client-id");
        
        // 测试加密字段的显示值
        config.setEncrypted(true);
        assertThat(config.checkEncrypted()).isTrue();
        assertThat(config.getDisplayValue()).isEqualTo("******");
        
        // 验证继承自BaseEntity的方法
        assertThat(config.isNew()).isTrue();
        assertThat(config.isLogicallyDeleted()).isFalse();
    }

    @Test
    @DisplayName("测试枚举类型功能")
    void testEnumTypes() {
        // 测试PlatformType枚举
        PlatformType walmartType = PlatformType.WALMART;
        assertThat(walmartType.getDisplayName()).isEqualTo("沃尔玛");
        assertThat(walmartType.getCode()).isEqualTo("walmart");
        assertThat(PlatformType.fromCode("walmart")).isEqualTo(PlatformType.WALMART);
        
        // 测试PlatformStatus枚举
        PlatformStatus activeStatus = PlatformStatus.ACTIVE;
        assertThat(activeStatus.getDisplayName()).isEqualTo("激活");
        assertThat(activeStatus.getCode()).isEqualTo("ACTIVE");
        assertThat(activeStatus.isAvailable()).isTrue();
        assertThat(activeStatus.isError()).isFalse();
        assertThat(PlatformStatus.fromCode("ACTIVE")).isEqualTo(PlatformStatus.ACTIVE);
        
        PlatformStatus errorStatus = PlatformStatus.ERROR;
        assertThat(errorStatus.isAvailable()).isFalse();
        assertThat(errorStatus.isError()).isTrue();
        
        // 测试ConfigType枚举
        com.erp.platform.enums.ConfigType stringType = com.erp.platform.enums.ConfigType.STRING;
        assertThat(stringType.getDisplayName()).isEqualTo("字符串");
        assertThat(stringType.getCode()).isEqualTo("STRING");
        assertThat(com.erp.platform.enums.ConfigType.fromCode("STRING")).isEqualTo(com.erp.platform.enums.ConfigType.STRING);
        
        // 测试ValidationStatus枚举
        com.erp.platform.enums.ValidationStatus validStatus = com.erp.platform.enums.ValidationStatus.VALID;
        assertThat(validStatus.getDisplayName()).isEqualTo("验证通过");
        assertThat(validStatus.getCode()).isEqualTo("VALID");
        assertThat(com.erp.platform.enums.ValidationStatus.fromCode("VALID")).isEqualTo(com.erp.platform.enums.ValidationStatus.VALID);
    }
}