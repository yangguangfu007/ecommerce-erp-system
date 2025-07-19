package com.erp.order.service;

import com.erp.order.dto.OrderDTO;
import com.erp.order.entity.Order;
import com.erp.order.mapper.OrderMapper;
import com.erp.order.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 订单服务单元测试类
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
public class OrderServiceUnitTest {

    @Mock
    private OrderMapper orderMapper;
    
    @Mock
    private com.erp.order.mapper.OrderItemMapper orderItemMapper;
    
    @Mock
    private com.erp.order.service.OrderStatusHistoryService orderStatusHistoryService;
    
    @Mock
    private com.erp.order.service.InventoryLockService inventoryLockService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Order testOrder;

    @BeforeEach
    void setUp() {
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setStoreId(1L);
        testOrder.setCustomerName("测试客户");
        testOrder.setCustomerEmail("test@example.com");
        testOrder.setTotalAmount(new BigDecimal("199.98"));
        testOrder.setStatus(Order.OrderStatus.PENDING);
        testOrder.setCreateTime(LocalDateTime.now());
    }

    @Test
    void testGetOrderById() {
        // Given
        when(orderMapper.selectOrderWithItems(1L)).thenReturn(testOrder);

        // When
        OrderDTO result = orderService.getOrderById(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("测试客户", result.getCustomerName());
        assertEquals("test@example.com", result.getCustomerEmail());
        assertEquals(new BigDecimal("199.98"), result.getTotalAmount());
        assertEquals("PENDING", result.getStatus());

        verify(orderMapper, times(1)).selectOrderWithItems(1L);
    }

    @Test
    void testGetOrderByIdNotFound() {
        // Given
        when(orderMapper.selectOrderWithItems(999L)).thenReturn(null);

        // When
        OrderDTO result = orderService.getOrderById(999L);

        // Then
        assertNull(result);
        verify(orderMapper, times(1)).selectOrderWithItems(999L);
    }

    @Test
    void testUpdateOrderStatus() {
        // Given
        when(orderMapper.selectById(1L)).thenReturn(testOrder);
        when(orderMapper.updateById(any(Order.class))).thenReturn(1);
        when(orderStatusHistoryService.recordStatusChange(any(), any(), any(), any(), any())).thenReturn(true);
        when(inventoryLockService.consumeInventoryLock(any())).thenReturn(true);

        // When
        boolean result = orderService.updateOrderStatus(1L, Order.OrderStatus.CONFIRMED, "测试确认", "TEST_USER");

        // Then
        assertTrue(result);
        verify(orderMapper, times(1)).selectById(1L);
        verify(orderMapper, times(1)).updateById(any(Order.class));
        verify(orderStatusHistoryService, times(1)).recordStatusChange(any(), any(), any(), any(), any());
    }

    @Test
    void testUpdateOrderStatusNotFound() {
        // Given
        when(orderMapper.selectById(999L)).thenReturn(null);

        // When & Then
        assertThrows(com.erp.common.exception.BusinessException.class, () -> {
            orderService.updateOrderStatus(999L, Order.OrderStatus.CONFIRMED, "测试确认", "TEST_USER");
        });

        verify(orderMapper, times(1)).selectById(999L);
        verify(orderMapper, never()).updateById(any(Order.class));
    }

    @Test
    void testDeleteOrder() {
        // Given
        when(orderMapper.selectById(1L)).thenReturn(testOrder);
        when(orderItemMapper.deleteByOrderId(1L)).thenReturn(1);
        when(orderMapper.deleteById(1L)).thenReturn(1);

        // When
        boolean result = orderService.deleteOrder(1L);

        // Then
        assertTrue(result);
        verify(orderMapper, times(1)).selectById(1L);
        verify(orderItemMapper, times(1)).deleteByOrderId(1L);
        verify(orderMapper, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteOrderNotFound() {
        // Given
        when(orderMapper.selectById(999L)).thenReturn(null);

        // When & Then
        assertThrows(com.erp.common.exception.BusinessException.class, () -> {
            orderService.deleteOrder(999L);
        });

        verify(orderMapper, times(1)).selectById(999L);
        verify(orderMapper, never()).deleteById(999L);
    }
}