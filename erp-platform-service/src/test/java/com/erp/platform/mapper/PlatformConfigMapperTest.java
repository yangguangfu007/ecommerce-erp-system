package com.erp.platform.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.platform.entity.Platform;
import com.erp.platform.entity.PlatformConfig;
import com.erp.platform.enums.ConfigType;
import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import com.erp.platform.enums.ValidationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 平台配置Mapper层单元测试
 * 使用Spring Boot测试上下文
 * 测试BaseMapperPlus的增强CRUD操作和QueryWrapperUtils工具方法
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("平台配置Mapper层测试")
class PlatformConfigMapperTest {

    @Autowired
    private PlatformConfigMapper platformConfigMapper;

    @Autowired
    private PlatformMapper platformMapper;

    private Platform testPlatform;
    private PlatformConfig testConfig;

    @BeforeEach
    @DisplayName("准备测试数据")
    void setUp() {
        // 创建测试平台
        testPlatform = new Platform();
        testPlatform.setPlatformName("测试平台");
        testPlatform.setPlatformType(PlatformType.WALMART);
        testPlatform.setPlatformCode("test-platform");
        testPlatform.setStatus(PlatformStatus.ACTIVE);
        testPlatform.setEnabled(true);
        testPlatform.setSortOrder(1);
        platformMapper.insert(testPlatform);

        // 创建测试配置
        testConfig = new PlatformConfig();
        testConfig.setPlatformId(testPlatform.getId());
        testConfig.setConfigName("API密钥");
        testConfig.setConfigKey("apiKey");
        testConfig.setConfigValue("test-api-key-value");
        testConfig.setConfigType(ConfigType.STRING);
        testConfig.setEncrypted(false);
        testConfig.setRequired(true);
        testConfig.setDescription("平台API访问密钥");
        testConfig.setDefaultValue("");
        testConfig.setValidationRule("^[a-zA-Z0-9]{10,50}$");
        testConfig.setConfigGroup("auth");
        testConfig.setSortOrder(1);
        testConfig.setEnabled(true);
        testConfig.setValidationStatus(ValidationStatus.VALID);
    }

    @Test
    @DisplayName("测试BaseMapperPlus的基本CRUD操作")
    void testBaseMapperPlusCrudOperations() {
        // 测试插入
        int insertResult = platformConfigMapper.insert(testConfig);
        assertThat(insertResult).isEqualTo(1);
        assertThat(testConfig.getId()).isNotNull();

        // 测试根据ID查询
        PlatformConfig foundConfig = platformConfigMapper.selectById(testConfig.getId());
        assertThat(foundConfig).isNotNull();
        assertThat(foundConfig.getConfigName()).isEqualTo("API密钥");
        assertThat(foundConfig.getConfigKey()).isEqualTo("apiKey");
        assertThat(foundConfig.getConfigValue()).isEqualTo("test-api-key-value");

        // 测试更新
        foundConfig.setConfigValue("updated-api-key-value");
        foundConfig.setDescription("更新后的API密钥描述");
        int updateResult = platformConfigMapper.updateById(foundConfig);
        assertThat(updateResult).isEqualTo(1);

        // 验证更新结果
        PlatformConfig updatedConfig = platformConfigMapper.selectById(testConfig.getId());
        assertThat(updatedConfig.getConfigValue()).isEqualTo("updated-api-key-value");
        assertThat(updatedConfig.getDescription()).isEqualTo("更新后的API密钥描述");

        // 测试逻辑删除
        int deleteResult = platformConfigMapper.deleteById(testConfig.getId());
        assertThat(deleteResult).isEqualTo(1);

        // 验证逻辑删除结果（应该查询不到）
        PlatformConfig deletedConfig = platformConfigMapper.selectById(testConfig.getId());
        assertThat(deletedConfig).isNull();
    }

    @Test
    @DisplayName("测试BaseMapperPlus的增强查询方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 插入测试数据
        platformConfigMapper.insert(testConfig);

        // 测试existsByCondition方法
        LambdaQueryWrapper<PlatformConfig> existsWrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(existsWrapper, PlatformConfig::getConfigKey, "apiKey");
        boolean exists = platformConfigMapper.existsByCondition(existsWrapper);
        assertThat(exists).isTrue();

        // 测试selectCountByCondition方法
        LambdaQueryWrapper<PlatformConfig> countWrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(countWrapper, PlatformConfig::getPlatformId, testPlatform.getId());
        Long count = platformConfigMapper.selectCountByCondition(countWrapper);
        assertThat(count).isEqualTo(1L);

        // 测试selectOneByCondition方法
        LambdaQueryWrapper<PlatformConfig> oneWrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(oneWrapper, PlatformConfig::getConfigKey, "apiKey");
        PlatformConfig foundConfig = platformConfigMapper.selectOneByCondition(oneWrapper);
        assertThat(foundConfig).isNotNull();
        assertThat(foundConfig.getConfigName()).isEqualTo("API密钥");
    }

    @Test
    @DisplayName("测试QueryWrapperUtils工具类方法")
    void testQueryWrapperUtilsMethods() {
        // 插入多个测试配置
        platformConfigMapper.insert(testConfig);

        PlatformConfig config2 = new PlatformConfig();
        config2.setPlatformId(testPlatform.getId());
        config2.setConfigName("API密钥");
        config2.setConfigKey("apiSecret");
        config2.setConfigValue("test-secret-value");
        config2.setConfigType(ConfigType.PASSWORD);
        config2.setEncrypted(true);
        config2.setRequired(true);
        config2.setConfigGroup("auth");
        config2.setSortOrder(2);
        config2.setEnabled(true);
        config2.setValidationStatus(ValidationStatus.NOT_VALIDATED);
        platformConfigMapper.insert(config2);

        // 测试eqIfPresent方法
        LambdaQueryWrapper<PlatformConfig> eqWrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(eqWrapper, PlatformConfig::getConfigType, ConfigType.STRING);
        List<PlatformConfig> stringConfigs = platformConfigMapper.selectAllByCondition(eqWrapper);
        assertThat(stringConfigs).hasSize(1);
        assertThat(stringConfigs.get(0).getConfigType()).isEqualTo(ConfigType.STRING);

        // 测试likeIfPresent方法
        LambdaQueryWrapper<PlatformConfig> likeWrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.likeIfPresent(likeWrapper, PlatformConfig::getConfigName, "API");
        List<PlatformConfig> apiConfigs = platformConfigMapper.selectAllByCondition(likeWrapper);
        assertThat(apiConfigs).hasSize(2);

        // 测试组合条件查询
        LambdaQueryWrapper<PlatformConfig> combinedWrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(combinedWrapper, PlatformConfig::getRequired, true);
        QueryWrapperUtils.eqIfPresent(combinedWrapper, PlatformConfig::getConfigGroup, "auth");
        List<PlatformConfig> requiredAuthConfigs = platformConfigMapper.selectAllByCondition(combinedWrapper);
        assertThat(requiredAuthConfigs).hasSize(2);
    }

    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 插入多个测试配置
        platformConfigMapper.insert(testConfig);

        // 创建不同分组的配置
        PlatformConfig configConfig = new PlatformConfig();
        configConfig.setPlatformId(testPlatform.getId());
        configConfig.setConfigName("连接超时");
        configConfig.setConfigKey("connectTimeout");
        configConfig.setConfigValue("30000");
        configConfig.setConfigType(ConfigType.NUMBER);
        configConfig.setEncrypted(false);
        configConfig.setRequired(false);
        configConfig.setConfigGroup("config");
        configConfig.setSortOrder(1);
        configConfig.setEnabled(true);
        configConfig.setValidationStatus(ValidationStatus.VALID);
        platformConfigMapper.insert(configConfig);

        // 测试根据平台ID查询配置列表
        List<PlatformConfig> platformConfigs = platformConfigMapper.selectByPlatformId(testPlatform.getId());
        assertThat(platformConfigs).hasSize(2);

        // 测试根据平台ID和配置键查询
        PlatformConfig foundConfig = platformConfigMapper.selectByPlatformIdAndKey(testPlatform.getId(), "apiKey");
        assertThat(foundConfig).isNotNull();
        assertThat(foundConfig.getConfigName()).isEqualTo("API密钥");

        // 测试根据平台ID和配置分组查询
        List<PlatformConfig> authConfigs = platformConfigMapper.selectByPlatformIdAndGroup(testPlatform.getId(), "auth");
        assertThat(authConfigs).hasSize(1);
        assertThat(authConfigs.get(0).getConfigGroup()).isEqualTo("auth");

        // 测试查询必填配置
        List<PlatformConfig> requiredConfigs = platformConfigMapper.selectRequiredByPlatformId(testPlatform.getId());
        assertThat(requiredConfigs).hasSize(1);
        assertThat(requiredConfigs.get(0).getRequired()).isTrue();

        // 测试查询启用的配置
        List<PlatformConfig> enabledConfigs = platformConfigMapper.selectEnabledByPlatformId(testPlatform.getId());
        assertThat(enabledConfigs).hasSize(2);

        // 测试根据配置类型查询
        List<PlatformConfig> stringConfigs = platformConfigMapper.selectByPlatformIdAndType(testPlatform.getId(), ConfigType.STRING);
        assertThat(stringConfigs).hasSize(1);
        assertThat(stringConfigs.get(0).getConfigType()).isEqualTo(ConfigType.STRING);

        // 测试根据验证状态查询
        List<PlatformConfig> validConfigs = platformConfigMapper.selectByPlatformIdAndValidationStatus(testPlatform.getId(), ValidationStatus.VALID);
        assertThat(validConfigs).hasSize(2);

        // 测试配置统计
        List<Map<String, Object>> validationStats = platformConfigMapper.countByValidationStatus(testPlatform.getId());
        assertThat(validationStats).hasSize(1);

        // 测试获取最大排序顺序
        Integer maxSortOrder = platformConfigMapper.selectMaxSortOrderByGroup(testPlatform.getId(), "auth");
        assertThat(maxSortOrder).isEqualTo(1);

        // 测试配置名称模糊查询
        List<PlatformConfig> searchResults = platformConfigMapper.selectByPlatformIdAndNameLike(testPlatform.getId(), "API");
        assertThat(searchResults).hasSize(1);
        assertThat(searchResults.get(0).getConfigName()).contains("API");

        // 测试检查配置键唯一性
        int count = platformConfigMapper.countByPlatformIdAndKeyExcludeId(testPlatform.getId(), "apiKey", 0L);
        assertThat(count).isEqualTo(1);

        count = platformConfigMapper.countByPlatformIdAndKeyExcludeId(testPlatform.getId(), "apiKey", testConfig.getId());
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("测试批量更新验证状态")
    void testBatchUpdateValidationStatus() {
        // 插入多个测试配置
        platformConfigMapper.insert(testConfig);

        PlatformConfig config2 = new PlatformConfig();
        config2.setPlatformId(testPlatform.getId());
        config2.setConfigName("API密钥");
        config2.setConfigKey("apiSecret");
        config2.setConfigValue("test-secret");
        config2.setConfigType(ConfigType.PASSWORD);
        config2.setConfigGroup("auth");
        config2.setSortOrder(2);
        config2.setEnabled(true);
        config2.setValidationStatus(ValidationStatus.NOT_VALIDATED);
        platformConfigMapper.insert(config2);

        // 测试批量更新验证状态
        LocalDateTime now = LocalDateTime.now();
        int updateCount = platformConfigMapper.updateValidationStatusByPlatformId(
            testPlatform.getId(), 
            ValidationStatus.INVALID, 
            "验证失败", 
            now
        );
        assertThat(updateCount).isEqualTo(2);

        // 验证更新结果
        List<PlatformConfig> updatedConfigs = platformConfigMapper.selectByPlatformId(testPlatform.getId());
        assertThat(updatedConfigs).hasSize(2);
        for (PlatformConfig config : updatedConfigs) {
            assertThat(config.getValidationStatus()).isEqualTo(ValidationStatus.INVALID);
            assertThat(config.getValidationError()).isEqualTo("验证失败");
            assertThat(config.getLastValidated()).isNotNull();
        }
    }

    @Test
    @DisplayName("测试加密配置查询")
    void testEncryptedConfigQuery() {
        // 插入普通配置
        platformConfigMapper.insert(testConfig);

        // 插入加密配置
        PlatformConfig encryptedConfig = new PlatformConfig();
        encryptedConfig.setPlatformId(testPlatform.getId());
        encryptedConfig.setConfigName("API密钥");
        encryptedConfig.setConfigKey("apiSecret");
        encryptedConfig.setConfigValue("encrypted-secret-value");
        encryptedConfig.setConfigType(ConfigType.PASSWORD);
        encryptedConfig.setEncrypted(true);
        encryptedConfig.setRequired(true);
        encryptedConfig.setConfigGroup("auth");
        encryptedConfig.setSortOrder(2);
        encryptedConfig.setEnabled(true);
        platformConfigMapper.insert(encryptedConfig);

        // 测试查询加密配置
        List<PlatformConfig> encryptedConfigs = platformConfigMapper.selectEncryptedByPlatformId(testPlatform.getId());
        assertThat(encryptedConfigs).hasSize(1);
        assertThat(encryptedConfigs.get(0).getEncrypted()).isTrue();
        assertThat(encryptedConfigs.get(0).getConfigKey()).isEqualTo("apiSecret");
    }

    @Test
    @DisplayName("测试配置业务方法")
    void testConfigBusinessMethods() {
        // 设置加密配置
        testConfig.setEncrypted(true);
        testConfig.setConfigValue("secret-value");
        platformConfigMapper.insert(testConfig);

        PlatformConfig foundConfig = platformConfigMapper.selectById(testConfig.getId());
        
        // 测试业务方法
        assertThat(foundConfig.isValid()).isTrue();
        assertThat(foundConfig.checkRequired()).isTrue();
        assertThat(foundConfig.checkEncrypted()).isTrue();
        assertThat(foundConfig.getDisplayValue()).isEqualTo("******"); // 加密字段显示掩码

        // 测试非加密配置
        foundConfig.setEncrypted(false);
        assertThat(foundConfig.getDisplayValue()).isEqualTo("secret-value"); // 非加密字段显示原值
    }
}