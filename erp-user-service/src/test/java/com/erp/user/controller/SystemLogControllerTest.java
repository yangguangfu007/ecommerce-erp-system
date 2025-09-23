package com.erp.user.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.user.dto.SystemLogQueryDTO;
import com.erp.user.entity.SystemLog;
import com.erp.user.enums.LogLevel;
import com.erp.user.service.SystemLogService;
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
 * 系统日志控制器测试类
 * 测试核心的系统日志查询接口
 * 
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("系统日志控制器测试")
class SystemLogControllerTest {

    @Mock
    private SystemLogService systemLogService;

    @InjectMocks
    private SystemLogController systemLogController;

    private SystemLog testLog;
    private PageResult<SystemLog> pageResult;

    @BeforeEach
    @DisplayName("初始化测试数据")
    void setUp() {
        // 创建测试日志对象
        testLog = new SystemLog();
        testLog.setId(1L);
        testLog.setLogLevel(LogLevel.INFO);
        testLog.setMessage("测试日志消息");
        testLog.setModuleName("SystemTest");
        testLog.setUserId(1L);
        testLog.setClientIp("127.0.0.1");
        testLog.setUserAgent("curl/test");
        testLog.setCreateTime(LocalDateTime.now());

        // 创建分页结果
        List<SystemLog> logList = Arrays.asList(testLog);
        pageResult = new PageResult<>();
        pageResult.setContent(logList);
        pageResult.setPage(1L);
        pageResult.setSize(10L);
        pageResult.setTotal(1L);
        pageResult.setTotalPages(1L);
    }

    @Test
    @DisplayName("测试分页查询系统日志")
    void testGetLogPage() {
        // 准备测试数据
        SystemLogQueryDTO queryDTO = new SystemLogQueryDTO();
        queryDTO.setLogLevel(LogLevel.INFO);

        // 模拟Service方法
        when(systemLogService.getLogPage(eq(1L), eq(10L), any(SystemLogQueryDTO.class)))
                .thenReturn(pageResult);

        // 执行测试
        Result<PageResult<SystemLog>> result = systemLogController.getLogPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertEquals("操作成功", result.getMessage());
        assertNotNull(result.getData());
        assertEquals(1L, result.getData().getTotal());
        assertEquals(1, result.getData().getContent().size());
        assertEquals("测试日志消息", result.getData().getContent().get(0).getMessage());

        // 验证Service方法调用
        verify(systemLogService, times(1)).getLogPage(eq(1L), eq(10L), any(SystemLogQueryDTO.class));
    }

    @Test
    @DisplayName("测试查询系统日志异常处理")
    void testGetLogPageWithException() {
        // 准备测试数据
        SystemLogQueryDTO queryDTO = new SystemLogQueryDTO();

        // 模拟Service方法抛出异常
        when(systemLogService.getLogPage(anyLong(), anyLong(), any(SystemLogQueryDTO.class)))
                .thenThrow(new RuntimeException("数据库连接失败"));

        // 执行测试
        Result<PageResult<SystemLog>> result = systemLogController.getLogPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(500, result.getCode());
        assertTrue(result.getMessage().contains("查询系统日志失败"));

        // 验证Service方法调用
        verify(systemLogService, times(1)).getLogPage(anyLong(), anyLong(), any(SystemLogQueryDTO.class));
    }

    @Test
    @DisplayName("测试分页参数验证")
    void testGetLogPageWithValidation() {
        // 准备测试数据
        SystemLogQueryDTO queryDTO = new SystemLogQueryDTO();

        // 模拟Service方法
        when(systemLogService.getLogPage(anyLong(), anyLong(), any(SystemLogQueryDTO.class)))
                .thenReturn(pageResult);

        // 测试默认分页参数
        Result<PageResult<SystemLog>> result = systemLogController.getLogPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());

        // 验证Service方法调用时使用了正确的参数
        verify(systemLogService, times(1)).getLogPage(eq(1L), eq(10L), any(SystemLogQueryDTO.class));
    }

    @Test
    @DisplayName("测试日志级别筛选")
    void testGetLogPageWithLevelFilter() {
        // 准备测试数据
        SystemLogQueryDTO queryDTO = new SystemLogQueryDTO();
        queryDTO.setLogLevel(LogLevel.ERROR);

        // 创建ERROR级别的日志
        SystemLog errorLog = new SystemLog();
        errorLog.setId(2L);
        errorLog.setLogLevel(LogLevel.ERROR);
        errorLog.setMessage("错误日志消息");
        errorLog.setModuleName("SystemTest");

        PageResult<SystemLog> errorPageResult = new PageResult<>();
        errorPageResult.setContent(Arrays.asList(errorLog));
        errorPageResult.setPage(1L);
        errorPageResult.setSize(10L);
        errorPageResult.setTotal(1L);
        errorPageResult.setTotalPages(1L);

        // 模拟Service方法
        when(systemLogService.getLogPage(anyLong(), anyLong(), any(SystemLogQueryDTO.class)))
                .thenReturn(errorPageResult);

        // 执行测试
        Result<PageResult<SystemLog>> result = systemLogController.getLogPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertEquals(LogLevel.ERROR, result.getData().getContent().get(0).getLogLevel());

        // 验证Service方法调用
        verify(systemLogService, times(1)).getLogPage(anyLong(), anyLong(), any(SystemLogQueryDTO.class));
    }

    @Test
    @DisplayName("测试时间范围筛选")
    void testGetLogPageWithTimeRange() {
        // 准备测试数据
        SystemLogQueryDTO queryDTO = new SystemLogQueryDTO();
        queryDTO.setStartTime(LocalDateTime.now().minusDays(1));
        queryDTO.setEndTime(LocalDateTime.now());

        // 模拟Service方法
        when(systemLogService.getLogPage(anyLong(), anyLong(), any(SystemLogQueryDTO.class)))
                .thenReturn(pageResult);

        // 执行测试
        Result<PageResult<SystemLog>> result = systemLogController.getLogPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertNotNull(result.getData());

        // 验证Service方法调用
        verify(systemLogService, times(1)).getLogPage(anyLong(), anyLong(), any(SystemLogQueryDTO.class));
    }

    @Test
    @DisplayName("测试空查询条件")
    void testGetLogPageWithEmptyQuery() {
        // 准备测试数据 - 空查询条件
        SystemLogQueryDTO queryDTO = new SystemLogQueryDTO();

        // 模拟Service方法
        when(systemLogService.getLogPage(anyLong(), anyLong(), any(SystemLogQueryDTO.class)))
                .thenReturn(pageResult);

        // 执行测试
        Result<PageResult<SystemLog>> result = systemLogController.getLogPage(1L, 10L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertNotNull(result.getData());

        // 验证Service方法调用
        verify(systemLogService, times(1)).getLogPage(eq(1L), eq(10L), any(SystemLogQueryDTO.class));
    }

    @Test
    @DisplayName("测试大分页查询")
    void testGetLogPageWithLargePage() {
        // 准备测试数据
        SystemLogQueryDTO queryDTO = new SystemLogQueryDTO();
        
        // 创建大分页结果
        PageResult<SystemLog> largePageResult = new PageResult<>();
        largePageResult.setContent(Arrays.asList(testLog));
        largePageResult.setPage(50L);
        largePageResult.setSize(100L);
        largePageResult.setTotal(10000L);
        largePageResult.setTotalPages(100L);

        // 模拟Service方法
        when(systemLogService.getLogPage(eq(50L), eq(100L), any(SystemLogQueryDTO.class)))
                .thenReturn(largePageResult);

        // 执行测试
        Result<PageResult<SystemLog>> result = systemLogController.getLogPage(50L, 100L, queryDTO);

        // 验证结果
        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertEquals(10000L, result.getData().getTotal());
        assertEquals(50L, result.getData().getPage());
        assertEquals(100L, result.getData().getSize());

        // 验证Service方法调用
        verify(systemLogService, times(1)).getLogPage(eq(50L), eq(100L), any(SystemLogQueryDTO.class));
    }
}