package com.erp.platform.service;

import com.erp.common.response.PageResult;
import com.erp.platform.dto.PlatformDTO;
import com.erp.platform.dto.PlatformQueryDTO;
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
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 平台服务层单元测试
 * 使用Spring Boot测试上下文
 * 测试BaseServicePlus的增强方法和业务逻辑
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("平台服务层测试")
class PlatformServiceTest {

    @Autowired
    private PlatformService platformService;

    private PlatformDTO testPlatformDTO;

    @BeforeEach
    @DisplayName("准备测试数据")
    void setUp() {
        // 创建测试平台DTO
        testPlatformDTO = new PlatformDTO();
        testPlatformDTO.setPlatformName("测试平台服务");
        testPlatformDTO.setPlatformType(PlatformType.WALMART);
        testPlatformDTO.setPlatformCode("test-service-platform");
        testPlatformDTO.setDescription("这是一个服务层测试平台");
        testPlatformDTO.setStatus(PlatformStatus.ACTIVE);
        testPlatformDTO.setEnabled(true);
        testPlatformDTO.setSortOrder(1);
    }

    @Test
    @DisplayName("测试创建平台功能")
    void testCreatePlatform() {
        // 测试创建平台
        Platform createdPlatform = platformService.createPlatform(testPlatformDTO);
        
        // 验证创建结果
        assertThat(createdPlatform).isNotNull();
        assertThat(createdPlatform.getId()).isNotNull();
        assertThat(createdPlatform.getPlatformName()).isEqualTo("测试平台服务");
        assertThat(createdPlatform.getPlatformType()).isEqualTo(PlatformType.WALMART);
        assertThat(createdPlatform.getPlatformCode()).isEqualTo("test-service-platform");
        assertThat(createdPlatform.getStatus()).isEqualTo(PlatformStatus.ACTIVE);
        assertThat(createdPlatform.getEnabled()).isTrue();
        
        // 验证BaseEntity字段自动填充
        assertThat(createdPlatform.getCreateTime()).isNotNull();
        assertThat(createdPlatform.getUpdateTime()).isNotNull();
        assertThat(createdPlatform.getVersion()).isEqualTo(1);
        assertThat(createdPlatform.getDeleted()).isEqualTo(0);
        assertThat(createdPlatform.getLastUpdated()).isNotNull();
    }

    @Test
    @DisplayName("测试平台代码唯一性检查")
    void testPlatformCodeUniqueness() {
        // 创建第一个平台
        platformService.createPlatform(testPlatformDTO);
        
        // 尝试创建相同代码的平台，应该抛出异常
        PlatformDTO duplicateDTO = new PlatformDTO();
        duplicateDTO.setPlatformName("重复代码平台");
        duplicateDTO.setPlatformType(PlatformType.AMAZON);
        duplicateDTO.setPlatformCode("test-service-platform"); // 相同的代码
        duplicateDTO.setStatus(PlatformStatus.ACTIVE);
        
        assertThatThrownBy(() -> platformService.createPlatform(duplicateDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("平台代码已存在");
    }

    @Test
    @DisplayName("测试更新平台功能")
    void testUpdatePlatform() {
        // 先创建平台
        Platform createdPlatform = platformService.createPlatform(testPlatformDTO);
        Long platformId = createdPlatform.getId();
        
        // 准备更新数据
        PlatformDTO updateDTO = new PlatformDTO();
        updateDTO.setPlatformName("更新后的平台名称");
        updateDTO.setPlatformType(PlatformType.AMAZON);
        updateDTO.setPlatformCode("updated-platform-code");
        updateDTO.setDescription("更新后的描述");
        updateDTO.setStatus(PlatformStatus.INACTIVE);
        updateDTO.setEnabled(false);
        updateDTO.setSortOrder(2);
        
        // 执行更新
        Platform updatedPlatform = platformService.updatePlatform(platformId, updateDTO);
        
        // 验证更新结果
        assertThat(updatedPlatform).isNotNull();
        assertThat(updatedPlatform.getId()).isEqualTo(platformId);
        assertThat(updatedPlatform.getPlatformName()).isEqualTo("更新后的平台名称");
        assertThat(updatedPlatform.getPlatformType()).isEqualTo(PlatformType.AMAZON);
        assertThat(updatedPlatform.getPlatformCode()).isEqualTo("updated-platform-code");
        assertThat(updatedPlatform.getDescription()).isEqualTo("更新后的描述");
        assertThat(updatedPlatform.getStatus()).isEqualTo(PlatformStatus.INACTIVE);
        assertThat(updatedPlatform.getEnabled()).isFalse();
        assertThat(updatedPlatform.getSortOrder()).isEqualTo(2);
        
        // 验证版本号增加（乐观锁）
        assertThat(updatedPlatform.getVersion()).isEqualTo(2);
        assertThat(updatedPlatform.getLastUpdated()).isNotNull();
    }

    @Test
    @DisplayName("测试分页查询功能")
    void testGetPlatformPage() {
        // 创建多个测试平台
        for (int i = 1; i <= 5; i++) {
            PlatformDTO dto = new PlatformDTO();
            dto.setPlatformName("分页测试平台" + i);
            dto.setPlatformType(i % 2 == 0 ? PlatformType.WALMART : PlatformType.AMAZON);
            dto.setPlatformCode("page-test-platform-" + i);
            dto.setStatus(PlatformStatus.ACTIVE);
            dto.setEnabled(true);
            dto.setSortOrder(i);
            platformService.createPlatform(dto);
        }
        
        // 测试分页查询
        PlatformQueryDTO queryDTO = new PlatformQueryDTO();
        queryDTO.setEnabled(true);
        
        PageResult<Platform> pageResult = platformService.getPlatformPage(1L, 3L, queryDTO);
        
        // 验证分页结果
        assertThat(pageResult).isNotNull();
        assertThat(pageResult.getContent()).hasSize(3);
        assertThat(pageResult.getTotal()).isGreaterThanOrEqualTo(5);
        assertThat(pageResult.getPage()).isEqualTo(1);
        assertThat(pageResult.getSize()).isEqualTo(3);
        
        // 测试条件查询
        queryDTO.setPlatformType(PlatformType.WALMART);
        PageResult<Platform> filteredResult = platformService.getPlatformPage(1L, 10L, queryDTO);
        
        // 验证筛选结果
        assertThat(filteredResult.getContent()).isNotEmpty();
        filteredResult.getContent().forEach(platform -> {
            assertThat(platform.getPlatformType()).isEqualTo(PlatformType.WALMART);
            assertThat(platform.getEnabled()).isTrue();
        });
    }

    @Test
    @DisplayName("测试根据类型查询平台")
    void testGetPlatformsByType() {
        // 创建不同类型的平台
        testPlatformDTO.setPlatformType(PlatformType.WALMART);
        platformService.createPlatform(testPlatformDTO);
        
        PlatformDTO amazonDTO = new PlatformDTO();
        amazonDTO.setPlatformName("亚马逊测试平台");
        amazonDTO.setPlatformType(PlatformType.AMAZON);
        amazonDTO.setPlatformCode("amazon-test-platform");
        amazonDTO.setStatus(PlatformStatus.ACTIVE);
        amazonDTO.setEnabled(true);
        amazonDTO.setSortOrder(2);
        platformService.createPlatform(amazonDTO);
        
        // 测试根据类型查询
        List<Platform> walmartPlatforms = platformService.getPlatformsByType(PlatformType.WALMART);
        List<Platform> amazonPlatforms = platformService.getPlatformsByType(PlatformType.AMAZON);
        
        // 验证查询结果
        assertThat(walmartPlatforms).isNotEmpty();
        assertThat(amazonPlatforms).isNotEmpty();
        
        walmartPlatforms.forEach(platform -> {
            assertThat(platform.getPlatformType()).isEqualTo(PlatformType.WALMART);
            assertThat(platform.getEnabled()).isTrue();
        });
        
        amazonPlatforms.forEach(platform -> {
            assertThat(platform.getPlatformType()).isEqualTo(PlatformType.AMAZON);
            assertThat(platform.getEnabled()).isTrue();
        });
    }

    @Test
    @DisplayName("测试根据状态查询平台")
    void testGetPlatformsByStatus() {
        // 创建不同状态的平台
        testPlatformDTO.setStatus(PlatformStatus.ACTIVE);
        platformService.createPlatform(testPlatformDTO);
        
        PlatformDTO inactiveDTO = new PlatformDTO();
        inactiveDTO.setPlatformName("停用测试平台");
        inactiveDTO.setPlatformType(PlatformType.EBAY);
        inactiveDTO.setPlatformCode("inactive-test-platform");
        inactiveDTO.setStatus(PlatformStatus.INACTIVE);
        inactiveDTO.setEnabled(true);
        inactiveDTO.setSortOrder(2);
        platformService.createPlatform(inactiveDTO);
        
        // 测试根据状态查询
        List<Platform> activePlatforms = platformService.getPlatformsByStatus(PlatformStatus.ACTIVE);
        List<Platform> inactivePlatforms = platformService.getPlatformsByStatus(PlatformStatus.INACTIVE);
        
        // 验证查询结果
        assertThat(activePlatforms).isNotEmpty();
        assertThat(inactivePlatforms).isNotEmpty();
        
        activePlatforms.forEach(platform -> 
            assertThat(platform.getStatus()).isEqualTo(PlatformStatus.ACTIVE));
        
        inactivePlatforms.forEach(platform -> 
            assertThat(platform.getStatus()).isEqualTo(PlatformStatus.INACTIVE));
    }

    @Test
    @DisplayName("测试批量更新状态功能")
    void testBatchUpdateStatus() {
        // 创建多个平台
        Platform platform1 = platformService.createPlatform(testPlatformDTO);
        
        PlatformDTO dto2 = new PlatformDTO();
        dto2.setPlatformName("批量测试平台2");
        dto2.setPlatformType(PlatformType.AMAZON);
        dto2.setPlatformCode("batch-test-platform-2");
        dto2.setStatus(PlatformStatus.ACTIVE);
        dto2.setEnabled(true);
        dto2.setSortOrder(2);
        Platform platform2 = platformService.createPlatform(dto2);
        
        // 批量更新状态
        List<Long> platformIds = Arrays.asList(platform1.getId(), platform2.getId());
        int updateCount = platformService.batchUpdateStatus(platformIds, PlatformStatus.MAINTENANCE);
        
        // 验证更新结果
        assertThat(updateCount).isEqualTo(2);
        
        // 验证状态已更新
        Platform updatedPlatform1 = platformService.getById(platform1.getId());
        Platform updatedPlatform2 = platformService.getById(platform2.getId());
        
        assertThat(updatedPlatform1.getStatus()).isEqualTo(PlatformStatus.MAINTENANCE);
        assertThat(updatedPlatform2.getStatus()).isEqualTo(PlatformStatus.MAINTENANCE);
        assertThat(updatedPlatform1.getLastUpdated()).isNotNull();
        assertThat(updatedPlatform2.getLastUpdated()).isNotNull();
    }

    @Test
    @DisplayName("测试同步平台功能")
    void testSyncPlatform() {
        // 创建平台
        Platform createdPlatform = platformService.createPlatform(testPlatformDTO);
        Long platformId = createdPlatform.getId();
        LocalDateTime originalLastUpdated = createdPlatform.getLastUpdated();
        
        // 等待一小段时间确保时间戳不同
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 执行同步
        boolean syncResult = platformService.syncPlatform(platformId);
        
        // 验证同步结果
        assertThat(syncResult).isTrue();
        
        // 验证最后更新时间已更新
        Platform syncedPlatform = platformService.getById(platformId);
        assertThat(syncedPlatform.getLastUpdated()).isAfter(originalLastUpdated);
    }

    @Test
    @DisplayName("测试批量同步功能")
    void testBatchSyncPlatforms() {
        // 创建多个平台
        Platform platform1 = platformService.createPlatform(testPlatformDTO);
        
        PlatformDTO dto2 = new PlatformDTO();
        dto2.setPlatformName("批量同步测试平台2");
        dto2.setPlatformType(PlatformType.AMAZON);
        dto2.setPlatformCode("batch-sync-platform-2");
        dto2.setStatus(PlatformStatus.ACTIVE);
        dto2.setEnabled(true);
        dto2.setSortOrder(2);
        Platform platform2 = platformService.createPlatform(dto2);
        
        // 批量同步
        List<Long> platformIds = Arrays.asList(platform1.getId(), platform2.getId());
        int syncCount = platformService.batchSyncPlatforms(platformIds);
        
        // 验证同步结果
        assertThat(syncCount).isEqualTo(2);
        
        // 验证最后更新时间已更新
        Platform syncedPlatform1 = platformService.getById(platform1.getId());
        Platform syncedPlatform2 = platformService.getById(platform2.getId());
        
        assertThat(syncedPlatform1.getLastUpdated()).isNotNull();
        assertThat(syncedPlatform2.getLastUpdated()).isNotNull();
    }

    @Test
    @DisplayName("测试获取平台状态统计")
    void testGetPlatformStatusStats() {
        // 创建不同状态的平台
        testPlatformDTO.setStatus(PlatformStatus.ACTIVE);
        platformService.createPlatform(testPlatformDTO);
        
        PlatformDTO inactiveDTO = new PlatformDTO();
        inactiveDTO.setPlatformName("统计测试平台2");
        inactiveDTO.setPlatformType(PlatformType.AMAZON);
        inactiveDTO.setPlatformCode("stats-test-platform-2");
        inactiveDTO.setStatus(PlatformStatus.INACTIVE);
        inactiveDTO.setEnabled(false);
        inactiveDTO.setSortOrder(2);
        platformService.createPlatform(inactiveDTO);
        
        // 获取统计信息
        Map<String, Object> stats = platformService.getPlatformStatusStats();
        
        // 验证统计结果
        assertThat(stats).isNotNull();
        assertThat(stats).containsKeys("total", "active", "inactive", "enabled", "disabled", "byType", "lastUpdate");
        
        // 验证数量统计
        Long totalCount = (Long) stats.get("total");
        assertThat(totalCount).isGreaterThanOrEqualTo(2);
        
        Long activeCount = (Long) stats.get("active");
        Long inactiveCount = (Long) stats.get("inactive");
        assertThat(activeCount).isGreaterThanOrEqualTo(1);
        assertThat(inactiveCount).isGreaterThanOrEqualTo(1);
        
        // 验证按类型统计
        @SuppressWarnings("unchecked")
        Map<String, Long> typeStats = (Map<String, Long>) stats.get("byType");
        assertThat(typeStats).isNotNull();
        assertThat(typeStats.get("walmart")).isGreaterThanOrEqualTo(1);
        assertThat(typeStats.get("amazon")).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("测试BaseServicePlus的基本CRUD方法")
    void testBaseServicePlusCrudMethods() {
        // 创建平台
        Platform createdPlatform = platformService.createPlatform(testPlatformDTO);
        Long platformId = createdPlatform.getId();
        
        // 测试getById方法
        Platform foundPlatform = platformService.getById(platformId);
        assertThat(foundPlatform).isNotNull();
        assertThat(foundPlatform.getId()).isEqualTo(platformId);
        
        // 测试existsByField方法
        boolean exists = platformService.existsByField("platform_code", "test-service-platform");
        assertThat(exists).isTrue();
        
        // 测试countByField方法
        long count = platformService.countByField("platform_type", PlatformType.WALMART.getCode());
        assertThat(count).isGreaterThanOrEqualTo(1);
        
        // 测试getByField方法
        Platform platformByCode = platformService.getByField("platform_code", "test-service-platform");
        assertThat(platformByCode).isNotNull();
        assertThat(platformByCode.getId()).isEqualTo(platformId);
        
        // 测试removeById方法（逻辑删除）
        boolean removeResult = platformService.removeById(platformId);
        assertThat(removeResult).isTrue();
        
        // 验证逻辑删除后查询不到
        Platform deletedPlatform = platformService.getById(platformId);
        assertThat(deletedPlatform).isNull();
    }
}