package com.erp.user.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.user.entity.SystemStatus;
import com.erp.user.enums.ServiceStatus;
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
 * 系统状态Mapper层测试
 * 测试BaseMapperPlus的增强方法和QueryWrapperUtils条件筛选
 * 
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("系统状态Mapper层测试")
class SystemStatusMapperTest {
    
    @Autowired
    private SystemStatusMapper systemStatusMapper;
    
    @Test
    @DisplayName("测试BaseMapperPlus基本CRUD操作")
    void testBaseMapperPlusCrud() {
        // 准备测试数据
        SystemStatus status = new SystemStatus();
        status.setServiceName("测试服务");
        status.setServiceStatus(ServiceStatus.UP);
        status.setServiceUrl("http://localhost:8080/health");
        status.setResponseTime(120L);
        status.setLastCheckTime(LocalDateTime.now());
        
        Map<String, Object> healthDetails = new HashMap<>();
        healthDetails.put("status", "UP");
        healthDetails.put("diskSpace", Map.of("status", "UP", "total", 1000000000L, "free", 800000000L));
        status.setHealthDetails(healthDetails);
        
        status.setFailureCount(0);
        status.setMonitorEnabled(true);
        status.setMonitorInterval(60);
        
        // 测试插入
        int insertResult = systemStatusMapper.insert(status);
        assertThat(insertResult).isEqualTo(1);
        assertThat(status.getId()).isNotNull();
        
        // 测试根据ID查询
        SystemStatus savedStatus = systemStatusMapper.selectById(status.getId());
        assertThat(savedStatus).isNotNull();
        assertThat(savedStatus.getServiceName()).isEqualTo("测试服务");
        assertThat(savedStatus.getServiceStatus()).isEqualTo(ServiceStatus.UP);
        assertThat(savedStatus.getHealthDetails().get("status")).isEqualTo("UP");
        
        // 测试更新
        savedStatus.setServiceStatus(ServiceStatus.DOWN);
        savedStatus.setFailureCount(1);
        int updateResult = systemStatusMapper.updateById(savedStatus);
        assertThat(updateResult).isEqualTo(1);
        
        // 验证更新结果
        SystemStatus updatedStatus = systemStatusMapper.selectById(status.getId());
        assertThat(updatedStatus.getServiceStatus()).isEqualTo(ServiceStatus.DOWN);
        assertThat(updatedStatus.getFailureCount()).isEqualTo(1);
        
        // 测试逻辑删除
        int deleteResult = systemStatusMapper.deleteById(status.getId());
        assertThat(deleteResult).isEqualTo(1);
        
        // 验证逻辑删除结果
        SystemStatus deletedStatus = systemStatusMapper.selectById(status.getId());
        assertThat(deletedStatus).isNull(); // 逻辑删除后查询不到
    }
    
    @Test
    @DisplayName("测试BaseMapperPlus增强查询方法")
    void testBaseMapperPlusEnhancedMethods() {
        // 准备测试数据
        SystemStatus upStatus = createTestStatus("正常服务", ServiceStatus.UP, true, 60);
        SystemStatus downStatus = createTestStatus("异常服务", ServiceStatus.DOWN, true, 60);
        SystemStatus disabledStatus = createTestStatus("禁用监控服务", ServiceStatus.UP, false, 120);
        
        systemStatusMapper.insert(upStatus);
        systemStatusMapper.insert(downStatus);
        systemStatusMapper.insert(disabledStatus);
        
        // 测试selectCountByCondition方法
        LambdaQueryWrapper<SystemStatus> countWrapper = QueryWrapperUtils.lambdaQuery(SystemStatus.class);
        QueryWrapperUtils.eqIfPresent(countWrapper, SystemStatus::getServiceStatus, ServiceStatus.UP);
        Long upServiceCount = systemStatusMapper.selectCountByCondition(countWrapper);
        assertThat(upServiceCount).isEqualTo(2L);
        
        // 测试existsByCondition方法
        LambdaQueryWrapper<SystemStatus> existsWrapper = QueryWrapperUtils.lambdaQuery(SystemStatus.class);
        QueryWrapperUtils.eqIfPresent(existsWrapper, SystemStatus::getServiceName, "正常服务");
        boolean exists = systemStatusMapper.existsByCondition(existsWrapper);
        assertThat(exists).isTrue();
        
        // 测试selectAllByCondition方法
        LambdaQueryWrapper<SystemStatus> listWrapper = QueryWrapperUtils.lambdaQuery(SystemStatus.class);
        QueryWrapperUtils.eqIfPresent(listWrapper, SystemStatus::getMonitorEnabled, true);
        QueryWrapperUtils.orderByDesc(listWrapper, SystemStatus::getCreateTime);
        List<SystemStatus> monitorEnabledServices = systemStatusMapper.selectAllByCondition(listWrapper);
        assertThat(monitorEnabledServices).hasSize(2);
        assertThat(monitorEnabledServices.stream().allMatch(SystemStatus::getMonitorEnabled)).isTrue();
        
        // 清理测试数据
        systemStatusMapper.deleteById(upStatus.getId());
        systemStatusMapper.deleteById(downStatus.getId());
        systemStatusMapper.deleteById(disabledStatus.getId());
    }
    
    @Test
    @DisplayName("测试QueryWrapperUtils条件构建")
    void testQueryWrapperUtilsConditionBuilding() {
        // 准备测试数据
        SystemStatus webService = createTestStatus("Web服务", ServiceStatus.UP, true, 60);
        webService.setResponseTime(100L);
        
        SystemStatus dbService = createTestStatus("数据库服务", ServiceStatus.DOWN, true, 120);
        dbService.setResponseTime(5000L);
        dbService.setFailureCount(3);
        
        SystemStatus cacheService = createTestStatus("缓存服务", ServiceStatus.DEGRADED, false, 60);
        cacheService.setResponseTime(200L);
        
        systemStatusMapper.insert(webService);
        systemStatusMapper.insert(dbService);
        systemStatusMapper.insert(cacheService);
        
        // 测试服务状态筛选
        LambdaQueryWrapper<SystemStatus> statusWrapper = QueryWrapperUtils.lambdaQuery(SystemStatus.class);
        QueryWrapperUtils.eqIfPresent(statusWrapper, SystemStatus::getServiceStatus, ServiceStatus.UP);
        List<SystemStatus> upServices = systemStatusMapper.selectAllByCondition(statusWrapper);
        assertThat(upServices).hasSize(1);
        assertThat(upServices.get(0).getServiceName()).isEqualTo("Web服务");
        
        // 测试监控启用状态筛选
        LambdaQueryWrapper<SystemStatus> monitorWrapper = QueryWrapperUtils.lambdaQuery(SystemStatus.class);
        QueryWrapperUtils.eqIfPresent(monitorWrapper, SystemStatus::getMonitorEnabled, true);
        List<SystemStatus> monitoredServices = systemStatusMapper.selectAllByCondition(monitorWrapper);
        assertThat(monitoredServices).hasSize(2);
        
        // 测试响应时间范围查询
        LambdaQueryWrapper<SystemStatus> responseTimeWrapper = QueryWrapperUtils.lambdaQuery(SystemStatus.class);
        QueryWrapperUtils.geIfPresent(responseTimeWrapper, SystemStatus::getResponseTime, 1000L);
        List<SystemStatus> slowServices = systemStatusMapper.selectAllByCondition(responseTimeWrapper);
        assertThat(slowServices).hasSize(1);
        assertThat(slowServices.get(0).getServiceName()).isEqualTo("数据库服务");
        
        // 测试复合条件查询
        LambdaQueryWrapper<SystemStatus> complexWrapper = QueryWrapperUtils.lambdaQuery(SystemStatus.class);
        QueryWrapperUtils.eqIfPresent(complexWrapper, SystemStatus::getMonitorEnabled, true);
        QueryWrapperUtils.leIfPresent(complexWrapper, SystemStatus::getResponseTime, 1000L);
        QueryWrapperUtils.orderByAsc(complexWrapper, SystemStatus::getResponseTime);
        List<SystemStatus> fastMonitoredServices = systemStatusMapper.selectAllByCondition(complexWrapper);
        assertThat(fastMonitoredServices).hasSize(1);
        assertThat(fastMonitoredServices.get(0).getServiceName()).isEqualTo("Web服务");
        
        // 清理测试数据
        systemStatusMapper.deleteById(webService.getId());
        systemStatusMapper.deleteById(dbService.getId());
        systemStatusMapper.deleteById(cacheService.getId());
    }
    
    @Test
    @DisplayName("测试分页查询功能")
    void testPaginationQuery() {
        // 准备测试数据
        for (int i = 1; i <= 25; i++) {
            SystemStatus status = createTestStatus("服务" + i, 
                                                 i % 3 == 0 ? ServiceStatus.DOWN : ServiceStatus.UP, 
                                                 true, 
                                                 60);
            status.setResponseTime((long) (100 + i * 10));
            systemStatusMapper.insert(status);
        }
        
        // 测试分页查询
        Page<SystemStatus> page = new Page<>(1, 10);
        LambdaQueryWrapper<SystemStatus> wrapper = QueryWrapperUtils.lambdaQuery(SystemStatus.class);
        QueryWrapperUtils.likeIfPresent(wrapper, SystemStatus::getServiceName, "服务");
        QueryWrapperUtils.orderByAsc(wrapper, SystemStatus::getResponseTime);
        
        IPage<SystemStatus> pageResult = systemStatusMapper.selectStatusPage(page, wrapper);
        
        assertThat(pageResult.getTotal()).isEqualTo(25L);
        assertThat(pageResult.getPages()).isEqualTo(3L);
        assertThat(pageResult.getCurrent()).isEqualTo(1L);
        assertThat(pageResult.getSize()).isEqualTo(10L);
        assertThat(pageResult.getRecords()).hasSize(10);
        
        // 验证排序正确性（按响应时间升序）
        List<SystemStatus> records = pageResult.getRecords();
        for (int i = 0; i < records.size() - 1; i++) {
            assertThat(records.get(i).getResponseTime()).isLessThanOrEqualTo(records.get(i + 1).getResponseTime());
        }
        
        // 清理测试数据
        LambdaQueryWrapper<SystemStatus> deleteWrapper = QueryWrapperUtils.lambdaQuery(SystemStatus.class);
        QueryWrapperUtils.likeIfPresent(deleteWrapper, SystemStatus::getServiceName, "服务");
        systemStatusMapper.delete(deleteWrapper);
    }
    
    @Test
    @DisplayName("测试自定义查询方法")
    void testCustomQueryMethods() {
        // 准备测试数据
        SystemStatus upService = createTestStatus("正常服务测试", ServiceStatus.UP, true, 60);
        upService.setResponseTime(150L);
        
        SystemStatus downService = createTestStatus("异常服务测试", ServiceStatus.DOWN, true, 60);
        downService.setFailureCount(5);
        downService.setErrorMessage("连接超时");
        
        SystemStatus degradedService = createTestStatus("降级服务测试", ServiceStatus.DEGRADED, false, 120);
        
        systemStatusMapper.insert(upService);
        systemStatusMapper.insert(downService);
        systemStatusMapper.insert(degradedService);
        
        // 测试根据服务名称查询
        SystemStatus foundService = systemStatusMapper.selectByServiceName("正常服务测试");
        assertThat(foundService).isNotNull();
        assertThat(foundService.getServiceStatus()).isEqualTo(ServiceStatus.UP);
        
        // 测试根据服务状态查询
        List<SystemStatus> upServices = systemStatusMapper.selectByServiceStatus(ServiceStatus.UP);
        assertThat(upServices).isNotEmpty();
        assertThat(upServices.stream().allMatch(service -> service.getServiceStatus() == ServiceStatus.UP)).isTrue();
        
        // 测试查询启用监控的服务
        List<SystemStatus> monitoredServices = systemStatusMapper.selectMonitorEnabledServices();
        assertThat(monitoredServices).hasSize(2);
        assertThat(monitoredServices.stream().allMatch(SystemStatus::getMonitorEnabled)).isTrue();
        
        // 测试状态统计
        List<Map<String, Object>> statusStats = systemStatusMapper.selectServiceStatusStats();
        assertThat(statusStats).isNotEmpty();
        
        Long upCount = systemStatusMapper.countByServiceStatus(ServiceStatus.UP);
        assertThat(upCount).isGreaterThan(0L);
        
        // 测试异常服务查询
        List<SystemStatus> abnormalServices = systemStatusMapper.selectAbnormalServices();
        assertThat(abnormalServices).hasSize(2); // DOWN 和 DEGRADED 服务
        
        // 测试慢响应服务查询
        List<SystemStatus> slowServices = systemStatusMapper.selectSlowResponseServices(100L);
        assertThat(slowServices).hasSize(1);
        assertThat(slowServices.get(0).getResponseTime()).isGreaterThan(100L);
        
        // 测试平均响应时间
        Double avgResponseTime = systemStatusMapper.selectAverageResponseTime();
        assertThat(avgResponseTime).isNotNull();
        
        // 测试系统健康度
        Double healthPercentage = systemStatusMapper.selectSystemHealthPercentage();
        assertThat(healthPercentage).isNotNull();
        assertThat(healthPercentage).isBetween(0.0, 100.0);
        
        // 清理测试数据
        systemStatusMapper.deleteById(upService.getId());
        systemStatusMapper.deleteById(downService.getId());
        systemStatusMapper.deleteById(degradedService.getId());
    }
    
    @Test
    @DisplayName("测试健康检查相关方法")
    void testHealthCheckMethods() {
        // 准备测试数据
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneMinuteAgo = now.minusMinutes(1);
        
        SystemStatus service1 = createTestStatus("需要检查的服务1", ServiceStatus.UP, true, 60);
        service1.setLastCheckTime(oneMinuteAgo.minusMinutes(2)); // 3分钟前检查过
        
        SystemStatus service2 = createTestStatus("需要检查的服务2", ServiceStatus.UP, true, 120);
        service2.setLastCheckTime(null); // 从未检查过
        
        SystemStatus service3 = createTestStatus("最近检查过的服务", ServiceStatus.UP, true, 60);
        service3.setLastCheckTime(now.minusSeconds(30)); // 30秒前检查过
        
        systemStatusMapper.insert(service1);
        systemStatusMapper.insert(service2);
        systemStatusMapper.insert(service3);
        
        // 测试查询需要健康检查的服务
        List<SystemStatus> servicesForCheck = systemStatusMapper.selectServicesForHealthCheck(now);
        assertThat(servicesForCheck).hasSize(2); // service1 和 service2
        
        // 测试更新健康检查结果
        int updateResult = systemStatusMapper.updateHealthCheckResult(
            "需要检查的服务1", 
            ServiceStatus.UP, 
            200L, 
            now, 
            null, 
            0
        );
        assertThat(updateResult).isEqualTo(1);
        
        // 验证更新结果
        SystemStatus updatedService = systemStatusMapper.selectByServiceName("需要检查的服务1");
        assertThat(updatedService.getResponseTime()).isEqualTo(200L);
        assertThat(updatedService.getFailureCount()).isEqualTo(0);
        
        // 测试重置失败计数
        int resetResult = systemStatusMapper.resetFailureCount("需要检查的服务1");
        assertThat(resetResult).isEqualTo(1);
        
        // 清理测试数据
        systemStatusMapper.deleteById(service1.getId());
        systemStatusMapper.deleteById(service2.getId());
        systemStatusMapper.deleteById(service3.getId());
    }
    
    /**
     * 创建测试系统状态对象
     */
    private SystemStatus createTestStatus(String serviceName, ServiceStatus serviceStatus, boolean monitorEnabled, int monitorInterval) {
        SystemStatus status = new SystemStatus();
        status.setServiceName(serviceName);
        status.setServiceStatus(serviceStatus);
        status.setServiceUrl("http://localhost:8080/health");
        status.setResponseTime(100L);
        status.setLastCheckTime(LocalDateTime.now());
        
        Map<String, Object> healthDetails = new HashMap<>();
        healthDetails.put("status", serviceStatus.getCode());
        healthDetails.put("timestamp", System.currentTimeMillis());
        status.setHealthDetails(healthDetails);
        
        status.setFailureCount(0);
        status.setMonitorEnabled(monitorEnabled);
        status.setMonitorInterval(monitorInterval);
        
        return status;
    }
}