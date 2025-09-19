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
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 平台Mapper层单元测试
 * 使用H2内存数据库和@MybatisTest注解进行测试
 * 测试BaseMapperPlus的增强CRUD操作和QueryWrapperUtils工具方法
 *
 * @author ERP System
 */
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
@DisplayName("平台Mapper层测试")
class PlatformMapperTest {

    @Autowired
    private PlatformMapper platformMapper;

    private Platform testPlatform1;
    private Platform testPlatform2;
    private Platform testPlatform3;

    @BeforeEach
    @DisplayName("准备测试数据")
    void setUp() {
        // 清理测试数据 - 使用条件删除避免全表删除
        LambdaQueryWrapper<Platform> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.isNotNull(Platform::getId); // 添加条件避免全表删除
        platformMapper.delete(deleteWrapper);

        // 创建测试平台数据
        testPlatform1 = createTestPlatform("沃尔玛测试平台", PlatformType.WALMART, "walmart_test", PlatformStatus.ACTIVE, true, 1);
        testPlatform2 = createTestPlatform("亚马逊测试平台", PlatformType.AMAZON, "amazon_test", PlatformStatus.INACTIVE, true, 2);
        testPlatform3 = createTestPlatform("eBay测试平台", PlatformType.EBAY, "ebay_test", PlatformStatus.ERROR, false, 3);

        // 插入测试数据
        platformMapper.insert(testPlatform1);
        platformMapper.insert(testPlatform2);
        platformMapper.insert(testPlatform3);
    }

    @Test
    @DisplayName("测试BaseMapperPlus基础CRUD操作")
    void testBaseMapperPlusCrud() {
        // 测试selectById
        Platform found = platformMapper.selectById(testPlatform1.getId());
        assertThat(found).isNotNull();
        assertThat(found.getPlatformName()).isEqualTo("沃尔玛测试平台");

        // 测试selectList
        List<Platform> allPlatforms = platformMapper.selectList(null);
        assertThat(allPlatforms).hasSize(3);

        // 测试updateById
        testPlatform1.setPlatformName("更新后的沃尔玛平台");
        int updateResult = platformMapper.updateById(testPlatform1);
        assertThat(updateResult).isEqualTo(1);

        Platform updated = platformMapper.selectById(testPlatform1.getId());
        assertThat(updated.getPlatformName()).isEqualTo("更新后的沃尔玛平台");

        // 测试deleteById
        int deleteResult = platformMapper.deleteById(testPlatform3.getId());
        assertThat(deleteResult).isEqualTo(1);

        List<Platform> remainingPlatforms = platformMapper.selectList(null);
        assertThat(remainingPlatforms).hasSize(2);
    }

    @Test
    @DisplayName("测试BaseMapperPlus增强方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 测试existsByCondition
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getPlatformCode, "walmart_test");
        
        boolean exists = platformMapper.existsByCondition(wrapper);
        assertThat(exists).isTrue();

        // 测试selectCountByCondition
        LambdaQueryWrapper<Platform> countWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(countWrapper, Platform::getEnabled, true);
        
        Long count = platformMapper.selectCountByCondition(countWrapper);
        assertThat(count).isEqualTo(2L);

        // 测试selectOneByCondition
        LambdaQueryWrapper<Platform> oneWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(oneWrapper, Platform::getPlatformType, PlatformType.AMAZON);
        
        Platform platform = platformMapper.selectOneByCondition(oneWrapper);
        assertThat(platform).isNotNull();
        assertThat(platform.getPlatformName()).isEqualTo("亚马逊测试平台");

        // 测试selectAllByCondition
        LambdaQueryWrapper<Platform> allWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(allWrapper, Platform::getEnabled, true);
        QueryWrapperUtils.orderByAsc(allWrapper, Platform::getSortOrder);
        
        List<Platform> enabledPlatforms = platformMapper.selectAllByCondition(allWrapper);
        assertThat(enabledPlatforms).hasSize(2);
        assertThat(enabledPlatforms.get(0).getSortOrder()).isLessThan(enabledPlatforms.get(1).getSortOrder());
    }

    @Test
    @DisplayName("测试QueryWrapperUtils工具方法")
    void testQueryWrapperUtils() {
        // 测试eqIfPresent - 值存在时添加条件
        LambdaQueryWrapper<Platform> wrapper1 = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(wrapper1, Platform::getPlatformType, PlatformType.WALMART);
        
        List<Platform> result1 = platformMapper.selectAllByCondition(wrapper1);
        assertThat(result1).hasSize(1);
        assertThat(result1.get(0).getPlatformType()).isEqualTo(PlatformType.WALMART);

        // 测试eqIfPresent - 值为null时不添加条件
        LambdaQueryWrapper<Platform> wrapper2 = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(wrapper2, Platform::getPlatformType, null);
        
        List<Platform> result2 = platformMapper.selectAllByCondition(wrapper2);
        assertThat(result2).hasSize(3); // 应该返回所有记录

        // 测试likeIfPresent
        LambdaQueryWrapper<Platform> wrapper3 = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.likeIfPresent(wrapper3, Platform::getPlatformName, "沃尔玛");
        
        List<Platform> result3 = platformMapper.selectAllByCondition(wrapper3);
        assertThat(result3).hasSize(1);
        assertThat(result3.get(0).getPlatformName()).contains("沃尔玛");

        // 测试inIfPresent
        LambdaQueryWrapper<Platform> wrapper4 = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.inIfPresent(wrapper4, Platform::getPlatformType, 
                Arrays.asList(PlatformType.WALMART, PlatformType.AMAZON));
        
        List<Platform> result4 = platformMapper.selectAllByCondition(wrapper4);
        assertThat(result4).hasSize(2);

        // 测试orderByDesc
        LambdaQueryWrapper<Platform> wrapper5 = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.orderByDesc(wrapper5, Platform::getSortOrder);
        
        List<Platform> result5 = platformMapper.selectAllByCondition(wrapper5);
        assertThat(result5).hasSize(3);
        assertThat(result5.get(0).getSortOrder()).isGreaterThan(result5.get(1).getSortOrder());
    }

    @Test
    @DisplayName("测试分页查询功能")
    void testPagination() {
        // 创建分页对象
        Page<Platform> page = new Page<>(1, 2);
        
        // 创建查询条件
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.orderByAsc(wrapper, Platform::getSortOrder);
        
        // 执行分页查询
        IPage<Platform> result = platformMapper.selectPageByCondition(page, wrapper);
        
        // 验证分页结果
        assertThat(result.getRecords()).hasSize(2);
        assertThat(result.getTotal()).isEqualTo(3L);
        assertThat(result.getCurrent()).isEqualTo(1L);
        assertThat(result.getSize()).isEqualTo(2L);
        assertThat(result.getPages()).isEqualTo(2L);
    }

    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 测试根据平台类型查询
        List<Platform> walmartPlatforms = platformMapper.selectByPlatformType(PlatformType.WALMART);
        assertThat(walmartPlatforms).hasSize(1);
        assertThat(walmartPlatforms.get(0).getPlatformType()).isEqualTo(PlatformType.WALMART);

        // 测试根据状态查询
        List<Platform> activePlatforms = platformMapper.selectByStatus(PlatformStatus.ACTIVE);
        assertThat(activePlatforms).hasSize(1);
        assertThat(activePlatforms.get(0).getStatus()).isEqualTo(PlatformStatus.ACTIVE);

        // 测试根据平台代码查询
        Platform platform = platformMapper.selectByPlatformCode("amazon_test");
        assertThat(platform).isNotNull();
        assertThat(platform.getPlatformCode()).isEqualTo("amazon_test");

        // 测试查询启用的平台
        List<Platform> enabledPlatforms = platformMapper.selectEnabledPlatforms();
        assertThat(enabledPlatforms).hasSize(2);
        assertThat(enabledPlatforms).allMatch(Platform::getEnabled);

        // 测试状态统计
        List<Map<String, Object>> statusCount = platformMapper.countByStatus();
        assertThat(statusCount).hasSize(3); // 三种不同状态
        
        // 测试平台名称模糊查询
        List<Platform> searchResult = platformMapper.selectByPlatformNameLike("测试");
        assertThat(searchResult).hasSize(3); // 所有平台名称都包含"测试"

        // 测试检查平台代码唯一性
        int count = platformMapper.countByPlatformCodeExcludeId("walmart_test", 999L);
        assertThat(count).isEqualTo(1); // 存在一个匹配的记录

        // 测试获取最大排序顺序
        Integer maxSortOrder = platformMapper.selectMaxSortOrder();
        assertThat(maxSortOrder).isEqualTo(3);
    }

    @Test
    @DisplayName("测试复杂查询条件组合")
    void testComplexQueryConditions() {
        // 测试多条件组合查询
        LambdaQueryWrapper<Platform> wrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.eqIfPresent(wrapper, Platform::getEnabled, true);
        QueryWrapperUtils.inIfPresent(wrapper, Platform::getPlatformType, 
                Arrays.asList(PlatformType.WALMART, PlatformType.AMAZON));
        QueryWrapperUtils.orderByAsc(wrapper, Platform::getSortOrder);
        
        List<Platform> result = platformMapper.selectAllByCondition(wrapper);
        assertThat(result).hasSize(2);
        assertThat(result).allMatch(Platform::getEnabled);
        assertThat(result.get(0).getSortOrder()).isLessThan(result.get(1).getSortOrder());

        // 测试时间范围查询
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAgo = now.minusHours(1);
        
        LambdaQueryWrapper<Platform> timeWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.betweenTime(timeWrapper, Platform::getCreateTime, oneHourAgo, now);
        
        List<Platform> timeResult = platformMapper.selectAllByCondition(timeWrapper);
        assertThat(timeResult).hasSize(3); // 所有记录都在时间范围内

        // 测试geIfPresent和leIfPresent
        LambdaQueryWrapper<Platform> rangeWrapper = QueryWrapperUtils.lambdaQuery(Platform.class);
        QueryWrapperUtils.geIfPresent(rangeWrapper, Platform::getSortOrder, 2);
        QueryWrapperUtils.leIfPresent(rangeWrapper, Platform::getSortOrder, 3);
        
        List<Platform> rangeResult = platformMapper.selectAllByCondition(rangeWrapper);
        assertThat(rangeResult).hasSize(2);
        assertThat(rangeResult).allMatch(p -> p.getSortOrder() >= 2 && p.getSortOrder() <= 3);
    }

    @Test
    @DisplayName("测试逻辑删除功能")
    void testLogicalDelete() {
        // 获取删除前的记录数
        Long beforeCount = platformMapper.selectCountByCondition(QueryWrapperUtils.lambdaQuery(Platform.class));
        assertThat(beforeCount).isEqualTo(3L);

        // 执行逻辑删除
        int deleteResult = platformMapper.deleteById(testPlatform1.getId());
        assertThat(deleteResult).isEqualTo(1);

        // 验证逻辑删除后记录数减少
        Long afterCount = platformMapper.selectCountByCondition(QueryWrapperUtils.lambdaQuery(Platform.class));
        assertThat(afterCount).isEqualTo(2L);

        // 验证被删除的记录无法通过正常查询获取
        Platform deletedPlatform = platformMapper.selectById(testPlatform1.getId());
        assertThat(deletedPlatform).isNull();
    }

    /**
     * 创建测试平台对象
     *
     * @param name 平台名称
     * @param type 平台类型
     * @param code 平台代码
     * @param status 平台状态
     * @param enabled 是否启用
     * @param sortOrder 排序顺序
     * @return 平台对象
     */
    private Platform createTestPlatform(String name, PlatformType type, String code, 
                                       PlatformStatus status, Boolean enabled, Integer sortOrder) {
        Platform platform = new Platform();
        platform.setPlatformName(name);
        platform.setPlatformType(type);
        platform.setPlatformCode(code);
        platform.setDescription(name + "的描述信息");
        platform.setStatus(status);
        platform.setOfficialUrl("https://" + code + ".com");
        platform.setApiBaseUrl("https://api." + code + ".com");
        platform.setSupportedFeatures(Arrays.asList("订单管理", "库存同步", "商品上传"));
        platform.setEnabled(enabled);
        platform.setSortOrder(sortOrder);
        platform.setLastUpdated(LocalDateTime.now());
        platform.setRemarks("测试平台备注信息");
        return platform;
    }
}