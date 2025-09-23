package com.erp.user.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.user.entity.SystemLog;
import com.erp.user.enums.LogLevel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 系统日志Mapper层测试
 * 测试BaseMapperPlus的分页查询和QueryWrapperUtils条件筛选性能
 * 
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("系统日志Mapper层测试")
class SystemLogMapperTest {
    
    @Autowired
    private SystemLogMapper systemLogMapper;
    
    @Test
    @DisplayName("测试BaseMapperPlus基本CRUD操作")
    void testBaseMapperPlusCrud() {
        // 准备测试数据
        SystemLog log = new SystemLog();
        log.setLogLevel(LogLevel.INFO);
        log.setMessage("测试日志消息");
        log.setModuleName("测试模块");
        log.setUserId(1001L);
        log.setUsername("testuser");
        log.setClientIp("192.168.1.100");
        log.setUserAgent("Test User Agent");
        log.setRequestUri("/api/test");
        log.setRequestMethod("POST");
        
        Map<String, Object> requestParams = new HashMap<>();
        requestParams.put("param1", "value1");
        requestParams.put("param2", 123);
        log.setRequestParams(requestParams);
        
        log.setResponseStatus(200);
        log.setExecutionTime(150L);
        
        // 测试插入
        int insertResult = systemLogMapper.insert(log);
        assertThat(insertResult).isEqualTo(1);
        assertThat(log.getId()).isNotNull();
        
        // 测试根据ID查询
        SystemLog savedLog = systemLogMapper.selectById(log.getId());
        assertThat(savedLog).isNotNull();
        assertThat(savedLog.getMessage()).isEqualTo("测试日志消息");
        assertThat(savedLog.getLogLevel()).isEqualTo(LogLevel.INFO);
        assertThat(savedLog.getRequestParams().get("param1")).isEqualTo("value1");
        
        // 测试更新
        savedLog.setMessage("更新后的日志消息");
        int updateResult = systemLogMapper.updateById(savedLog);
        assertThat(updateResult).isEqualTo(1);
        
        // 验证更新结果
        SystemLog updatedLog = systemLogMapper.selectById(log.getId());
        assertThat(updatedLog.getMessage()).isEqualTo("更新后的日志消息");
        
        // 测试逻辑删除
        int deleteResult = systemLogMapper.deleteById(log.getId());
        assertThat(deleteResult).isEqualTo(1);
        
        // 验证逻辑删除结果
        SystemLog deletedLog = systemLogMapper.selectById(log.getId());
        assertThat(deletedLog).isNull(); // 逻辑删除后查询不到
    }
    
    @Test
    @DisplayName("测试QueryWrapperUtils时间范围查询")
    void testQueryWrapperUtilsTimeRangeQuery() {
        // 准备测试数据
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAgo = now.minusHours(1);
        LocalDateTime twoHoursAgo = now.minusHours(2);
        
        SystemLog log1 = createTestLog("时间测试日志1", LogLevel.INFO, "模块1", twoHoursAgo);
        SystemLog log2 = createTestLog("时间测试日志2", LogLevel.WARN, "模块2", oneHourAgo);
        SystemLog log3 = createTestLog("时间测试日志3", LogLevel.ERROR, "模块3", now);
        
        systemLogMapper.insert(log1);
        systemLogMapper.insert(log2);
        systemLogMapper.insert(log3);
        
        // 测试betweenTime时间范围查询
        LambdaQueryWrapper<SystemLog> timeRangeWrapper = QueryWrapperUtils.lambdaQuery(SystemLog.class);
        QueryWrapperUtils.betweenTime(timeRangeWrapper, SystemLog::getCreateTime, oneHourAgo.minusMinutes(5), now.plusMinutes(5));
        List<SystemLog> timeRangeLogs = systemLogMapper.selectAllByCondition(timeRangeWrapper);
        assertThat(timeRangeLogs).hasSize(2); // log2 和 log3
        
        // 测试geIfPresent大于等于查询
        LambdaQueryWrapper<SystemLog> geWrapper = QueryWrapperUtils.lambdaQuery(SystemLog.class);
        QueryWrapperUtils.geIfPresent(geWrapper, SystemLog::getCreateTime, oneHourAgo);
        List<SystemLog> recentLogs = systemLogMapper.selectAllByCondition(geWrapper);
        assertThat(recentLogs).hasSize(2);
        
        // 测试leIfPresent小于等于查询
        LambdaQueryWrapper<SystemLog> leWrapper = QueryWrapperUtils.lambdaQuery(SystemLog.class);
        QueryWrapperUtils.leIfPresent(leWrapper, SystemLog::getCreateTime, oneHourAgo.plusMinutes(5));
        List<SystemLog> oldLogs = systemLogMapper.selectAllByCondition(leWrapper);
        assertThat(oldLogs).hasSize(2); // log1 和 log2
        
        // 清理测试数据
        systemLogMapper.deleteById(log1.getId());
        systemLogMapper.deleteById(log2.getId());
        systemLogMapper.deleteById(log3.getId());
    }
    
    @Test
    @DisplayName("测试日志级别和模块筛选")
    void testLogLevelAndModuleFiltering() {
        // 准备测试数据
        SystemLog infoLog = createTestLog("信息日志", LogLevel.INFO, "用户模块", LocalDateTime.now());
        SystemLog warnLog = createTestLog("警告日志", LogLevel.WARN, "订单模块", LocalDateTime.now());
        SystemLog errorLog = createTestLog("错误日志", LogLevel.ERROR, "用户模块", LocalDateTime.now());
        
        systemLogMapper.insert(infoLog);
        systemLogMapper.insert(warnLog);
        systemLogMapper.insert(errorLog);
        
        // 测试日志级别筛选
        LambdaQueryWrapper<SystemLog> levelWrapper = QueryWrapperUtils.lambdaQuery(SystemLog.class);
        QueryWrapperUtils.eqIfPresent(levelWrapper, SystemLog::getLogLevel, LogLevel.ERROR);
        List<SystemLog> errorLogs = systemLogMapper.selectAllByCondition(levelWrapper);
        assertThat(errorLogs).hasSize(1);
        assertThat(errorLogs.get(0).getLogLevel()).isEqualTo(LogLevel.ERROR);
        
        // 测试模块名称筛选
        LambdaQueryWrapper<SystemLog> moduleWrapper = QueryWrapperUtils.lambdaQuery(SystemLog.class);
        QueryWrapperUtils.eqIfPresent(moduleWrapper, SystemLog::getModuleName, "用户模块");
        List<SystemLog> userModuleLogs = systemLogMapper.selectAllByCondition(moduleWrapper);
        assertThat(userModuleLogs).hasSize(2); // infoLog 和 errorLog
        
        // 测试复合条件筛选
        LambdaQueryWrapper<SystemLog> complexWrapper = QueryWrapperUtils.lambdaQuery(SystemLog.class);
        QueryWrapperUtils.eqIfPresent(complexWrapper, SystemLog::getModuleName, "用户模块");
        QueryWrapperUtils.eqIfPresent(complexWrapper, SystemLog::getLogLevel, LogLevel.INFO);
        List<SystemLog> complexResults = systemLogMapper.selectAllByCondition(complexWrapper);
        assertThat(complexResults).hasSize(1);
        assertThat(complexResults.get(0).getMessage()).isEqualTo("信息日志");
        
        // 清理测试数据
        systemLogMapper.deleteById(infoLog.getId());
        systemLogMapper.deleteById(warnLog.getId());
        systemLogMapper.deleteById(errorLog.getId());
    }
    
    @Test
    @DisplayName("测试分页查询性能")
    void testPaginationQueryPerformance() {
        // 准备大量测试数据
        for (int i = 1; i <= 50; i++) {
            SystemLog log = createTestLog("批量测试日志" + i, 
                                        i % 4 == 0 ? LogLevel.ERROR : LogLevel.INFO, 
                                        "测试模块" + (i % 5), 
                                        LocalDateTime.now().minusMinutes(i));
            systemLogMapper.insert(log);
        }
        
        // 测试分页查询
        Page<SystemLog> page = new Page<>(1, 20);
        LambdaQueryWrapper<SystemLog> wrapper = QueryWrapperUtils.lambdaQuery(SystemLog.class);
        QueryWrapperUtils.likeIfPresent(wrapper, SystemLog::getMessage, "批量测试日志");
        QueryWrapperUtils.orderByDesc(wrapper, SystemLog::getCreateTime);
        
        IPage<SystemLog> pageResult = systemLogMapper.selectLogPage(page, wrapper);
        
        assertThat(pageResult.getTotal()).isEqualTo(50L);
        assertThat(pageResult.getPages()).isEqualTo(3L);
        assertThat(pageResult.getCurrent()).isEqualTo(1L);
        assertThat(pageResult.getSize()).isEqualTo(20L);
        assertThat(pageResult.getRecords()).hasSize(20);
        
        // 验证排序正确性（按创建时间降序）
        List<SystemLog> records = pageResult.getRecords();
        for (int i = 0; i < records.size() - 1; i++) {
            assertThat(records.get(i).getCreateTime()).isAfterOrEqualTo(records.get(i + 1).getCreateTime());
        }
        
        // 清理测试数据
        LambdaQueryWrapper<SystemLog> deleteWrapper = QueryWrapperUtils.lambdaQuery(SystemLog.class);
        QueryWrapperUtils.likeIfPresent(deleteWrapper, SystemLog::getMessage, "批量测试日志");
        systemLogMapper.delete(deleteWrapper);
    }
    
    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 准备测试数据
        SystemLog infoLog = createTestLog("自定义查询测试", LogLevel.INFO, "测试模块", LocalDateTime.now());
        SystemLog errorLog = createTestLog("错误日志测试", LogLevel.ERROR, "测试模块", LocalDateTime.now());
        SystemLog slowLog = createTestLog("慢查询测试", LogLevel.WARN, "数据库模块", LocalDateTime.now());
        slowLog.setExecutionTime(5000L); // 5秒执行时间
        
        systemLogMapper.insert(infoLog);
        systemLogMapper.insert(errorLog);
        systemLogMapper.insert(slowLog);
        
        // 测试根据日志级别查询
        List<SystemLog> errorLogs = systemLogMapper.selectByLogLevel(LogLevel.ERROR, 10);
        assertThat(errorLogs).isNotEmpty();
        assertThat(errorLogs.stream().allMatch(log -> log.getLogLevel() == LogLevel.ERROR)).isTrue();
        
        // 测试根据模块名称查询
        List<SystemLog> moduleLogs = systemLogMapper.selectByModuleName("测试模块", 10);
        assertThat(moduleLogs).hasSize(2);
        
        // 测试统计方法
        Long errorCount = systemLogMapper.countByLogLevel(LogLevel.ERROR);
        assertThat(errorCount).isGreaterThan(0L);
        
        // 测试时间范围统计
        LocalDateTime startTime = LocalDateTime.now().minusHours(1);
        LocalDateTime endTime = LocalDateTime.now().plusHours(1);
        Long timeRangeCount = systemLogMapper.countByTimeRange(startTime, endTime);
        assertThat(timeRangeCount).isGreaterThanOrEqualTo(3L);
        
        // 测试级别统计
        List<Map<String, Object>> levelStats = systemLogMapper.selectLogLevelStats();
        assertThat(levelStats).isNotEmpty();
        
        // 测试模块统计
        List<Map<String, Object>> moduleStats = systemLogMapper.selectModuleStats();
        assertThat(moduleStats).isNotEmpty();
        
        // 测试最近错误日志查询
        List<SystemLog> recentErrors = systemLogMapper.selectRecentErrors(5);
        assertThat(recentErrors).isNotEmpty();
        
        // 测试慢查询日志
        List<SystemLog> slowLogs = systemLogMapper.selectSlowLogs(1000L, 10);
        assertThat(slowLogs).hasSize(1);
        assertThat(slowLogs.get(0).getExecutionTime()).isGreaterThan(1000L);
        
        // 清理测试数据
        systemLogMapper.deleteById(infoLog.getId());
        systemLogMapper.deleteById(errorLog.getId());
        systemLogMapper.deleteById(slowLog.getId());
    }
    
    /**
     * 创建测试日志对象
     */
    private SystemLog createTestLog(String message, LogLevel logLevel, String moduleName, LocalDateTime createTime) {
        SystemLog log = new SystemLog();
        log.setLogLevel(logLevel);
        log.setMessage(message);
        log.setModuleName(moduleName);
        log.setUserId(1001L);
        log.setUsername("testuser");
        log.setClientIp("192.168.1.100");
        log.setUserAgent("Test User Agent");
        log.setRequestUri("/api/test");
        log.setRequestMethod("GET");
        
        Map<String, Object> requestParams = new HashMap<>();
        requestParams.put("testParam", "testValue");
        log.setRequestParams(requestParams);
        
        log.setResponseStatus(200);
        log.setExecutionTime(100L);
        log.setCreateTime(createTime);
        
        return log;
    }
}