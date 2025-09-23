package com.erp.platform.mapper;

import com.erp.platform.entity.Platform;
import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 平台Mapper层集成测试
 * 使用真实的MySQL数据库连接
 * 验证BaseMapperPlus的增强CRUD操作和自定义查询方法
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("平台Mapper层集成测试")
class PlatformMapperIntegrationTest {

    @Autowired
    private PlatformMapper platformMapper;

    @Test
    @DisplayName("测试基本CRUD操作和BaseEntity字段")
    void testBasicCrudOperationsWithBaseEntity() {
        // 创建测试平台
        Platform platform = new Platform();
        platform.setPlatformName("集成测试平台");
        platform.setPlatformType(PlatformType.WALMART);
        platform.setPlatformCode("integration-test-platform");
        platform.setDescription("这是一个集成测试平台");
        platform.setStatus(PlatformStatus.ACTIVE);
        platform.setOfficialUrl("https://test.example.com");
        platform.setApiBaseUrl("https://api.test.example.com");
        platform.setSupportedFeatures(Arrays.asList("product_upload", "order_sync"));
        
        Map<String, Object> configTemplate = new HashMap<>();
        configTemplate.put("apiKey", "");
        configTemplate.put("apiSecret", "");
        platform.setConfigTemplate(configTemplate);
        
        platform.setEnabled(true);
        platform.setSortOrder(1);
        platform.setLastUpdated(LocalDateTime.now());
        platform.setRemarks("集成测试备注");

        // 测试插入
        int insertResult = platformMapper.insert(platform);
        assertThat(insertResult).isEqualTo(1);
        assertThat(platform.getId()).isNotNull();

        // 验证BaseEntity字段自动填充
        Platform insertedPlatform = platformMapper.selectById(platform.getId());
        assertThat(insertedPlatform).isNotNull();
        assertThat(insertedPlatform.getCreateTime()).isNotNull(); // 自动填充
        assertThat(insertedPlatform.getUpdateTime()).isNotNull(); // 自动填充
        assertThat(insertedPlatform.getDeleted()).isEqualTo(0); // 默认值
        assertThat(insertedPlatform.getVersion()).isEqualTo(1); // 默认值

        // 测试更新
        insertedPlatform.setPlatformName("更新后的集成测试平台");
        insertedPlatform.setDescription("更新后的描述");
        int updateResult = platformMapper.updateById(insertedPlatform);
        assertThat(updateResult).isEqualTo(1);

        // 验证更新结果和版本号变化
        Platform updatedPlatform = platformMapper.selectById(platform.getId());
        assertThat(updatedPlatform.getPlatformName()).isEqualTo("更新后的集成测试平台");
        assertThat(updatedPlatform.getDescription()).isEqualTo("更新后的描述");
        assertThat(updatedPlatform.getVersion()).isEqualTo(2); // 乐观锁版本号增加

        // 测试逻辑删除
        int deleteResult = platformMapper.deleteById(platform.getId());
        assertThat(deleteResult).isEqualTo(1);

        // 验证逻辑删除结果（应该查询不到）
        Platform deletedPlatform = platformMapper.selectById(platform.getId());
        assertThat(deletedPlatform).isNull(); // 逻辑删除后查询不到
    }

    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 插入测试数据
        Platform platform1 = createTestPlatform("沃尔玛测试平台", PlatformType.WALMART, "walmart-test", PlatformStatus.ACTIVE, true, 1);
        Platform platform2 = createTestPlatform("亚马逊测试平台", PlatformType.AMAZON, "amazon-test", PlatformStatus.INACTIVE, true, 2);
        Platform platform3 = createTestPlatform("eBay测试平台", PlatformType.EBAY, "ebay-test", PlatformStatus.ACTIVE, false, 3);
        
        platformMapper.insert(platform1);
        platformMapper.insert(platform2);
        platformMapper.insert(platform3);

        // 测试根据平台类型查询
        List<Platform> walmartPlatforms = platformMapper.selectByPlatformType(PlatformType.WALMART);
        assertThat(walmartPlatforms).hasSize(1);
        assertThat(walmartPlatforms.get(0).getPlatformName()).isEqualTo("沃尔玛测试平台");

        // 测试根据状态查询
        List<Platform> activePlatforms = platformMapper.selectByStatus(PlatformStatus.ACTIVE);
        assertThat(activePlatforms).hasSize(2);

        // 测试根据平台代码查询
        Platform foundPlatform = platformMapper.selectByPlatformCode("walmart-test");
        assertThat(foundPlatform).isNotNull();
        assertThat(foundPlatform.getPlatformName()).isEqualTo("沃尔玛测试平台");

        // 测试查询启用的平台
        List<Platform> enabledPlatforms = platformMapper.selectEnabledPlatforms();
        assertThat(enabledPlatforms).hasSize(2);

        // 测试状态统计
        List<Map<String, Object>> statusStats = platformMapper.countByStatus();
        assertThat(statusStats).isNotEmpty();

        // 测试获取最大排序顺序
        Integer maxSortOrder = platformMapper.selectMaxSortOrder();
        assertThat(maxSortOrder).isEqualTo(3);

        // 测试平台名称模糊查询
        List<Platform> searchResults = platformMapper.selectByPlatformNameLike("测试");
        assertThat(searchResults).hasSize(3);

        // 测试检查平台代码唯一性
        int count = platformMapper.countByPlatformCodeExcludeId("walmart-test", 0L);
        assertThat(count).isEqualTo(1);

        count = platformMapper.countByPlatformCodeExcludeId("walmart-test", platform1.getId());
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("测试JSON字段处理")
    void testJsonFieldHandling() {
        // 创建包含JSON字段的平台
        Platform platform = new Platform();
        platform.setPlatformName("JSON测试平台");
        platform.setPlatformType(PlatformType.WALMART);
        platform.setPlatformCode("json-test-platform");
        platform.setStatus(PlatformStatus.ACTIVE);
        platform.setEnabled(true);
        platform.setSortOrder(1);

        // 设置支持的功能列表（JSON数组）
        platform.setSupportedFeatures(Arrays.asList("product_upload", "order_sync", "inventory_sync", "price_update"));

        // 设置配置模板（JSON对象）
        Map<String, Object> configTemplate = new HashMap<>();
        configTemplate.put("clientId", "");
        configTemplate.put("clientSecret", "");
        configTemplate.put("environment", "sandbox");
        configTemplate.put("timeout", 30000);
        configTemplate.put("retryCount", 3);
        platform.setConfigTemplate(configTemplate);

        // 插入数据
        platformMapper.insert(platform);

        // 查询并验证JSON字段
        Platform foundPlatform = platformMapper.selectById(platform.getId());
        assertThat(foundPlatform).isNotNull();
        
        // 验证JSON数组字段
        assertThat(foundPlatform.getSupportedFeatures()).hasSize(4);
        assertThat(foundPlatform.getSupportedFeatures()).containsExactly("product_upload", "order_sync", "inventory_sync", "price_update");

        // 验证JSON对象字段
        assertThat(foundPlatform.getConfigTemplate()).hasSize(5);
        assertThat(foundPlatform.getConfigTemplate()).containsKeys("clientId", "clientSecret", "environment", "timeout", "retryCount");
        assertThat(foundPlatform.getConfigTemplate().get("environment")).isEqualTo("sandbox");
        assertThat(foundPlatform.getConfigTemplate().get("timeout")).isEqualTo(30000);
        assertThat(foundPlatform.getConfigTemplate().get("retryCount")).isEqualTo(3);
    }

    /**
     * 创建测试平台的辅助方法
     */
    private Platform createTestPlatform(String name, PlatformType type, String code, PlatformStatus status, boolean enabled, int sortOrder) {
        Platform platform = new Platform();
        platform.setPlatformName(name);
        platform.setPlatformType(type);
        platform.setPlatformCode(code);
        platform.setStatus(status);
        platform.setEnabled(enabled);
        platform.setSortOrder(sortOrder);
        platform.setDescription("测试平台描述");
        platform.setOfficialUrl("https://test.example.com");
        platform.setApiBaseUrl("https://api.test.example.com");
        platform.setSupportedFeatures(Arrays.asList("product_upload", "order_sync"));
        
        Map<String, Object> configTemplate = new HashMap<>();
        configTemplate.put("apiKey", "");
        configTemplate.put("apiSecret", "");
        platform.setConfigTemplate(configTemplate);
        
        platform.setLastUpdated(LocalDateTime.now());
        platform.setRemarks("测试备注");
        
        return platform;
    }
}