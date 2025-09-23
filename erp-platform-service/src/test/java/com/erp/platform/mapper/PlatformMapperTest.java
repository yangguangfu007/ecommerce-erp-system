package com.erp.platform.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.platform.entity.Platform;
import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import org.junit.jupiter.api.BeforeEach;
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
 * 平台Mapper层单元测试
 * 使用Spring Boot测试上下文
 * 测试BaseMapperPlus的增强CRUD操作和QueryWrapperUtils工具方法
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("平台Mapper层测试")
class PlatformMapperTest {

    @Autowired
    private PlatformMapper platformMapper;

    private Platform testPlatform;

    @BeforeEach
    @DisplayName("准备测试数据")
    void setUp() {
        // 创建测试平台数据
        testPlatform = new Platform();
        testPlatform.setPlatformName("测试平台");
        testPlatform.setPlatformType(PlatformType.WALMART);
        testPlatform.setPlatformCode("test-platform");
        testPlatform.setDescription("这是一个测试平台");
        testPlatform.setStatus(PlatformStatus.ACTIVE);
        testPlatform.setOfficialUrl("https://test.example.com");
        testPlatform.setApiBaseUrl("https://api.test.example.com");
        testPlatform.setSupportedFeatures(Arrays.asList("product_upload", "order_sync"));
        
        Map<String, Object> configTemplate = new HashMap<>();
        configTemplate.put("apiKey", "");
        configTemplate.put("apiSecret", "");
        testPlatform.setConfigTemplate(configTemplate);
        
        testPlatform.setEnabled(true);
        testPlatform.setSortOrder(1);
        testPlatform.setLastUpdated(LocalDateTime.now());
        testPlatform.setRemarks("测试备注");
    }

    @Test
    @DisplayName("测试BaseMapperPlus的基本CRUD操作")
    void testBaseMapperPlusCrudOperations() {
        // 测试插入
        int insertResult = platformMapper.insert(testPlatform);
        assertThat(insertResult).isEqualTo(1);
        assertThat(testPlatform.getId()).isNotNull();

        // 测试根据ID查询
        Platform foundPlatform = platformMapper.selectById(testPlatform.getId());
        assertThat(foundPlatform).isNotNull();
        assertThat(foundPlatform.getPlatformName()).isEqualTo("测试平台");
        assertThat(foundPlatform.getPlatformType()).isEqualTo(PlatformType.WALMART);

        // 测试更新
        foundPlatform.setPlatformName("更新后的测试平台");
        foundPlatform.setDescription("更新后的描述");
        int updateResult = platformMapper.updateById(foundPlatform);
        assertThat(updateResult).isEqualTo(1);

        // 验证更新结果
        Platform updatedPlatform = platformMapper.selectById(testPlatform.getId());
        assertThat(updatedPlatform.getPlatformName()).isEqualTo("更新后的测试平台");
        assertThat(updatedPlatform.getDescription()).isEqualTo("更新后的描述");

        // 测试逻辑删除
        int deleteResult = platformMapper.deleteById(testPlatform.getId());
        assertThat(deleteResult).isEqualTo(1);

        // 验证逻辑删除结果（应该查询不到）
        Platform deletedPlatform = platformMapper.selectById(testPlatform.getId());
        assertThat(deletedPlatform).isNull();
    }

    @Test
    @DisplayName("测试BaseMapperPlus的增强查询方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 插入测试数据
        platformMapper.insert(testPlatform);

        // 测试existsByCondition方法
        LambdaQueryWrapper<Platform> existsWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(existsWrapper, Platform::getPlatformCode, "test-platform");
        boolean exists = platformMapper.existsByCondition(existsWrapper);
        assertThat(exists).isTrue();

        // 测试selectCountByCondition方法
        LambdaQueryWrapper<Platform> countWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(countWrapper, Platform::getPlatformType, PlatformType.WALMART);
        Long count = platformMapper.selectCountByCondition(countWrapper);
        assertThat(count).isEqualTo(1L);

        // 测试selectOneByCondition方法
        LambdaQueryWrapper<Platform> oneWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(oneWrapper, Platform::getPlatformCode, "test-platform");
        Platform foundPlatform = platformMapper.selectOneByCondition(oneWrapper);
        assertThat(foundPlatform).isNotNull();
        assertThat(foundPlatform.getPlatformName()).isEqualTo("测试平台");

        // 测试selectAllByCondition方法
        LambdaQueryWrapper<Platform> allWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(allWrapper, Platform::getEnabled, true);
        List<Platform> allPlatforms = platformMapper.selectAllByCondition(allWrapper);
        assertThat(allPlatforms).hasSize(1);
        assertThat(allPlatforms.get(0).getPlatformName()).isEqualTo("测试平台");
    }

    @Test
    @DisplayName("测试QueryWrapperUtils工具类方法")
    void testQueryWrapperUtilsMethods() {
        // 插入多个测试数据
        platformMapper.insert(testPlatform);

        Platform platform2 = new Platform();
        platform2.setPlatformName("亚马逊测试平台");
        platform2.setPlatformType(PlatformType.AMAZON);
        platform2.setPlatformCode("amazon-test");
        platform2.setStatus(PlatformStatus.INACTIVE);
        platform2.setEnabled(false);
        platform2.setSortOrder(2);
        platformMapper.insert(platform2);

        // 测试eqIfPresent方法
        LambdaQueryWrapper<Platform> eqWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(eqWrapper, Platform::getPlatformType, PlatformType.WALMART);
        List<Platform> walmartPlatforms = platformMapper.selectAllByCondition(eqWrapper);
        assertThat(walmartPlatforms).hasSize(1);
        assertThat(walmartPlatforms.get(0).getPlatformType()).isEqualTo(PlatformType.WALMART);

        // 测试likeIfPresent方法
        LambdaQueryWrapper<Platform> likeWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.likeIfPresent(likeWrapper, Platform::getPlatformName, "测试");
        List<Platform> testPlatforms = platformMapper.selectAllByCondition(likeWrapper);
        assertThat(testPlatforms).hasSize(2);

        // 测试inIfPresent方法
        LambdaQueryWrapper<Platform> inWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.inIfPresent(inWrapper, Platform::getPlatformType, 
            Arrays.asList(PlatformType.WALMART, PlatformType.AMAZON));
        List<Platform> inPlatforms = platformMapper.selectAllByCondition(inWrapper);
        assertThat(inPlatforms).hasSize(2);

        // 测试组合条件查询
        LambdaQueryWrapper<Platform> combinedWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(combinedWrapper, Platform::getEnabled, true);
        QueryWrapperUtils.eqIfPresent(combinedWrapper, Platform::getStatus, PlatformStatus.ACTIVE);
        List<Platform> activePlatforms = platformMapper.selectAllByCondition(combinedWrapper);
        assertThat(activePlatforms).hasSize(1);
        assertThat(activePlatforms.get(0).getPlatformName()).isEqualTo("测试平台");
    }

    @Test
    @DisplayName("测试分页查询功能")
    void testPaginationQuery() {
        // 插入多个测试数据
        for (int i = 1; i <= 15; i++) {
            Platform platform = new Platform();
            platform.setPlatformName("测试平台" + i);
            platform.setPlatformType(PlatformType.WALMART);
            platform.setPlatformCode("test-platform-" + i);
            platform.setStatus(PlatformStatus.ACTIVE);
            platform.setEnabled(true);
            platform.setSortOrder(i);
            platformMapper.insert(platform);
        }

        // 测试分页查询
        Page<Platform> page = new Page<>(1, 10); // 第1页，每页10条
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getEnabled, true);
        wrapper.orderByAsc(Platform::getSortOrder);

        IPage<Platform> result = platformMapper.selectPageByCondition(page, wrapper);
        
        assertThat(result.getTotal()).isEqualTo(15L);
        assertThat(result.getPages()).isEqualTo(2L);
        assertThat(result.getCurrent()).isEqualTo(1L);
        assertThat(result.getSize()).isEqualTo(10L);
        assertThat(result.getRecords()).hasSize(10);
        assertThat(result.getRecords().get(0).getPlatformName()).isEqualTo("测试平台1");
        assertThat(result.getRecords().get(9).getPlatformName()).isEqualTo("测试平台10");

        // 测试第2页
        Page<Platform> page2 = new Page<>(2, 10);
        IPage<Platform> result2 = platformMapper.selectPageByCondition(page2, wrapper);
        
        assertThat(result2.getTotal()).isEqualTo(15L);
        assertThat(result2.getCurrent()).isEqualTo(2L);
        assertThat(result2.getRecords()).hasSize(5);
        assertThat(result2.getRecords().get(0).getPlatformName()).isEqualTo("测试平台11");
        assertThat(result2.getRecords().get(4).getPlatformName()).isEqualTo("测试平台15");
    }

    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 插入测试数据
        platformMapper.insert(testPlatform);

        Platform platform2 = new Platform();
        platform2.setPlatformName("亚马逊平台");
        platform2.setPlatformType(PlatformType.AMAZON);
        platform2.setPlatformCode("amazon-platform");
        platform2.setStatus(PlatformStatus.INACTIVE);
        platform2.setEnabled(true);
        platform2.setSortOrder(2);
        platformMapper.insert(platform2);

        // 测试根据平台类型查询
        List<Platform> walmartPlatforms = platformMapper.selectByPlatformType(PlatformType.WALMART);
        assertThat(walmartPlatforms).hasSize(1);
        assertThat(walmartPlatforms.get(0).getPlatformName()).isEqualTo("测试平台");

        // 测试根据状态查询
        List<Platform> activePlatforms = platformMapper.selectByStatus(PlatformStatus.ACTIVE);
        assertThat(activePlatforms).hasSize(1);
        assertThat(activePlatforms.get(0).getStatus()).isEqualTo(PlatformStatus.ACTIVE);

        // 测试根据平台代码查询
        Platform foundPlatform = platformMapper.selectByPlatformCode("test-platform");
        assertThat(foundPlatform).isNotNull();
        assertThat(foundPlatform.getPlatformName()).isEqualTo("测试平台");

        // 测试查询启用的平台
        List<Platform> enabledPlatforms = platformMapper.selectEnabledPlatforms();
        assertThat(enabledPlatforms).hasSize(2);

        // 测试状态统计
        List<Map<String, Object>> statusStats = platformMapper.countByStatus();
        assertThat(statusStats).hasSize(2);

        // 测试获取最大排序顺序
        Integer maxSortOrder = platformMapper.selectMaxSortOrder();
        assertThat(maxSortOrder).isEqualTo(2);

        // 测试平台名称模糊查询
        List<Platform> searchResults = platformMapper.selectByPlatformNameLike("测试");
        assertThat(searchResults).hasSize(1);
        assertThat(searchResults.get(0).getPlatformName()).contains("测试");

        // 测试检查平台代码唯一性
        int count = platformMapper.countByPlatformCodeExcludeId("test-platform", 0L);
        assertThat(count).isEqualTo(1);

        count = platformMapper.countByPlatformCodeExcludeId("test-platform", testPlatform.getId());
        assertThat(count).isEqualTo(0);
    }

    @Test
    @DisplayName("测试批量操作")
    void testBatchOperations() {
        // 准备批量数据
        Platform platform1 = new Platform();
        platform1.setPlatformName("批量平台1");
        platform1.setPlatformType(PlatformType.WALMART);
        platform1.setPlatformCode("batch-platform-1");
        platform1.setStatus(PlatformStatus.ACTIVE);
        platform1.setEnabled(true);
        platform1.setSortOrder(1);

        Platform platform2 = new Platform();
        platform2.setPlatformName("批量平台2");
        platform2.setPlatformType(PlatformType.AMAZON);
        platform2.setPlatformCode("batch-platform-2");
        platform2.setStatus(PlatformStatus.ACTIVE);
        platform2.setEnabled(true);
        platform2.setSortOrder(2);

        // 测试批量插入
        List<Platform> platforms = Arrays.asList(platform1, platform2);
        for (Platform platform : platforms) {
            platformMapper.insert(platform);
        }

        // 验证批量插入结果
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.likeIfPresent(wrapper, Platform::getPlatformName, "批量");
        List<Platform> batchPlatforms = platformMapper.selectAllByCondition(wrapper);
        assertThat(batchPlatforms).hasSize(2);

        // 测试批量删除
        LambdaQueryWrapper<Platform> deleteWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.likeIfPresent(deleteWrapper, Platform::getPlatformName, "批量");
        int deleteCount = platformMapper.deleteByCondition(deleteWrapper);
        assertThat(deleteCount).isEqualTo(2);

        // 验证批量删除结果
        List<Platform> remainingPlatforms = platformMapper.selectAllByCondition(deleteWrapper);
        assertThat(remainingPlatforms).isEmpty();
    }
}