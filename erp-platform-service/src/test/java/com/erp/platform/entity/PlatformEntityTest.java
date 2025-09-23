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
 * 验证继承BaseEntity的字段和erp-common配置
 *
 * @author ERP System
 */
@DisplayName("平台实体类测试")
class PlatformEntityTest {

    @Test
    @DisplayName("测试Platform实体类基本属性")
    void testPlatformBasicProperties() {
        // 创建平台实体
        Platform platform = new Platform();
        platform.setPlatformName("测试平台");
        platform.setPlatformType(PlatformType.WALMART);
        platform.setPlatformCode("test-platform");
        platform.setDescription("这是一个测试平台");
        platform.setStatus(PlatformStatus.ACTIVE);
        platform.setOfficialUrl("https://test.example.com");
        platform.setApiBaseUrl("https://api.test.example.com");
        platform.setSupportedFeatures(Arrays.asList("product_upload", "order_sync"));
        
        // 设置配置模板
        Map<String, Object> configTemplate = new HashMap<>();
        configTemplate.put("apiKey", "");
        configTemplate.put("apiSecret", "");
        platform.setConfigTemplate(configTemplate);
        
        platform.setEnabled(true);
        platform.setSortOrder(1);
        platform.setLastUpdated(LocalDateTime.now());
        platform.setRemarks("测试备注");

        // 验证基本属性
        assertThat(platform.getPlatformName()).isEqualTo("测试平台");
        assertThat(platform.getPlatformType()).isEqualTo(PlatformType.WALMART);
        assertThat(platform.getPlatformCode()).isEqualTo("test-platform");
        assertThat(platform.getDescription()).isEqualTo("这是一个测试平台");
        assertThat(platform.getStatus()).isEqualTo(PlatformStatus.ACTIVE);
        assertThat(platform.getOfficialUrl()).isEqualTo("https://test.example.com");
        assertThat(platform.getApiBaseUrl()).isEqualTo("https://api.test.example.com");
        assertThat(platform.getSupportedFeatures()).containsExactly("product_upload", "order_sync");
        assertThat(platform.getConfigTemplate()).containsKeys("apiKey", "apiSecret");
        assertThat(platform.getEnabled()).isTrue();
        assertThat(platform.getSortOrder()).isEqualTo(1);
        assertThat(platform.getLastUpdated()).isNotNull();
        assertThat(platform.getRemarks()).isEqualTo("测试备注");
    }

    @Test
    @DisplayName("测试Platform继承BaseEntity的通用字段")
    void testPlatformBaseEntityFields() {
        // 创建平台实体
        Platform platform = new Platform();
        
        // 验证BaseEntity字段存在
        assertThat(platform.getId()).isNull(); // 新实体ID为空
        assertThat(platform.getCreateTime()).isNull(); // 创建时间由MyBatis Plus自动填充
        assertThat(platform.getUpdateTime()).isNull(); // 更新时间由MyBatis Plus自动填充
        assertThat(platform.getCreateBy()).isNull(); // 创建人由MyBatis Plus自动填充
        assertThat(platform.getUpdateBy()).isNull(); // 更新人由MyBatis Plus自动填充
        assertThat(platform.getDeleted()).isNull(); // 逻辑删除标志由MyBatis Plus自动填充
        assertThat(platform.getVersion()).isNull(); // 版本号由MyBatis Plus自动填充
        
        // 验证BaseEntity方法
        assertThat(platform.isNew()).isTrue(); // ID为空时为新实体
        assertThat(platform.isLogicallyDeleted()).isFalse(); // deleted为空时未删除
        assertThat(platform.getEntityDescription()).contains("Platform");
    }

    @Test
    @DisplayName("测试Platform业务方法")
    void testPlatformBusinessMethods() {
        // 创建平台实体
        Platform platform = new Platform();
        platform.setPlatformType(PlatformType.AMAZON);
        platform.setStatus(PlatformStatus.ACTIVE);
        platform.setEnabled(true);

        // 测试显示名称
        assertThat(platform.getDisplayName()).isEqualTo("亚马逊");

        // 测试可用性检查
        assertThat(platform.isAvailable()).isTrue();

        // 测试错误状态检查
        assertThat(platform.hasError()).isFalse();

        // 修改状态为错误
        platform.setStatus(PlatformStatus.ERROR);
        assertThat(platform.isAvailable()).isFalse();
        assertThat(platform.hasError()).isTrue();

        // 禁用平台
        platform.setEnabled(false);
        platform.setStatus(PlatformStatus.ACTIVE);
        assertThat(platform.isAvailable()).isFalse();
    }

    @Test
    @DisplayName("测试PlatformConfig实体类基本属性")
    void testPlatformConfigBasicProperties() {
        // 创建平台配置实体
        PlatformConfig config = new PlatformConfig();
        config.setPlatformId(1L);
        config.setConfigName("API密钥");
        config.setConfigKey("apiKey");
        config.setConfigValue("test-api-key");
        config.setConfigType(com.erp.platform.enums.ConfigType.STRING);
        config.setEncrypted(false);
        config.setRequired(true);
        config.setDescription("平台API访问密钥");
        config.setDefaultValue("");
        config.setValidationRule("^[a-zA-Z0-9]{10,50}$");
        config.setConfigGroup("auth");
        config.setSortOrder(1);
        config.setEnabled(true);
        config.setLastValidated(LocalDateTime.now());
        config.setValidationStatus(com.erp.platform.enums.ValidationStatus.VALID);

        // 验证基本属性
        assertThat(config.getPlatformId()).isEqualTo(1L);
        assertThat(config.getConfigName()).isEqualTo("API密钥");
        assertThat(config.getConfigKey()).isEqualTo("apiKey");
        assertThat(config.getConfigValue()).isEqualTo("test-api-key");
        assertThat(config.getConfigType()).isEqualTo(com.erp.platform.enums.ConfigType.STRING);
        assertThat(config.getEncrypted()).isFalse();
        assertThat(config.getRequired()).isTrue();
        assertThat(config.getDescription()).isEqualTo("平台API访问密钥");
        assertThat(config.getDefaultValue()).isEmpty();
        assertThat(config.getValidationRule()).isEqualTo("^[a-zA-Z0-9]{10,50}$");
        assertThat(config.getConfigGroup()).isEqualTo("auth");
        assertThat(config.getSortOrder()).isEqualTo(1);
        assertThat(config.getEnabled()).isTrue();
        assertThat(config.getLastValidated()).isNotNull();
        assertThat(config.getValidationStatus()).isEqualTo(com.erp.platform.enums.ValidationStatus.VALID);
    }

    @Test
    @DisplayName("测试PlatformConfig继承BaseEntity的通用字段")
    void testPlatformConfigBaseEntityFields() {
        // 创建平台配置实体
        PlatformConfig config = new PlatformConfig();
        
        // 验证BaseEntity字段存在
        assertThat(config.getId()).isNull(); // 新实体ID为空
        assertThat(config.getCreateTime()).isNull(); // 创建时间由MyBatis Plus自动填充
        assertThat(config.getUpdateTime()).isNull(); // 更新时间由MyBatis Plus自动填充
        assertThat(config.getCreateBy()).isNull(); // 创建人由MyBatis Plus自动填充
        assertThat(config.getUpdateBy()).isNull(); // 更新人由MyBatis Plus自动填充
        assertThat(config.getDeleted()).isNull(); // 逻辑删除标志由MyBatis Plus自动填充
        assertThat(config.getVersion()).isNull(); // 版本号由MyBatis Plus自动填充
        
        // 验证BaseEntity方法
        assertThat(config.isNew()).isTrue(); // ID为空时为新实体
        assertThat(config.isLogicallyDeleted()).isFalse(); // deleted为空时未删除
        assertThat(config.getEntityDescription()).contains("PlatformConfig");
    }

    @Test
    @DisplayName("测试PlatformConfig业务方法")
    void testPlatformConfigBusinessMethods() {
        // 创建平台配置实体
        PlatformConfig config = new PlatformConfig();
        config.setConfigValue("secret-value");
        config.setEncrypted(false);
        config.setRequired(true);
        config.setValidationStatus(com.erp.platform.enums.ValidationStatus.VALID);

        // 测试业务方法
        assertThat(config.isValid()).isTrue();
        assertThat(config.checkRequired()).isTrue();
        assertThat(config.checkEncrypted()).isFalse();
        assertThat(config.getDisplayValue()).isEqualTo("secret-value");

        // 测试加密字段显示
        config.setEncrypted(true);
        assertThat(config.checkEncrypted()).isTrue();
        assertThat(config.getDisplayValue()).isEqualTo("******");

        // 测试验证失败状态
        config.setValidationStatus(com.erp.platform.enums.ValidationStatus.INVALID);
        assertThat(config.isValid()).isFalse();

        // 测试非必填字段
        config.setRequired(false);
        assertThat(config.checkRequired()).isFalse();
    }

    @Test
    @DisplayName("测试枚举类型的@EnumValue注解")
    void testEnumValueAnnotation() {
        // 测试PlatformType枚举
        PlatformType walmartType = PlatformType.WALMART;
        assertThat(walmartType.getCode()).isEqualTo("walmart");
        assertThat(walmartType.getDisplayName()).isEqualTo("沃尔玛");

        // 测试PlatformStatus枚举
        PlatformStatus activeStatus = PlatformStatus.ACTIVE;
        assertThat(activeStatus.getCode()).isEqualTo("ACTIVE");
        assertThat(activeStatus.getDisplayName()).isEqualTo("激活");
        assertThat(activeStatus.isAvailable()).isTrue();

        // 测试ConfigType枚举
        com.erp.platform.enums.ConfigType stringType = com.erp.platform.enums.ConfigType.STRING;
        assertThat(stringType.getCode()).isEqualTo("STRING");
        assertThat(stringType.getDisplayName()).isEqualTo("字符串");

        // 测试ValidationStatus枚举
        com.erp.platform.enums.ValidationStatus validStatus = com.erp.platform.enums.ValidationStatus.VALID;
        assertThat(validStatus.getCode()).isEqualTo("VALID");
        assertThat(validStatus.getDisplayName()).isEqualTo("验证通过");
    }
}