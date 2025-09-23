package com.erp.user.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.user.entity.SystemConfig;
import com.erp.user.enums.ConfigType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 系统配置Mapper层测试
 * 测试BaseMapperPlus的增强方法和QueryWrapperUtils条件筛选性能
 * 
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("系统配置Mapper层测试")
class SystemConfigMapperTest {
    
    @Autowired
    private SystemConfigMapper systemConfigMapper;
    
    @Test
    @DisplayName("测试BaseMapperPlus基本CRUD操作")
    void testBaseMapperPlusCrud() {
        // 准备测试数据
        SystemConfig config = new SystemConfig();
        config.setCategory(ConfigType.SYSTEM);
        config.setConfigKey("test.config.key");
        
        config.setConfigValue("测试配置值");
        
        config.setValueType("json");
        config.setDescription("测试配置描述");
        config.setEditable(true);
        config.setEnabled(true);
        config.setSortOrder(1);
        
        // 测试插入
        int insertResult = systemConfigMapper.insert(config);
        assertThat(insertResult).isEqualTo(1);
        assertThat(config.getId()).isNotNull();
        
        // 测试根据ID查询
        SystemConfig savedConfig = systemConfigMapper.selectById(config.getId());
        assertThat(savedConfig).isNotNull();
        assertThat(savedConfig.getConfigKey()).isEqualTo("test.config.key");
        assertThat(savedConfig.getCategory()).isEqualTo(ConfigType.SYSTEM);
        assertThat(savedConfig.getConfigValue()).isEqualTo("测试配置值");
        
        // 测试更新
        savedConfig.setDescription("更新后的配置描述");
        int updateResult = systemConfigMapper.updateById(savedConfig);
        assertThat(updateResult).isEqualTo(1);
        
        // 验证更新结果
        SystemConfig updatedConfig = systemConfigMapper.selectById(config.getId());
        assertThat(updatedConfig.getDescription()).isEqualTo("更新后的配置描述");
        
        // 测试逻辑删除
        int deleteResult = systemConfigMapper.deleteById(config.getId());
        assertThat(deleteResult).isEqualTo(1);
        
        // 验证逻辑删除结果
        SystemConfig deletedConfig = systemConfigMapper.selectById(config.getId());
        assertThat(deletedConfig).isNull(); // 逻辑删除后查询不到
    }
    
    @Test
    @DisplayName("测试BaseMapperPlus增强查询方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 准备测试数据
        SystemConfig config1 = createTestConfig("test.config.1", ConfigType.SYSTEM, true);
        SystemConfig config2 = createTestConfig("test.config.2", ConfigType.BUSINESS, true);
        SystemConfig config3 = createTestConfig("test.config.3", ConfigType.SYSTEM, false);
        
        systemConfigMapper.insert(config1);
        systemConfigMapper.insert(config2);
        systemConfigMapper.insert(config3);
        
        // 测试selectCountByCondition方法
        LambdaQueryWrapper<SystemConfig> countWrapper = QueryWrapperUtils.lambdaQuery(SystemConfig.class);
        QueryWrapperUtils.eqIfPresent(countWrapper, SystemConfig::getCategory, ConfigType.SYSTEM);
        Long systemConfigCount = systemConfigMapper.selectCountByCondition(countWrapper);
        assertThat(systemConfigCount).isEqualTo(2L);
        
        // 测试existsByCondition方法
        LambdaQueryWrapper<SystemConfig> existsWrapper = QueryWrapperUtils.lambdaQuery(SystemConfig.class);
        QueryWrapperUtils.eqIfPresent(existsWrapper, SystemConfig::getConfigKey, "test.config.1");
        boolean exists = systemConfigMapper.existsByCondition(existsWrapper);
        assertThat(exists).isTrue();
        
        // 测试selectAllByCondition方法
        LambdaQueryWrapper<SystemConfig> listWrapper = QueryWrapperUtils.lambdaQuery(SystemConfig.class);
        QueryWrapperUtils.eqIfPresent(listWrapper, SystemConfig::getEnabled, true);
        QueryWrapperUtils.orderByDesc(listWrapper, SystemConfig::getCreateTime);
        List<SystemConfig> enabledConfigs = systemConfigMapper.selectAllByCondition(listWrapper);
        assertThat(enabledConfigs).hasSize(2);
        assertThat(enabledConfigs.get(0).getEnabled()).isTrue();
        
        // 清理测试数据
        systemConfigMapper.deleteById(config1.getId());
        systemConfigMapper.deleteById(config2.getId());
        systemConfigMapper.deleteById(config3.getId());
    }
    
    @Test
    @DisplayName("测试QueryWrapperUtils条件构建工具")
    void testQueryWrapperUtilsConditionBuilding() {
        // 准备测试数据
        SystemConfig config1 = createTestConfig("search.test.1", ConfigType.SYSTEM, true);
        SystemConfig config2 = createTestConfig("search.test.2", ConfigType.BUSINESS, true);
        SystemConfig config3 = createTestConfig("other.config", ConfigType.SECURITY, false);
        
        systemConfigMapper.insert(config1);
        systemConfigMapper.insert(config2);
        systemConfigMapper.insert(config3);
        
        // 测试likeIfPresent模糊查询
        LambdaQueryWrapper<SystemConfig> likeWrapper = QueryWrapperUtils.lambdaQuery(SystemConfig.class);
        QueryWrapperUtils.likeIfPresent(likeWrapper, SystemConfig::getConfigKey, "search.test");
        List<SystemConfig> searchResults = systemConfigMapper.selectAllByCondition(likeWrapper);
        assertThat(searchResults).hasSize(2);
        
        // 测试eqIfPresent等值查询
        LambdaQueryWrapper<SystemConfig> eqWrapper = QueryWrapperUtils.lambdaQuery(SystemConfig.class);
        QueryWrapperUtils.eqIfPresent(eqWrapper, SystemConfig::getCategory, ConfigType.BUSINESS);
        QueryWrapperUtils.eqIfPresent(eqWrapper, SystemConfig::getEnabled, true);
        List<SystemConfig> businessConfigs = systemConfigMapper.selectAllByCondition(eqWrapper);
        assertThat(businessConfigs).hasSize(1);
        assertThat(businessConfigs.get(0).getCategory()).isEqualTo(ConfigType.BUSINESS);
        
        // 测试复合条件查询
        LambdaQueryWrapper<SystemConfig> complexWrapper = QueryWrapperUtils.lambdaQuery(SystemConfig.class);
        QueryWrapperUtils.eqIfPresent(complexWrapper, SystemConfig::getEnabled, true);
        QueryWrapperUtils.likeIfPresent(complexWrapper, SystemConfig::getConfigKey, "test");
        QueryWrapperUtils.orderByAsc(complexWrapper, SystemConfig::getConfigKey);
        List<SystemConfig> complexResults = systemConfigMapper.selectAllByCondition(complexWrapper);
        assertThat(complexResults).hasSize(2);
        assertThat(complexResults.get(0).getConfigKey()).isEqualTo("search.test.1");
        
        // 清理测试数据
        systemConfigMapper.deleteById(config1.getId());
        systemConfigMapper.deleteById(config2.getId());
        systemConfigMapper.deleteById(config3.getId());
    }
    
    @Test
    @DisplayName("测试分页查询功能")
    void testPaginationQuery() {
        // 准备测试数据
        for (int i = 1; i <= 15; i++) {
            SystemConfig config = createTestConfig("page.test." + i, ConfigType.SYSTEM, true);
            systemConfigMapper.insert(config);
        }
        
        // 测试分页查询
        Page<SystemConfig> page = new Page<>(1, 10);
        LambdaQueryWrapper<SystemConfig> wrapper = QueryWrapperUtils.lambdaQuery(SystemConfig.class);
        QueryWrapperUtils.likeIfPresent(wrapper, SystemConfig::getConfigKey, "page.test");
        QueryWrapperUtils.orderByAsc(wrapper, SystemConfig::getConfigKey);
        
        IPage<SystemConfig> pageResult = systemConfigMapper.selectConfigPage(page, wrapper);
        
        assertThat(pageResult.getTotal()).isEqualTo(15L);
        assertThat(pageResult.getPages()).isEqualTo(2L);
        assertThat(pageResult.getCurrent()).isEqualTo(1L);
        assertThat(pageResult.getSize()).isEqualTo(10L);
        assertThat(pageResult.getRecords()).hasSize(10);
        
        // 测试第二页
        Page<SystemConfig> page2 = new Page<>(2, 10);
        IPage<SystemConfig> pageResult2 = systemConfigMapper.selectConfigPage(page2, wrapper);
        assertThat(pageResult2.getRecords()).hasSize(5);
        
        // 清理测试数据
        LambdaQueryWrapper<SystemConfig> deleteWrapper = QueryWrapperUtils.lambdaQuery(SystemConfig.class);
        QueryWrapperUtils.likeIfPresent(deleteWrapper, SystemConfig::getConfigKey, "page.test");
        systemConfigMapper.delete(deleteWrapper);
    }
    
    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 准备测试数据
        SystemConfig systemConfig = createTestConfig("custom.system.config", ConfigType.SYSTEM, true);
        SystemConfig businessConfig = createTestConfig("custom.business.config", ConfigType.BUSINESS, true);
        
        systemConfigMapper.insert(systemConfig);
        systemConfigMapper.insert(businessConfig);
        
        // 测试根据分类查询
        List<SystemConfig> systemConfigs = systemConfigMapper.selectByCategory(ConfigType.SYSTEM);
        assertThat(systemConfigs).isNotEmpty();
        assertThat(systemConfigs.stream().allMatch(config -> config.getCategory() == ConfigType.SYSTEM)).isTrue();
        
        // 测试根据配置键名查询
        SystemConfig foundConfig = systemConfigMapper.selectByConfigKey("custom.system.config");
        assertThat(foundConfig).isNotNull();
        assertThat(foundConfig.getConfigKey()).isEqualTo("custom.system.config");
        
        // 测试统计方法
        Long enabledCount = systemConfigMapper.countEnabledConfigs();
        assertThat(enabledCount).isGreaterThan(0L);
        
        Long systemCount = systemConfigMapper.countByCategory(ConfigType.SYSTEM);
        assertThat(systemCount).isGreaterThan(0L);
        
        // 测试分类统计
        List<Map<String, Object>> categoryStats = systemConfigMapper.selectCategoryStats();
        assertThat(categoryStats).isNotEmpty();
        
        // 清理测试数据
        systemConfigMapper.deleteById(systemConfig.getId());
        systemConfigMapper.deleteById(businessConfig.getId());
    }
    
    /**
     * 创建测试配置对象
     */
    private SystemConfig createTestConfig(String configKey, ConfigType category, boolean enabled) {
        SystemConfig config = new SystemConfig();
        config.setCategory(category);
        config.setConfigKey(configKey);
        
        config.setConfigValue("测试值-" + configKey);
        
        config.setValueType("json");
        config.setDescription("测试配置-" + configKey);
        config.setEditable(true);
        config.setEnabled(enabled);
        config.setSortOrder(1);
        
        return config;
    }
}