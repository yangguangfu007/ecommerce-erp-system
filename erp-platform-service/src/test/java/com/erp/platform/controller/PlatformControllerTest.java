package com.erp.platform.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.platform.dto.PlatformDTO;
import com.erp.platform.dto.PlatformQueryDTO;
import com.erp.platform.entity.Platform;
import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import com.erp.platform.service.PlatformService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * 平台控制器单元测试
 * 使用Mockito测试Controller层
 * 模拟Service层依赖，验证Controller逻辑的正确性
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("平台控制器测试")
class PlatformControllerTest {

    @Mock
    private PlatformService platformService;

    @InjectMocks
    private PlatformController platformController;

    private Platform testPlatform;
    private PlatformDTO testPlatformDTO;

    @BeforeEach
    @DisplayName("准备测试数据")
    void setUp() {
        // 创建测试平台实体
        testPlatform = new Platform();
        testPlatform.setId(1L);
        testPlatform.setPlatformName("测试平台");
        testPlatform.setPlatformType(PlatformType.WALMART);
        testPlatform.setPlatformCode("test-platform");
        testPlatform.setDescription("这是一个测试平台");
        testPlatform.setStatus(PlatformStatus.ACTIVE);
        testPlatform.setEnabled(true);
        testPlatform.setSortOrder(1);
        testPlatform.setCreateTime(LocalDateTime.now());
        testPlatform.setUpdateTime(LocalDateTime.now());
        testPlatform.setVersion(1);

        // 创建测试平台DTO
        testPlatformDTO = new PlatformDTO();
        testPlatformDTO.setPlatformName("测试平台");
        testPlatformDTO.setPlatformType(PlatformType.WALMART);
        testPlatformDTO.setPlatformCode("test-platform");
        testPlatformDTO.setDescription("这是一个测试平台");
        testPlatformDTO.setStatus(PlatformStatus.ACTIVE);
        testPlatformDTO.setEnabled(true);
        testPlatformDTO.setSortOrder(1);
    }

    @Test
    @DisplayName("测试分页查询平台列表接口")
    void testGetPlatformPage() {
        // 准备分页结果
        PageResult<Platform> pageResult = new PageResult<>();
        pageResult.setContent(Arrays.asList(testPlatform));
        pageResult.setPage(1L);
        pageResult.setSize(10L);
        pageResult.setTotal(1L);
        pageResult.setTotalPages(1L);

        // 模拟Service方法
        when(platformService.getPlatformPage(eq(1L), eq(10L), any(PlatformQueryDTO.class)))
                .thenReturn(pageResult);

        // 执行Controller方法
        PlatformQueryDTO queryDTO = new PlatformQueryDTO();
        queryDTO.setEnabled(true);
        Result<PageResult<Platform>> result = platformController.getPlatformPage(1L, 10L, queryDTO);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isNotNull();
        assertThat(result.getData().getContent()).hasSize(1);
        assertThat(result.getData().getContent().get(0).getId()).isEqualTo(1L);
        assertThat(result.getData().getContent().get(0).getPlatformName()).isEqualTo("测试平台");
        assertThat(result.getData().getPage()).isEqualTo(1L);
        assertThat(result.getData().getSize()).isEqualTo(10L);
        assertThat(result.getData().getTotal()).isEqualTo(1L);
    }

    @Test
    @DisplayName("测试根据ID获取平台详情接口")
    void testGetPlatformById() {
        // 模拟Service方法
        when(platformService.getById(1L)).thenReturn(testPlatform);

        // 执行Controller方法
        Result<Platform> result = platformController.getPlatformById(1L);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isNotNull();
        assertThat(result.getData().getId()).isEqualTo(1L);
        assertThat(result.getData().getPlatformName()).isEqualTo("测试平台");
        assertThat(result.getData().getPlatformType()).isEqualTo(PlatformType.WALMART);
        assertThat(result.getData().getPlatformCode()).isEqualTo("test-platform");
    }

    @Test
    @DisplayName("测试获取不存在的平台")
    void testGetPlatformByIdNotFound() {
        // 模拟Service方法返回null
        when(platformService.getById(999L)).thenReturn(null);

        // 执行Controller方法
        Result<Platform> result = platformController.getPlatformById(999L);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(500);
        assertThat(result.getMessage()).isEqualTo("平台不存在");
        assertThat(result.getData()).isNull();
    }

    @Test
    @DisplayName("测试创建平台接口")
    void testCreatePlatform() {
        // 模拟Service方法
        when(platformService.createPlatform(any(PlatformDTO.class))).thenReturn(testPlatform);

        // 执行Controller方法
        Result<Platform> result = platformController.createPlatform(testPlatformDTO);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isNotNull();
        assertThat(result.getData().getId()).isEqualTo(1L);
        assertThat(result.getData().getPlatformName()).isEqualTo("测试平台");
        assertThat(result.getData().getPlatformCode()).isEqualTo("test-platform");
    }

    @Test
    @DisplayName("测试更新平台接口")
    void testUpdatePlatform() {
        // 准备更新后的平台
        Platform updatedPlatform = new Platform();
        updatedPlatform.setId(1L);
        updatedPlatform.setPlatformName("更新后的平台");
        updatedPlatform.setPlatformType(PlatformType.AMAZON);
        updatedPlatform.setPlatformCode("updated-platform");
        updatedPlatform.setStatus(PlatformStatus.ACTIVE);
        updatedPlatform.setEnabled(true);
        updatedPlatform.setVersion(2);

        // 模拟Service方法
        when(platformService.updatePlatform(eq(1L), any(PlatformDTO.class))).thenReturn(updatedPlatform);

        // 准备更新DTO
        PlatformDTO updateDTO = new PlatformDTO();
        updateDTO.setPlatformName("更新后的平台");
        updateDTO.setPlatformType(PlatformType.AMAZON);
        updateDTO.setPlatformCode("updated-platform");
        updateDTO.setStatus(PlatformStatus.ACTIVE);
        updateDTO.setEnabled(true);

        // 执行Controller方法
        Result<Platform> result = platformController.updatePlatform(1L, updateDTO);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isNotNull();
        assertThat(result.getData().getId()).isEqualTo(1L);
        assertThat(result.getData().getPlatformName()).isEqualTo("更新后的平台");
        assertThat(result.getData().getPlatformType()).isEqualTo(PlatformType.AMAZON);
    }

    @Test
    @DisplayName("测试删除平台接口")
    void testDeletePlatform() {
        // 模拟Service方法
        when(platformService.removeById(1L)).thenReturn(true);

        // 执行Controller方法
        Result<Void> result = platformController.deletePlatform(1L);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
    }

    @Test
    @DisplayName("测试同步平台数据接口")
    void testSyncPlatform() {
        // 模拟Service方法
        when(platformService.syncPlatform(1L)).thenReturn(true);

        // 执行Controller方法
        Result<Void> result = platformController.syncPlatform(1L);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
    }

    @Test
    @DisplayName("测试批量同步平台数据接口")
    void testBatchSyncPlatforms() {
        // 模拟Service方法
        when(platformService.batchSyncPlatforms(anyList())).thenReturn(2);

        List<Long> platformIds = Arrays.asList(1L, 2L);

        // 执行Controller方法
        Result<Integer> result = platformController.batchSyncPlatforms(platformIds);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isEqualTo(2);
    }

    @Test
    @DisplayName("测试获取平台状态统计接口")
    void testGetPlatformStatusStats() {
        // 准备统计数据
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", 10L);
        stats.put("active", 8L);
        stats.put("inactive", 2L);
        stats.put("enabled", 9L);
        stats.put("disabled", 1L);

        Map<String, Long> typeStats = new HashMap<>();
        typeStats.put("walmart", 3L);
        typeStats.put("amazon", 4L);
        typeStats.put("ebay", 3L);
        stats.put("byType", typeStats);

        // 模拟Service方法
        when(platformService.getPlatformStatusStats()).thenReturn(stats);

        // 执行Controller方法
        Result<Map<String, Object>> result = platformController.getPlatformStatusStats();

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isNotNull();
        assertThat(result.getData().get("total")).isEqualTo(10L);
        assertThat(result.getData().get("active")).isEqualTo(8L);
        assertThat(result.getData().get("inactive")).isEqualTo(2L);
        
        @SuppressWarnings("unchecked")
        Map<String, Long> resultTypeStats = (Map<String, Long>) result.getData().get("byType");
        assertThat(resultTypeStats.get("walmart")).isEqualTo(3L);
        assertThat(resultTypeStats.get("amazon")).isEqualTo(4L);
    }

    @Test
    @DisplayName("测试根据类型获取平台列表接口")
    void testGetPlatformsByType() {
        // 模拟Service方法
        when(platformService.getPlatformsByType(PlatformType.WALMART))
                .thenReturn(Arrays.asList(testPlatform));

        // 执行Controller方法
        Result<List<Platform>> result = platformController.getPlatformsByType(PlatformType.WALMART);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isNotNull();
        assertThat(result.getData()).hasSize(1);
        assertThat(result.getData().get(0).getPlatformType()).isEqualTo(PlatformType.WALMART);
    }

    @Test
    @DisplayName("测试根据状态获取平台列表接口")
    void testGetPlatformsByStatus() {
        // 模拟Service方法
        when(platformService.getPlatformsByStatus(PlatformStatus.ACTIVE))
                .thenReturn(Arrays.asList(testPlatform));

        // 执行Controller方法
        Result<List<Platform>> result = platformController.getPlatformsByStatus(PlatformStatus.ACTIVE);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isNotNull();
        assertThat(result.getData()).hasSize(1);
        assertThat(result.getData().get(0).getStatus()).isEqualTo(PlatformStatus.ACTIVE);
    }

    @Test
    @DisplayName("测试获取启用的平台列表接口")
    void testGetEnabledPlatforms() {
        // 模拟Service方法
        when(platformService.getEnabledPlatforms()).thenReturn(Arrays.asList(testPlatform));

        // 执行Controller方法
        Result<List<Platform>> result = platformController.getEnabledPlatforms();

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isNotNull();
        assertThat(result.getData()).hasSize(1);
        assertThat(result.getData().get(0).getEnabled()).isTrue();
    }

    @Test
    @DisplayName("测试批量更新平台状态接口")
    void testBatchUpdateStatus() {
        // 模拟Service方法
        when(platformService.batchUpdateStatus(anyList(), eq(PlatformStatus.MAINTENANCE)))
                .thenReturn(2);

        List<Long> platformIds = Arrays.asList(1L, 2L);

        // 执行Controller方法
        Result<Integer> result = platformController.batchUpdateStatus(platformIds, PlatformStatus.MAINTENANCE);

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isEqualTo(2);
    }

    @Test
    @DisplayName("测试根据代码获取平台信息接口")
    void testGetPlatformByCode() {
        // 模拟Service方法
        when(platformService.getPlatformByCode("test-platform")).thenReturn(testPlatform);

        // 执行Controller方法
        Result<Platform> result = platformController.getPlatformByCode("test-platform");

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isNotNull();
        assertThat(result.getData().getPlatformCode()).isEqualTo("test-platform");
    }

    @Test
    @DisplayName("测试检查平台代码是否存在接口")
    void testCheckPlatformCode() {
        // 模拟Service方法
        when(platformService.isPlatformCodeExists("test-platform", null)).thenReturn(true);
        when(platformService.isPlatformCodeExists("new-platform", null)).thenReturn(false);

        // 测试存在的代码
        Result<Boolean> result1 = platformController.checkPlatformCode("test-platform", null);
        assertThat(result1).isNotNull();
        assertThat(result1.getCode()).isEqualTo(200);
        assertThat(result1.getData()).isTrue();

        // 测试不存在的代码
        Result<Boolean> result2 = platformController.checkPlatformCode("new-platform", null);
        assertThat(result2).isNotNull();
        assertThat(result2.getCode()).isEqualTo(200);
        assertThat(result2.getData()).isFalse();
    }

    @Test
    @DisplayName("测试异常处理")
    void testExceptionHandling() {
        // 模拟Service方法抛出异常
        when(platformService.getById(1L)).thenThrow(new RuntimeException("数据库连接失败"));

        // 执行Controller方法
        Result<Platform> result = platformController.getPlatformById(1L);

        // 验证异常处理
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(500);
        assertThat(result.getMessage()).contains("获取失败：数据库连接失败");
    }
}