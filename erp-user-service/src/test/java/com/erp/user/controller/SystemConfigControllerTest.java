package com.erp.user.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.user.dto.SystemConfigQueryDTO;
import com.erp.user.entity.SystemConfig;
import com.erp.user.enums.ConfigType;
import com.erp.user.service.SystemConfigService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 系统配置控制器测试类
 * 测试核心的系统配置管理接口
 * 
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("系统配置控制器测试")
class SystemConfigControllerTest {

    @Mock
    private SystemConfigService systemConfigService;

    @InjectMocks
    private SystemConfigController systemConfigController;

    private SystemConfig testConfig;
    private PageResult<SystemConfig> pageResult;

    @BeforeEach
    @DisplayName("初始化测试数据")
    void setUp() {
        // 创建测试配置对象
        testConfig = new SystemConfig();
        testConfig.setId(1L);
        testConfig.setCategory(ConfigType.SYSTEM);
        testConfig.setConfigKey("system.name");
        testConfig.setConfigValue("ERP管理系统");
        testConfig.setValueType("string");
        testConfig.setDescription("系统名称配置");
        testConfig.setEditable(true);
        testConfig.setEnabled(true);
        testConfig.setSortOrder(1);
        testConfig.setCreateTime(LocalDateTime.now());

        // 创建分页结果
        List<SystemConfig> configList = Arrays.asList(testConfig);
        pageResult = new PageResult<>();
        pageResult.setContent(configList);
        pageResult.setPage(1L);
        pageResult.setSize(10L);
        pageResult.setTotal(1L);
        pageResult.setTotalPages(1L);
    }

    @Test
    @DisplayName("测试分页查询系统配置")
    void testGetConfigPage() {
        // 准备测试数据
        SystemConfigQueryDTO queryDTO = new SystemConfigQueryDTO();
        queryDTO.setCategory(ConfigType.SYSTEM);

        // 模拟Service方法
        when(systemConfigService.getConfigPage(eq(1L), eq(10L), any(SystemConfigQueryDTO.class)))
                .thenReturn(pageResult);

        // 执行测试
        Result<PageResult<SystemConfig>> result = systemConfigController.getConfigPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertEquals("操作成功", result.getMessage());
        assertNotNull(result.getData());
        assertEquals(1L, result.getData().getTotal());
        assertEquals(1, result.getData().getContent().size());
        assertEquals("system.name", result.getData().getContent().get(0).getConfigKey());

        // 验证Service方法调用
        verify(systemConfigService, times(1)).getConfigPage(eq(1L), eq(10L), any(SystemConfigQueryDTO.class));
    }

    @Test
    @DisplayName("测试查询系统配置异常处理")
    void testGetConfigPageWithException() {
        // 准备测试数据
        SystemConfigQueryDTO queryDTO = new SystemConfigQueryDTO();

        // 模拟Service方法抛出异常
        when(systemConfigService.getConfigPage(anyLong(), anyLong(), any(SystemConfigQueryDTO.class)))
                .thenThrow(new RuntimeException("数据库连接失败"));

        // 执行测试
        Result<PageResult<SystemConfig>> result = systemConfigController.getConfigPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(500, result.getCode());
        assertTrue(result.getMessage().contains("查询系统配置失败"));

        // 验证Service方法调用
        verify(systemConfigService, times(1)).getConfigPage(anyLong(), anyLong(), any(SystemConfigQueryDTO.class));
    }

    @Test
    @DisplayName("测试更新系统配置")
    void testUpdateConfig() {
        // 准备测试数据
        SystemConfig updateConfig = new SystemConfig();
        updateConfig.setId(1L);
        updateConfig.setConfigKey("system.name");
        updateConfig.setConfigValue("新的ERP系统");
        updateConfig.setDescription("更新后的系统名称");

        // 模拟Service方法
        when(systemConfigService.updateConfig(any(SystemConfig.class)))
                .thenReturn(updateConfig);

        // 执行测试
        Result<SystemConfig> result = systemConfigController.updateConfig(updateConfig);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertTrue(result.getMessage().contains("配置更新成功"));
        assertNotNull(result.getData());
        assertEquals("新的ERP系统", result.getData().getConfigValue());

        // 验证Service方法调用
        verify(systemConfigService, times(1)).updateConfig(any(SystemConfig.class));
    }

    @Test
    @DisplayName("测试更新系统配置异常处理")
    void testUpdateConfigWithException() {
        // 准备测试数据
        SystemConfig updateConfig = new SystemConfig();
        updateConfig.setConfigKey("system.name");
        updateConfig.setConfigValue("新的ERP系统");

        // 模拟Service方法抛出异常
        when(systemConfigService.updateConfig(any(SystemConfig.class)))
                .thenThrow(new RuntimeException("配置键名重复"));

        // 执行测试
        Result<SystemConfig> result = systemConfigController.updateConfig(updateConfig);

        // 验证结果
        assertNotNull(result);
        assertEquals(500, result.getCode());
        assertTrue(result.getMessage().contains("更新系统配置失败"));

        // 验证Service方法调用
        verify(systemConfigService, times(1)).updateConfig(any(SystemConfig.class));
    }

    @Test
    @DisplayName("测试分类筛选查询")
    void testGetConfigPageWithCategoryFilter() {
        // 准备测试数据
        SystemConfigQueryDTO queryDTO = new SystemConfigQueryDTO();
        queryDTO.setCategory(ConfigType.BUSINESS);

        // 创建业务配置
        SystemConfig businessConfig = new SystemConfig();
        businessConfig.setId(2L);
        businessConfig.setCategory(ConfigType.BUSINESS);
        businessConfig.setConfigKey("business.timeout");
        businessConfig.setConfigValue("30000");

        PageResult<SystemConfig> businessPageResult = new PageResult<>();
        businessPageResult.setContent(Arrays.asList(businessConfig));
        businessPageResult.setPage(1L);
        businessPageResult.setSize(10L);
        businessPageResult.setTotal(1L);
        businessPageResult.setTotalPages(1L);

        // 模拟Service方法
        when(systemConfigService.getConfigPage(anyLong(), anyLong(), any(SystemConfigQueryDTO.class)))
                .thenReturn(businessPageResult);

        // 执行测试
        Result<PageResult<SystemConfig>> result = systemConfigController.getConfigPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertEquals(ConfigType.BUSINESS, result.getData().getContent().get(0).getCategory());

        // 验证Service方法调用
        verify(systemConfigService, times(1)).getConfigPage(anyLong(), anyLong(), any(SystemConfigQueryDTO.class));
    }

    @Test
    @DisplayName("测试空查询条件")
    void testGetConfigPageWithEmptyQuery() {
        // 准备测试数据 - 空查询条件
        SystemConfigQueryDTO queryDTO = new SystemConfigQueryDTO();

        // 模拟Service方法
        when(systemConfigService.getConfigPage(anyLong(), anyLong(), any(SystemConfigQueryDTO.class)))
                .thenReturn(pageResult);

        // 执行测试
        Result<PageResult<SystemConfig>> result = systemConfigController.getConfigPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertNotNull(result.getData());

        // 验证Service方法调用
        verify(systemConfigService, times(1)).getConfigPage(eq(1L), eq(10L), any(SystemConfigQueryDTO.class));
    }

    @Test
    @DisplayName("测试分页参数验证")
    void testGetConfigPageWithValidation() {
        // 准备测试数据
        SystemConfigQueryDTO queryDTO = new SystemConfigQueryDTO();

        // 模拟Service方法
        when(systemConfigService.getConfigPage(anyLong(), anyLong(), any(SystemConfigQueryDTO.class)))
                .thenReturn(pageResult);

        // 测试默认分页参数
        Result<PageResult<SystemConfig>> result = systemConfigController.getConfigPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());

        // 验证Service方法调用时使用了正确的参数
        verify(systemConfigService, times(1)).getConfigPage(eq(1L), eq(10L), any(SystemConfigQueryDTO.class));
    }

    @Test
    @DisplayName("测试大分页查询")
    void testGetConfigPageWithLargePage() {
        // 准备测试数据
        SystemConfigQueryDTO queryDTO = new SystemConfigQueryDTO();
        
        // 创建大分页结果
        PageResult<SystemConfig> largePageResult = new PageResult<>();
        largePageResult.setContent(Arrays.asList(testConfig));
        largePageResult.setPage(20L);
        largePageResult.setSize(50L);
        largePageResult.setTotal(1000L);
        largePageResult.setTotalPages(20L);

        // 模拟Service方法
        when(systemConfigService.getConfigPage(eq(20L), eq(50L), any(SystemConfigQueryDTO.class)))
                .thenReturn(largePageResult);

        // 执行测试
        Result<PageResult<SystemConfig>> result = systemConfigController.getConfigPage(20L, 50L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertEquals(1000L, result.getData().getTotal());
        assertEquals(20L, result.getData().getPage());
        assertEquals(50L, result.getData().getSize());

        // 验证Service方法调用
        verify(systemConfigService, times(1)).getConfigPage(eq(20L), eq(50L), any(SystemConfigQueryDTO.class));
    }
}