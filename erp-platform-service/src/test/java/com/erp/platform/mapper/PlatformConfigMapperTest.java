package com.erp.platform.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.platform.entity.PlatformConfig;
import com.erp.platform.enums.ConfigType;
import com.erp.platform.enums.ValidationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 平台配置Mapper层单元测试
 * 使用H2内存数据库和@MybatisTest注解进行测试
 * 测试BaseMapperPlus的增强CRUD操作和QueryWrapperUtils工具方法
 *
 * @author ERP System
 */
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
@DisplayName("平台配置Mapper层测试")
class PlatformConfigMapperTest {

    @Autowired
    private PlatformConfigMapper platformConfigMapper;

    private static final Long TEST_PLATFORM_ID = 1L;
    private PlatformConfig apiKeyConfig;
    private PlatformConfig apiSecretConfig;
    private PlatformConfig endpointConfig;
    private PlatformConfig timeoutConfig;

    @BeforeEach
    @DisplayName("准备测试数据")
    void setUp() {
        // 清理测试数据 - 先查询所有记录，然后逐个删除
        // 注意：在测试环境中使用物理删除，生产环境应该使用逻辑删除
        List<PlatformConfig> existingConfigs = platformConfigMapper.selectList(null);
        for (PlatformConfig config : existingConfigs) {
            platformConfigMapper.deleteById(config.getId());
        }

        // 创建测试配置数据
        apiKeyConfig = createTestConfig("API密钥", "api_key", "test_api_key_123", 
                ConfigType.STRING, "认证", false, true, 1);
        apiSecretConfig = createTestConfig("API密钥", "api_secret", "test_secret_456", 
                ConfigType.PASSWORD, "认证", true, true, 2);
        endpointConfig = createTestConfig("API端点", "endpoint", "https://api.test.com", 
                ConfigType.URL, "连接", false, false, 1);
        timeoutConfig = createTestConfig("超时时间", "timeout", "30", 
                ConfigType.NUMBER, "连接", false, false, 2);

        // 插入测试数据
        platformConfigMapper.insert(apiKeyConfig);
        platformConfigMapper.insert(apiSecretConfig);
        platformConfigMapper.insert(endpointConfig);
        platformConfigMapper.insert(timeoutConfig);
    }

    @Test
    @DisplayName("测试BaseMapperPlus基础CRUD操作")
    void testBaseMapperPlusCrud() {
        // 测试selectById
        PlatformConfig found = platformConfigMapper.selectById(apiKeyConfig.getId());
        assertThat(found).isNotNull();
        assertThat(found.getConfigName()).isEqualTo("API密钥");

        // 测试selectList
        List<PlatformConfig> allConfigs = platformConfigMapper.selectList(null);
        assertThat(allConfigs).hasSize(4);

        // 测试updateById
        apiKeyConfig.setConfigValue("updated_api_key");
        int updateResult = platformConfigMapper.updateById(apiKeyConfig);
        assertThat(updateResult).isEqualTo(1);

        PlatformConfig updated = platformConfigMapper.selectById(apiKeyConfig.getId());
        assertThat(updated.getConfigValue()).isEqualTo("updated_api_key");

        // 测试deleteById
        int deleteResult = platformConfigMapper.deleteById(timeoutConfig.getId());
        assertThat(deleteResult).isEqualTo(1);

        List<PlatformConfig> remainingConfigs = platformConfigMapper.selectList(null);
        assertThat(remainingConfigs).hasSize(3);
    }

    @Test
    @DisplayName("测试BaseMapperPlus增强方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 测试existsByCondition
        LambdaQueryWrapper<PlatformConfig> wrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(wrapper, PlatformConfig::getConfigKey, "api_key");
        
        boolean exists = platformConfigMapper.existsByCondition(wrapper);
        assertThat(exists).isTrue();

        // 测试selectCountByCondition
        LambdaQueryWrapper<PlatformConfig> countWrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(countWrapper, PlatformConfig::getRequired, true);
        
        Long count = platformConfigMapper.selectCountByCondition(countWrapper);
        assertThat(count).isEqualTo(2L); // api_key和api_secret都是必填

        // 测试selectOneByCondition
        LambdaQueryWrapper<PlatformConfig> oneWrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(oneWrapper, PlatformConfig::getConfigType, ConfigType.URL);
        
        PlatformConfig config = platformConfigMapper.selectOneByCondition(oneWrapper);
        assertThat(config).isNotNull();
        assertThat(config.getConfigKey()).isEqualTo("endpoint");

        // 测试selectAllByCondition
        LambdaQueryWrapper<PlatformConfig> allWrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(allWrapper, PlatformConfig::getConfigGroup, "认证");
        QueryWrapperUtils.orderByAsc(allWrapper, PlatformConfig::getSortOrder);
        
        List<PlatformConfig> authConfigs = platformConfigMapper.selectAllByCondition(allWrapper);
        assertThat(authConfigs).hasSize(2);
        assertThat(authConfigs.get(0).getSortOrder()).isLessThan(authConfigs.get(1).getSortOrder());
    }

    @Test
    @DisplayName("测试QueryWrapperUtils工具方法")
    void testQueryWrapperUtils() {
        // 测试eqIfPresent
        LambdaQueryWrapper<PlatformConfig> wrapper1 = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(wrapper1, PlatformConfig::getPlatformId, TEST_PLATFORM_ID);
        QueryWrapperUtils.eqIfPresent(wrapper1, PlatformConfig::getConfigType, ConfigType.PASSWORD);
        
        List<PlatformConfig> result1 = platformConfigMapper.selectAllByCondition(wrapper1);
        assertThat(result1).hasSize(1);
        assertThat(result1.get(0).getConfigType()).isEqualTo(ConfigType.PASSWORD);

        // 测试likeIfPresent
        LambdaQueryWrapper<PlatformConfig> wrapper2 = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.likeIfPresent(wrapper2, PlatformConfig::getConfigName, "API");
        
        List<PlatformConfig> result2 = platformConfigMapper.selectAllByCondition(wrapper2);
        assertThat(result2).hasSize(3); // API密钥、API密钥、API端点

        // 测试geIfPresent和leIfPresent
        LambdaQueryWrapper<PlatformConfig> wrapper3 = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.geIfPresent(wrapper3, PlatformConfig::getSortOrder, 1);
        QueryWrapperUtils.leIfPresent(wrapper3, PlatformConfig::getSortOrder, 2);
        
        List<PlatformConfig> result3 = platformConfigMapper.selectAllByCondition(wrapper3);
        assertThat(result3).hasSize(4); // 所有配置的排序都在1-2之间

        // 测试orderByDesc
        LambdaQueryWrapper<PlatformConfig> wrapper4 = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(wrapper4, PlatformConfig::getConfigGroup, "连接");
        QueryWrapperUtils.orderByDesc(wrapper4, PlatformConfig::getSortOrder);
        
        List<PlatformConfig> result4 = platformConfigMapper.selectAllByCondition(wrapper4);
        assertThat(result4).hasSize(2);
        assertThat(result4.get(0).getSortOrder()).isGreaterThan(result4.get(1).getSortOrder());
    }

    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 测试根据平台ID查询配置列表
        List<PlatformConfig> configs = platformConfigMapper.selectByPlatformId(TEST_PLATFORM_ID);
        assertThat(configs).hasSize(4);

        // 测试根据平台ID和配置键查询
        PlatformConfig config = platformConfigMapper.selectByPlatformIdAndKey(TEST_PLATFORM_ID, "api_key");
        assertThat(config).isNotNull();
        assertThat(config.getConfigKey()).isEqualTo("api_key");

        // 测试根据平台ID和配置分组查询
        List<PlatformConfig> authConfigs = platformConfigMapper.selectByPlatformIdAndGroup(TEST_PLATFORM_ID, "认证");
        assertThat(authConfigs).hasSize(2);
        assertThat(authConfigs).allMatch(c -> "认证".equals(c.getConfigGroup()));

        // 测试查询必填配置
        List<PlatformConfig> requiredConfigs = platformConfigMapper.selectRequiredByPlatformId(TEST_PLATFORM_ID);
        assertThat(requiredConfigs).hasSize(2);
        assertThat(requiredConfigs).allMatch(PlatformConfig::getRequired);

        // 测试查询启用的配置
        List<PlatformConfig> enabledConfigs = platformConfigMapper.selectEnabledByPlatformId(TEST_PLATFORM_ID);
        assertThat(enabledConfigs).hasSize(4);
        assertThat(enabledConfigs).allMatch(PlatformConfig::getEnabled);

        // 测试根据配置类型查询
        List<PlatformConfig> stringConfigs = platformConfigMapper.selectByPlatformIdAndType(TEST_PLATFORM_ID, ConfigType.STRING);
        assertThat(stringConfigs).hasSize(1);
        assertThat(stringConfigs.get(0).getConfigType()).isEqualTo(ConfigType.STRING);

        // 测试根据验证状态查询
        List<PlatformConfig> notValidatedConfigs = platformConfigMapper.selectByPlatformIdAndValidationStatus(
                TEST_PLATFORM_ID, ValidationStatus.NOT_VALIDATED);
        assertThat(notValidatedConfigs).hasSize(4); // 所有配置都是未验证状态

        // 测试验证状态统计
        List<Map<String, Object>> statusCount = platformConfigMapper.countByValidationStatus(TEST_PLATFORM_ID);
        assertThat(statusCount).hasSize(1); // 只有一种状态：NOT_VALIDATED
        
        Map<String, Object> statusInfo = statusCount.get(0);
        assertThat(statusInfo.get("validation_status")).isEqualTo("NOT_VALIDATED");
        assertThat(statusInfo.get("count")).isEqualTo(4L);

        // 测试检查配置键唯一性
        int count = platformConfigMapper.countByPlatformIdAndKeyExcludeId(TEST_PLATFORM_ID, "api_key", 999L);
        assertThat(count).isEqualTo(1);

        // 测试获取分组最大排序顺序
        Integer maxSortOrder = platformConfigMapper.selectMaxSortOrderByGroup(TEST_PLATFORM_ID, "认证");
        assertThat(maxSortOrder).isEqualTo(2);

        // 测试查询加密配置
        List<PlatformConfig> encryptedConfigs = platformConfigMapper.selectEncryptedByPlatformId(TEST_PLATFORM_ID);
        assertThat(encryptedConfigs).hasSize(1);
        assertThat(encryptedConfigs.get(0).getConfigKey()).isEqualTo("api_secret");

        // 测试配置名称模糊查询
        List<PlatformConfig> searchResult = platformConfigMapper.selectByPlatformIdAndNameLike(TEST_PLATFORM_ID, "API");
        assertThat(searchResult).hasSize(3);
    }

    @Test
    @DisplayName("测试批量更新验证状态")
    void testBatchUpdateValidationStatus() {
        // 执行批量更新
        LocalDateTime now = LocalDateTime.now();
        int updateCount = platformConfigMapper.updateValidationStatusByPlatformId(
                TEST_PLATFORM_ID, ValidationStatus.VALID, null, now);
        
        assertThat(updateCount).isEqualTo(4);

        // 验证更新结果
        List<PlatformConfig> validConfigs = platformConfigMapper.selectByPlatformIdAndValidationStatus(
                TEST_PLATFORM_ID, ValidationStatus.VALID);
        assertThat(validConfigs).hasSize(4);
        assertThat(validConfigs).allMatch(c -> c.getValidationStatus() == ValidationStatus.VALID);
    }

    @Test
    @DisplayName("测试复杂查询条件组合")
    void testComplexQueryConditions() {
        // 测试多条件组合查询
        LambdaQueryWrapper<PlatformConfig> wrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(wrapper, PlatformConfig::getPlatformId, TEST_PLATFORM_ID);
        QueryWrapperUtils.eqIfPresent(wrapper, PlatformConfig::getEnabled, true);
        QueryWrapperUtils.eqIfPresent(wrapper, PlatformConfig::getRequired, true);
        QueryWrapperUtils.orderByAsc(wrapper, PlatformConfig::getConfigGroup);
        QueryWrapperUtils.orderByAsc(wrapper, PlatformConfig::getSortOrder);
        
        List<PlatformConfig> result = platformConfigMapper.selectAllByCondition(wrapper);
        assertThat(result).hasSize(2);
        assertThat(result).allMatch(c -> c.getEnabled() && c.getRequired());

        // 测试分组查询 - 使用简单的分组条件查询替代GROUP BY
        LambdaQueryWrapper<PlatformConfig> groupWrapper = QueryWrapperUtils.lambdaQuery(PlatformConfig.class);
        QueryWrapperUtils.eqIfPresent(groupWrapper, PlatformConfig::getPlatformId, TEST_PLATFORM_ID);
        QueryWrapperUtils.eqIfPresent(groupWrapper, PlatformConfig::getConfigGroup, "认证");
        
        List<PlatformConfig> groupResult = platformConfigMapper.selectAllByCondition(groupWrapper);
        assertThat(groupResult).hasSize(2); // 认证分组有2个配置
    }

    @Test
    @DisplayName("测试逻辑删除功能")
    void testLogicalDelete() {
        // 获取删除前的记录数
        Long beforeCount = platformConfigMapper.selectCountByCondition(
                QueryWrapperUtils.lambdaQuery(PlatformConfig.class));
        assertThat(beforeCount).isEqualTo(4L);

        // 执行逻辑删除 - 删除timeout配置避免唯一约束冲突
        int deleteResult = platformConfigMapper.deleteById(timeoutConfig.getId());
        assertThat(deleteResult).isEqualTo(1);

        // 验证逻辑删除后记录数减少
        Long afterCount = platformConfigMapper.selectCountByCondition(
                QueryWrapperUtils.lambdaQuery(PlatformConfig.class));
        assertThat(afterCount).isEqualTo(3L);

        // 验证被删除的记录无法通过正常查询获取
        PlatformConfig deletedConfig = platformConfigMapper.selectById(timeoutConfig.getId());
        assertThat(deletedConfig).isNull();

        // 验证通过平台ID查询时也不包含被删除的记录
        List<PlatformConfig> configs = platformConfigMapper.selectByPlatformId(TEST_PLATFORM_ID);
        assertThat(configs).hasSize(3);
        assertThat(configs).noneMatch(c -> c.getId().equals(timeoutConfig.getId()));
    }

    /**
     * 创建测试配置对象
     *
     * @param name 配置名称
     * @param key 配置键
     * @param value 配置值
     * @param type 配置类型
     * @param group 配置分组
     * @param encrypted 是否加密
     * @param required 是否必填
     * @param sortOrder 排序顺序
     * @return 配置对象
     */
    private PlatformConfig createTestConfig(String name, String key, String value, 
                                          ConfigType type, String group, boolean encrypted, 
                                          boolean required, int sortOrder) {
        PlatformConfig config = new PlatformConfig();
        config.setPlatformId(TEST_PLATFORM_ID);
        config.setConfigName(name);
        config.setConfigKey(key);
        config.setConfigValue(value);
        config.setConfigType(type);
        config.setEncrypted(encrypted);
        config.setRequired(required);
        config.setDescription(name + "的配置描述");
        config.setDefaultValue(encrypted ? null : value);
        config.setConfigGroup(group);
        config.setSortOrder(sortOrder);
        config.setEnabled(true);
        config.setValidationStatus(ValidationStatus.NOT_VALIDATED);
        return config;
    }
}