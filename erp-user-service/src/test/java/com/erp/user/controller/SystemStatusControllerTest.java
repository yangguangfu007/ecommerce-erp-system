package com.erp.user.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.user.dto.SystemStatusQueryDTO;
import com.erp.user.entity.SystemStatus;
import com.erp.user.enums.ServiceStatus;
import com.erp.user.service.SystemStatusService;
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
 * 系统状态控制器测试类
 * 测试核心的系统状态监控接口
 * 
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("系统状态控制器测试")
class SystemStatusControllerTest {

    @Mock
    private SystemStatusService systemStatusService;

    @InjectMocks
    private SystemStatusController systemStatusController;

    private SystemStatus testStatus;
    private PageResult<SystemStatus> pageResult;

    @BeforeEach
    @DisplayName("初始化测试数据")
    void setUp() {
        // 创建测试状态对象
        testStatus = new SystemStatus();
        testStatus.setId(1L);
        testStatus.setServiceName("user-service");
        testStatus.setServiceStatus(ServiceStatus.UP);
        testStatus.setServiceUrl("http://localhost:8001");
        testStatus.setResponseTime(150L);
        testStatus.setLastCheckTime(LocalDateTime.now());
        testStatus.setFailureCount(0);
        testStatus.setMonitorEnabled(true);

        // 创建分页结果
        List<SystemStatus> statusList = Arrays.asList(testStatus);
        pageResult = new PageResult<>();
        pageResult.setContent(statusList);
        pageResult.setPage(1L);
        pageResult.setSize(10L);
        pageResult.setTotal(1L);
        pageResult.setTotalPages(1L);
    }

    @Test
    @DisplayName("测试分页查询系统状态")
    void testGetStatusPage() {
        // 准备测试数据
        SystemStatusQueryDTO queryDTO = new SystemStatusQueryDTO();
        queryDTO.setServiceName("user-service");

        // 模拟Service方法
        when(systemStatusService.getStatusPage(eq(1L), eq(10L), any(SystemStatusQueryDTO.class)))
                .thenReturn(pageResult);

        // 执行测试
        Result<PageResult<SystemStatus>> result = systemStatusController.getStatusPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertEquals("操作成功", result.getMessage());
        assertNotNull(result.getData());
        assertEquals(1L, result.getData().getTotal());
        assertEquals(1, result.getData().getContent().size());
        assertEquals("user-service", result.getData().getContent().get(0).getServiceName());

        // 验证Service方法调用
        verify(systemStatusService, times(1)).getStatusPage(eq(1L), eq(10L), any(SystemStatusQueryDTO.class));
    }

    @Test
    @DisplayName("测试查询系统状态异常处理")
    void testGetStatusPageWithException() {
        // 准备测试数据
        SystemStatusQueryDTO queryDTO = new SystemStatusQueryDTO();

        // 模拟Service方法抛出异常
        when(systemStatusService.getStatusPage(anyLong(), anyLong(), any(SystemStatusQueryDTO.class)))
                .thenThrow(new RuntimeException("数据库连接失败"));

        // 执行测试
        Result<PageResult<SystemStatus>> result = systemStatusController.getStatusPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(500, result.getCode());
        assertTrue(result.getMessage().contains("查询系统状态失败"));

        // 验证Service方法调用
        verify(systemStatusService, times(1)).getStatusPage(anyLong(), anyLong(), any(SystemStatusQueryDTO.class));
    }

    @Test
    @DisplayName("测试分页参数验证")
    void testGetStatusPageWithValidation() {
        // 准备测试数据
        SystemStatusQueryDTO queryDTO = new SystemStatusQueryDTO();

        // 模拟Service方法
        when(systemStatusService.getStatusPage(anyLong(), anyLong(), any(SystemStatusQueryDTO.class)))
                .thenReturn(pageResult);

        // 测试默认分页参数
        Result<PageResult<SystemStatus>> result = systemStatusController.getStatusPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());

        // 验证Service方法调用时使用了正确的参数
        verify(systemStatusService, times(1)).getStatusPage(eq(1L), eq(10L), any(SystemStatusQueryDTO.class));
    }

    @Test
    @DisplayName("测试空查询条件")
    void testGetStatusPageWithEmptyQuery() {
        // 准备测试数据 - 空查询条件
        SystemStatusQueryDTO queryDTO = new SystemStatusQueryDTO();

        // 模拟Service方法
        when(systemStatusService.getStatusPage(anyLong(), anyLong(), any(SystemStatusQueryDTO.class)))
                .thenReturn(pageResult);

        // 执行测试
        Result<PageResult<SystemStatus>> result = systemStatusController.getStatusPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertNotNull(result.getData());

        // 验证Service方法调用
        verify(systemStatusService, times(1)).getStatusPage(eq(1L), eq(10L), any(SystemStatusQueryDTO.class));
    }

    @Test
    @DisplayName("测试大分页查询")
    void testGetStatusPageWithLargePage() {
        // 准备测试数据
        SystemStatusQueryDTO queryDTO = new SystemStatusQueryDTO();
        
        // 创建大分页结果
        PageResult<SystemStatus> largePageResult = new PageResult<>();
        largePageResult.setContent(Arrays.asList(testStatus));
        largePageResult.setPage(100L);
        largePageResult.setSize(50L);
        largePageResult.setTotal(5000L);
        largePageResult.setTotalPages(100L);

        // 模拟Service方法
        when(systemStatusService.getStatusPage(eq(100L), eq(50L), any(SystemStatusQueryDTO.class)))
                .thenReturn(largePageResult);

        // 执行测试
        Result<PageResult<SystemStatus>> result = systemStatusController.getStatusPage(100L, 50L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertEquals(5000L, result.getData().getTotal());
        assertEquals(100L, result.getData().getPage());
        assertEquals(50L, result.getData().getSize());

        // 验证Service方法调用
        verify(systemStatusService, times(1)).getStatusPage(eq(100L), eq(50L), any(SystemStatusQueryDTO.class));
    }

    @Test
    @DisplayName("测试服务状态筛选")
    void testGetStatusPageWithStatusFilter() {
        // 准备测试数据
        SystemStatusQueryDTO queryDTO = new SystemStatusQueryDTO();
        queryDTO.setServiceStatus(ServiceStatus.UP);

        // 模拟Service方法
        when(systemStatusService.getStatusPage(anyLong(), anyLong(), any(SystemStatusQueryDTO.class)))
                .thenReturn(pageResult);

        // 执行测试
        Result<PageResult<SystemStatus>> result = systemStatusController.getStatusPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertEquals(ServiceStatus.UP, result.getData().getContent().get(0).getServiceStatus());

        // 验证Service方法调用
        verify(systemStatusService, times(1)).getStatusPage(anyLong(), anyLong(), any(SystemStatusQueryDTO.class));
    }
}