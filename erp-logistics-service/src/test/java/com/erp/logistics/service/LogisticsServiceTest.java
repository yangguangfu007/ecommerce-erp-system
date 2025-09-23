package com.erp.logistics.service;

import com.erp.common.response.PageResult;
import com.erp.logistics.dto.LogisticsOrderDTO;
import com.erp.logistics.dto.LogisticsOrderQueryDTO;
import com.erp.logistics.entity.LogisticsOrder;
import com.erp.logistics.enums.LogisticsStatus;
import com.erp.logistics.enums.LogisticsType;
import com.erp.logistics.mapper.LogisticsOrderMapper;
import com.erp.logistics.service.impl.LogisticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * 物流服务测试
 * 测试BaseServicePlus的增强方法和业务逻辑
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("物流服务测试")
class LogisticsServiceTest {

    @Mock
    private LogisticsOrderMapper logisticsOrderMapper;

    @InjectMocks
    private LogisticsServiceImpl logisticsService;

    private LogisticsOrderDTO testOrderDTO;
    private LogisticsOrder testOrder;

    @BeforeEach
    void setUp() {
        // 准备测试数据
        testOrderDTO = createTestLogisticsOrderDTO();
        testOrder = createTestLogisticsOrder();
    }

    @Test
    @DisplayName("测试创建物流订单")
    void testCreateLogisticsOrder() {
        // Mock 查询不存在的订单
        when(logisticsOrderMapper.selectOne(any())).thenReturn(null);
        when(logisticsOrderMapper.insert(any(LogisticsOrder.class))).thenReturn(1);
        
        // 执行创建
        LogisticsOrder result = logisticsService.createLogisticsOrder(testOrderDTO);
        
        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getBusinessOrderId()).isEqualTo(testOrderDTO.getBusinessOrderId());
        assertThat(result.getProviderName()).isEqualTo(testOrderDTO.getProviderName());
        assertThat(result.getStatus()).isEqualTo(LogisticsStatus.PENDING);
        assertThat(result.getCurrency()).isEqualTo("CNY");
        assertThat(result.getLogisticsOrderNo()).isNotNull();
        
        // 验证方法调用
        verify(logisticsOrderMapper).selectOne(any());
        verify(logisticsOrderMapper).insert(any(LogisticsOrder.class));
    }

    @Test
    @DisplayName("测试创建重复物流订单抛出异常")
    void testCreateDuplicateLogisticsOrderThrowsException() {
        // Mock 查询到已存在的订单
        when(logisticsOrderMapper.selectOne(any())).thenReturn(testOrder);
        
        // 验证抛出异常
        assertThatThrownBy(() -> logisticsService.createLogisticsOrder(testOrderDTO))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("业务订单已存在物流订单");
        
        // 验证不会执行插入
        verify(logisticsOrderMapper, never()).insert(any());
    }

    @Test
    @DisplayName("测试更新物流订单")
    void testUpdateLogisticsOrder() {
        Long orderId = 1L;
        
        // Mock 查询现有订单
        when(logisticsOrderMapper.selectById(orderId)).thenReturn(testOrder);
        when(logisticsOrderMapper.updateById(any(LogisticsOrder.class))).thenReturn(1);
        
        // 准备更新数据
        LogisticsOrderDTO updateDTO = new LogisticsOrderDTO();
        updateDTO.setProviderName("更新后的物流商");
        updateDTO.setRemarks("更新后的备注");
        
        // 执行更新
        LogisticsOrder result = logisticsService.updateLogisticsOrder(orderId, updateDTO);
        
        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getProviderName()).isEqualTo("更新后的物流商");
        assertThat(result.getRemarks()).isEqualTo("更新后的备注");
        
        // 验证方法调用
        verify(logisticsOrderMapper).selectById(orderId);
        verify(logisticsOrderMapper).updateById(any(LogisticsOrder.class));
    }

    @Test
    @DisplayName("测试更新不存在的物流订单抛出异常")
    void testUpdateNonExistentLogisticsOrderThrowsException() {
        Long orderId = 999L;
        
        // Mock 查询不到订单
        when(logisticsOrderMapper.selectById(orderId)).thenReturn(null);
        
        // 验证抛出异常
        assertThatThrownBy(() -> logisticsService.updateLogisticsOrder(orderId, testOrderDTO))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("物流订单不存在");
        
        // 验证不会执行更新
        verify(logisticsOrderMapper, never()).updateById(any());
    }

    @Test
    @DisplayName("测试根据业务订单ID查询物流订单")
    void testGetLogisticsOrderByBusinessOrderId() {
        Long businessOrderId = 1001L;
        
        // Mock 查询结果
        when(logisticsOrderMapper.selectOne(any())).thenReturn(testOrder);
        
        // 执行查询
        LogisticsOrder result = logisticsService.getLogisticsOrderByBusinessOrderId(businessOrderId);
        
        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getBusinessOrderId()).isEqualTo(testOrder.getBusinessOrderId());
        
        // 验证方法调用
        verify(logisticsOrderMapper).selectOne(any());
    }

    @Test
    @DisplayName("测试根据运单号查询物流订单")
    void testGetLogisticsOrderByTrackingNumber() {
        String trackingNumber = "SF1234567890";
        
        // Mock 查询结果
        when(logisticsOrderMapper.selectOne(any())).thenReturn(testOrder);
        
        // 执行查询
        LogisticsOrder result = logisticsService.getLogisticsOrderByTrackingNumber(trackingNumber);
        
        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.getTrackingNumber()).isEqualTo(testOrder.getTrackingNumber());
        
        // 验证方法调用
        verify(logisticsOrderMapper).selectOne(any());
    }

    @Test
    @DisplayName("测试批量更新物流状态")
    void testBatchUpdateStatus() {
        List<String> trackingNumbers = Arrays.asList("SF1234567890", "ZTO1234567890", "YTO1234567890");
        LogisticsStatus newStatus = LogisticsStatus.IN_TRANSIT;
        
        // Mock 更新结果
        when(logisticsOrderMapper.update(any(), any())).thenReturn(3);
        
        // 执行批量更新
        int result = logisticsService.batchUpdateStatus(trackingNumbers, newStatus);
        
        // 验证结果
        assertThat(result).isEqualTo(3);
        
        // 验证方法调用
        verify(logisticsOrderMapper).update(any(), any());
    }

    @Test
    @DisplayName("测试批量更新空运单号列表")
    void testBatchUpdateStatusWithEmptyList() {
        List<String> emptyList = Arrays.asList();
        LogisticsStatus newStatus = LogisticsStatus.IN_TRANSIT;
        
        // 执行批量更新
        int result = logisticsService.batchUpdateStatus(emptyList, newStatus);
        
        // 验证结果
        assertThat(result).isEqualTo(0);
        
        // 验证不会调用更新方法
        verify(logisticsOrderMapper, never()).update(any(), any());
    }

    @Test
    @DisplayName("测试批量更新null运单号列表")
    void testBatchUpdateStatusWithNullList() {
        LogisticsStatus newStatus = LogisticsStatus.IN_TRANSIT;
        
        // 执行批量更新
        int result = logisticsService.batchUpdateStatus(null, newStatus);
        
        // 验证结果
        assertThat(result).isEqualTo(0);
        
        // 验证不会调用更新方法
        verify(logisticsOrderMapper, never()).update(any(), any());
    }

    @Test
    @DisplayName("测试BaseServicePlus基本方法")
    void testBaseServicePlusMethods() {
        // Mock 基本CRUD操作
        when(logisticsOrderMapper.insert(any(LogisticsOrder.class))).thenReturn(1);
        when(logisticsOrderMapper.selectById(anyLong())).thenReturn(testOrder);
        when(logisticsOrderMapper.updateById(any(LogisticsOrder.class))).thenReturn(1);
        when(logisticsOrderMapper.deleteById(anyLong())).thenReturn(1);
        
        // 测试保存
        boolean saveResult = logisticsService.save(testOrder);
        assertThat(saveResult).isTrue();
        
        // 测试根据ID查询
        LogisticsOrder getResult = logisticsService.getById(1L);
        assertThat(getResult).isNotNull();
        
        // 测试更新
        boolean updateResult = logisticsService.updateById(testOrder);
        assertThat(updateResult).isTrue();
        
        // 测试删除
        boolean deleteResult = logisticsService.removeById(1L);
        assertThat(deleteResult).isTrue();
        
        // 验证方法调用
        verify(logisticsOrderMapper).insert(any(LogisticsOrder.class));
        verify(logisticsOrderMapper).selectById(anyLong());
        verify(logisticsOrderMapper).updateById(any(LogisticsOrder.class));
        verify(logisticsOrderMapper).deleteById(anyLong());
    }

    @Test
    @DisplayName("测试订单号生成")
    void testLogisticsOrderNoGeneration() {
        // 准备不包含订单号的DTO
        LogisticsOrderDTO dtoWithoutOrderNo = createTestLogisticsOrderDTO();
        dtoWithoutOrderNo.setLogisticsOrderNo(null);
        
        // Mock 查询不存在的订单
        when(logisticsOrderMapper.selectOne(any())).thenReturn(null);
        when(logisticsOrderMapper.insert(any(LogisticsOrder.class))).thenReturn(1);
        
        // 执行创建
        LogisticsOrder result = logisticsService.createLogisticsOrder(dtoWithoutOrderNo);
        
        // 验证订单号已生成
        assertThat(result.getLogisticsOrderNo()).isNotNull();
        assertThat(result.getLogisticsOrderNo()).startsWith("LO");
        assertThat(result.getLogisticsOrderNo().length()).isGreaterThan(10);
    }

    @Test
    @DisplayName("测试默认值设置")
    void testDefaultValueSetting() {
        // 准备最小化的DTO
        LogisticsOrderDTO minimalDTO = new LogisticsOrderDTO();
        minimalDTO.setBusinessOrderId(1001L);
        minimalDTO.setProviderName("测试物流商");
        minimalDTO.setProviderCode("TEST");
        
        // Mock 查询不存在的订单
        when(logisticsOrderMapper.selectOne(any())).thenReturn(null);
        when(logisticsOrderMapper.insert(any(LogisticsOrder.class))).thenReturn(1);
        
        // 执行创建
        LogisticsOrder result = logisticsService.createLogisticsOrder(minimalDTO);
        
        // 验证默认值
        assertThat(result.getStatus()).isEqualTo(LogisticsStatus.PENDING);
        assertThat(result.getCurrency()).isEqualTo("CNY");
        assertThat(result.getLogisticsOrderNo()).isNotNull();
    }

    /**
     * 创建测试用的物流订单DTO
     */
    private LogisticsOrderDTO createTestLogisticsOrderDTO() {
        LogisticsOrderDTO dto = new LogisticsOrderDTO();
        dto.setLogisticsOrderNo("LO202501010001");
        dto.setBusinessOrderId(1001L);
        dto.setBusinessOrderNo("BO202501010001");
        dto.setLogisticsType(LogisticsType.STANDARD);
        dto.setStatus(LogisticsStatus.PENDING);
        dto.setProviderName("顺丰速运");
        dto.setProviderCode("SF");
        dto.setTrackingNumber("SF1234567890");
        dto.setShippingCost(new BigDecimal("15.50"));
        dto.setCurrency("CNY");
        dto.setServiceLevel("标准快递");
        dto.setRequireSignature(true);
        dto.setInsured(false);
        dto.setRemarks("测试订单");
        return dto;
    }

    /**
     * 创建测试用的物流订单
     */
    private LogisticsOrder createTestLogisticsOrder() {
        LogisticsOrder order = new LogisticsOrder();
        order.setId(1L);
        order.setLogisticsOrderNo("LO202501010001");
        order.setBusinessOrderId(1001L);
        order.setBusinessOrderNo("BO202501010001");
        order.setLogisticsType(LogisticsType.STANDARD);
        order.setStatus(LogisticsStatus.PENDING);
        order.setProviderName("顺丰速运");
        order.setProviderCode("SF");
        order.setTrackingNumber("SF1234567890");
        order.setShippingCost(new BigDecimal("15.50"));
        order.setCurrency("CNY");
        order.setServiceLevel("标准快递");
        order.setRequireSignature(true);
        order.setInsured(false);
        order.setRemarks("测试订单");
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        order.setDeleted(0);
        order.setVersion(1);
        return order;
    }
}