package com.erp.order.service;

import com.erp.order.dto.AddressDTO;
import com.erp.order.dto.OrderDTO;
import com.erp.order.dto.OrderItemDTO;
import com.erp.order.dto.OrderQueryDTO;
import com.erp.order.entity.Order;
import com.erp.order.entity.OrderItem;
import com.erp.order.mapper.OrderMapper;
import com.erp.order.mapper.OrderItemMapper;
import com.erp.order.service.impl.OrderServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 订单服务测试类
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderMapper orderMapper;
    
    @Mock
    private OrderItemMapper orderItemMapper;
    
    @Mock
    private OrderStatusHistoryService orderStatusHistoryService;
    
    @Mock
    private InventoryLockService inventoryLockService;
    
    @Mock
    private OrderNotificationService orderNotificationService;
    
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private OrderServiceImpl orderService;

    private OrderDTO testOrderDTO;

    @BeforeEach
    void setUp() {
        // 准备测试数据
        testOrderDTO = createTestOrderDTO();
    }

    @Test
    void testCreateOrder() {
        // Mock数据准备
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setOrderId("ORD-123456");
        mockOrder.setStatus(Order.OrderStatus.PENDING);
        
        // Mock行为
        when(orderMapper.insert(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            return 1;
        });
        when(orderItemMapper.batchInsert(anyList())).thenReturn(2);
        when(orderStatusHistoryService.recordStatusChange(anyLong(), any(), anyString(), anyString(), anyString())).thenReturn(true);
        when(inventoryLockService.lockInventoryForOrder(anyLong(), anyList())).thenReturn(true);
        doNothing().when(orderNotificationService).sendOrderCreatedNotification(anyLong());
        when(kafkaTemplate.send(anyString(), anyString(), any())).thenReturn(null);
        
        // 测试创建订单
        Long orderId = orderService.createOrder(testOrderDTO);
        
        assertNotNull(orderId);
        assertEquals(1L, orderId);

        // 验证调用
        verify(orderMapper, times(1)).insert(any(Order.class));
        verify(orderItemMapper, times(1)).batchInsert(anyList());
        verify(orderStatusHistoryService, times(1)).recordStatusChange(anyLong(), any(), anyString(), anyString(), anyString());
        verify(inventoryLockService, times(1)).lockInventoryForOrder(anyLong(), anyList());
        verify(orderNotificationService, times(1)).sendOrderCreatedNotification(anyLong());
    }

    @Test
    void testGetOrderById() {
        // Mock数据准备
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setOrderId("ORD-123456");
        mockOrder.setCustomerName("测试客户");
        mockOrder.setCustomerEmail("test@example.com");
        mockOrder.setStatus(Order.OrderStatus.PENDING);
        mockOrder.setTotalAmount(new BigDecimal("199.98"));
        
        OrderItem item1 = new OrderItem();
        item1.setId(1L);
        item1.setOrderId(1L);
        item1.setSku("TEST-SKU-001");
        item1.setProductTitle("测试商品1");
        item1.setQuantity(1);
        item1.setUnitPrice(new BigDecimal("99.99"));
        
        OrderItem item2 = new OrderItem();
        item2.setId(2L);
        item2.setOrderId(1L);
        item2.setSku("TEST-SKU-002");
        item2.setProductTitle("测试商品2");
        item2.setQuantity(2);
        item2.setUnitPrice(new BigDecimal("49.99"));
        
        mockOrder.setOrderItems(Arrays.asList(item1, item2));
        
        // Mock行为
        when(orderMapper.selectOrderWithItems(1L)).thenReturn(mockOrder);
        
        // 测试查询订单
        OrderDTO order = orderService.getOrderById(1L);
        
        assertNotNull(order);
        assertEquals(1L, order.getId());
        assertEquals("测试客户", order.getCustomerName());
        assertEquals("test@example.com", order.getCustomerEmail());
        assertEquals("PENDING", order.getStatus());
        assertNotNull(order.getOrderItems());
        assertEquals(2, order.getOrderItems().size());
        
        verify(orderMapper, times(1)).selectOrderWithItems(1L);
    }

    @Test
    void testUpdateOrderStatus() {
        // Mock数据准备
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setStatus(Order.OrderStatus.PENDING);
        
        // Mock行为
        when(orderMapper.selectById(1L)).thenReturn(mockOrder);
        when(orderMapper.updateById(any(Order.class))).thenReturn(1);
        when(orderStatusHistoryService.recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString())).thenReturn(true);
        when(inventoryLockService.consumeInventoryLock(anyLong())).thenReturn(true);
        when(kafkaTemplate.send(anyString(), anyString(), any())).thenReturn(null);
        
        // 测试更新订单状态
        boolean result = orderService.updateOrderStatus(1L, Order.OrderStatus.CONFIRMED, "测试确认", "TEST_USER");
        
        assertTrue(result);
        
        // 验证调用
        verify(orderMapper, times(1)).selectById(1L);
        verify(orderMapper, times(1)).updateById(any(Order.class));
        verify(orderStatusHistoryService, times(1)).recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString());
        verify(inventoryLockService, times(1)).consumeInventoryLock(1L);
    }

    @Test
    void testConfirmOrder() {
        // Mock数据准备
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setStatus(Order.OrderStatus.PENDING);
        
        // Mock行为
        when(orderMapper.selectById(1L)).thenReturn(mockOrder);
        when(orderMapper.updateById(any(Order.class))).thenReturn(1);
        when(orderStatusHistoryService.recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString())).thenReturn(true);
        when(inventoryLockService.consumeInventoryLock(anyLong())).thenReturn(true);
        when(kafkaTemplate.send(anyString(), anyString(), any())).thenReturn(null);
        
        // 测试确认订单
        boolean result = orderService.confirmOrder(1L, "TEST_USER");
        
        assertTrue(result);
        
        // 验证调用
        verify(orderMapper, times(1)).selectById(1L);
        verify(orderMapper, times(1)).updateById(any(Order.class));
        verify(orderStatusHistoryService, times(1)).recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString());
        verify(inventoryLockService, times(1)).consumeInventoryLock(1L);
    }

    @Test
    void testShipOrder() {
        // Mock数据准备
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setStatus(Order.OrderStatus.PROCESSING);
        
        // Mock行为
        when(orderMapper.selectById(1L)).thenReturn(mockOrder);
        when(orderMapper.updateById(any(Order.class))).thenReturn(1);
        when(orderStatusHistoryService.recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString())).thenReturn(true);
        when(kafkaTemplate.send(anyString(), anyString(), any())).thenReturn(null);
        
        // 测试发货订单
        String trackingNumber = "TN123456789";
        String shippingMethod = "EXPRESS";
        boolean result = orderService.shipOrder(1L, trackingNumber, shippingMethod, "TEST_USER");
        
        assertTrue(result);
        
        // 验证调用
        verify(orderMapper, times(2)).selectById(1L); // 一次用于更新物流信息，一次用于更新状态
        verify(orderMapper, times(2)).updateById(any(Order.class)); // 一次更新物流信息，一次更新状态
        verify(orderStatusHistoryService, times(1)).recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testCancelOrder() {
        // Mock数据准备
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setStatus(Order.OrderStatus.PENDING);
        
        // Mock行为
        when(orderMapper.selectById(1L)).thenReturn(mockOrder);
        when(orderMapper.updateById(any(Order.class))).thenReturn(1);
        when(orderStatusHistoryService.recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString())).thenReturn(true);
        when(inventoryLockService.releaseInventoryLock(anyLong())).thenReturn(true);
        when(kafkaTemplate.send(anyString(), anyString(), any())).thenReturn(null);
        
        // 测试取消订单
        String reason = "客户要求取消";
        boolean result = orderService.cancelOrder(1L, reason, "TEST_USER");
        
        assertTrue(result);
        
        // 验证调用 - 注意：取消订单会调用两次releaseInventoryLock（一次在handleInventoryForStatusChange，一次在cancelOrder方法中）
        verify(orderMapper, times(1)).selectById(1L);
        verify(orderMapper, times(1)).updateById(any(Order.class));
        verify(orderStatusHistoryService, times(1)).recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString());
        verify(inventoryLockService, times(2)).releaseInventoryLock(1L);
    }

    @Test
    void testQueryOrders() {
        // Mock数据准备
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setCustomerName("张三");
        mockOrder.setStatus(Order.OrderStatus.PENDING);
        
        List<Order> mockOrders = Arrays.asList(mockOrder);
        
        // Mock行为
        when(orderMapper.selectOrderList(any(OrderQueryDTO.class))).thenReturn(mockOrders);
        
        // 测试查询订单列表
        OrderQueryDTO query = new OrderQueryDTO();
        query.setCustomerName("张三");
        
        List<OrderDTO> orders = orderService.getOrderList(query);
        
        assertNotNull(orders);
        assertEquals(1, orders.size());
        assertEquals("张三", orders.get(0).getCustomerName());
        assertEquals("PENDING", orders.get(0).getStatus());
        
        verify(orderMapper, times(1)).selectOrderList(any(OrderQueryDTO.class));
    }

    @Test
    void testBatchUpdateOrderStatus() {
        // Mock数据准备
        Order mockOrder1 = new Order();
        mockOrder1.setId(1L);
        mockOrder1.setStatus(Order.OrderStatus.PENDING);
        
        Order mockOrder2 = new Order();
        mockOrder2.setId(2L);
        mockOrder2.setStatus(Order.OrderStatus.PENDING);
        
        List<Long> orderIds = Arrays.asList(1L, 2L);
        
        // Mock行为
        when(orderMapper.selectById(1L)).thenReturn(mockOrder1);
        when(orderMapper.selectById(2L)).thenReturn(mockOrder2);
        when(orderMapper.updateById(any(Order.class))).thenReturn(1);
        when(orderStatusHistoryService.recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString())).thenReturn(true);
        when(inventoryLockService.consumeInventoryLock(anyLong())).thenReturn(true);
        when(kafkaTemplate.send(anyString(), anyString(), any())).thenReturn(null);
        
        // 测试批量更新状态
        int result = orderService.batchUpdateOrderStatus(orderIds, Order.OrderStatus.CONFIRMED, "批量确认", "TEST_USER");
        
        assertEquals(2, result);
        
        // 验证调用
        verify(orderMapper, times(2)).selectById(anyLong());
        verify(orderMapper, times(2)).updateById(any(Order.class));
        verify(orderStatusHistoryService, times(2)).recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString());
        verify(inventoryLockService, times(2)).consumeInventoryLock(anyLong());
    }

    @Test
    void testInvalidStatusTransition() {
        // Mock数据准备 - 已发货的订单
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setStatus(Order.OrderStatus.SHIPPED);
        
        // Mock行为
        when(orderMapper.selectById(1L)).thenReturn(mockOrder);
        
        // 测试无效的状态流转（已发货的订单不能回到确认状态）
        assertThrows(RuntimeException.class, () -> {
            orderService.updateOrderStatus(1L, Order.OrderStatus.CONFIRMED, "无效流转", "TEST_USER");
        });
        
        // 验证调用
        verify(orderMapper, times(1)).selectById(1L);
        verify(orderMapper, never()).updateById(any(Order.class));
    }

    @Test
    void testDeleteOrder() {
        // Mock数据准备
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setStatus(Order.OrderStatus.PENDING);
        
        // Mock行为
        when(orderMapper.selectById(1L)).thenReturn(mockOrder);
        when(orderItemMapper.deleteByOrderId(1L)).thenReturn(2);
        when(orderMapper.deleteById(1L)).thenReturn(1);
        when(inventoryLockService.releaseInventoryLock(1L)).thenReturn(true);
        
        // 测试删除订单
        boolean result = orderService.deleteOrder(1L);
        
        assertTrue(result);
        
        // 验证调用
        verify(orderMapper, times(1)).selectById(1L);
        verify(orderItemMapper, times(1)).deleteByOrderId(1L);
        verify(orderMapper, times(1)).deleteById(1L);
        verify(inventoryLockService, times(1)).releaseInventoryLock(1L);
    }

    @Test
    void testDeleteOrderWithInvalidStatus() {
        // Mock数据准备 - 已发货的订单不能删除
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setStatus(Order.OrderStatus.SHIPPED);
        
        // Mock行为
        when(orderMapper.selectById(1L)).thenReturn(mockOrder);
        
        // 测试删除已发货的订单
        assertThrows(RuntimeException.class, () -> {
            orderService.deleteOrder(1L);
        });
        
        // 验证调用
        verify(orderMapper, times(1)).selectById(1L);
        verify(orderItemMapper, never()).deleteByOrderId(anyLong());
        verify(orderMapper, never()).deleteById(anyLong());
    }

    @Test
    void testGetOrderByOrderNo() {
        // Mock数据准备
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setOrderId("ORD-123456");
        mockOrder.setCustomerName("测试客户");
        mockOrder.setStatus(Order.OrderStatus.PENDING);
        
        OrderItem item1 = new OrderItem();
        item1.setId(1L);
        item1.setOrderId(1L);
        item1.setSku("TEST-SKU-001");
        item1.setProductTitle("测试商品1");
        item1.setQuantity(1);
        item1.setUnitPrice(new BigDecimal("99.99"));
        
        List<OrderItem> orderItems = Arrays.asList(item1);
        
        // Mock行为
        when(orderMapper.selectOne(any())).thenReturn(mockOrder);
        when(orderItemMapper.selectByOrderId(1L)).thenReturn(orderItems);
        
        // 测试根据订单编号查询订单
        OrderDTO order = orderService.getOrderByOrderNo("ORD-123456");
        
        assertNotNull(order);
        assertEquals(1L, order.getId());
        assertEquals("ORD-123456", order.getOrderId());
        assertEquals("测试客户", order.getCustomerName());
        assertEquals("PENDING", order.getStatus());
        assertNotNull(order.getOrderItems());
        assertEquals(1, order.getOrderItems().size());
        
        verify(orderMapper, times(1)).selectOne(any());
        verify(orderItemMapper, times(1)).selectByOrderId(1L);
    }

    @Test
    void testGetOrderByOrderNoNotFound() {
        // Mock行为 - 订单不存在
        when(orderMapper.selectOne(any())).thenReturn(null);
        
        // 测试查询不存在的订单
        OrderDTO order = orderService.getOrderByOrderNo("NON-EXISTENT");
        
        assertNull(order);
        
        verify(orderMapper, times(1)).selectOne(any());
        verify(orderItemMapper, never()).selectByOrderId(anyLong());
    }

    @Test
    void testCreateOrderWithInvalidData() {
        // 测试创建订单时数据验证
        OrderDTO invalidOrderDTO = new OrderDTO();
        // 缺少必要字段
        
        assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(invalidOrderDTO);
        });
        
        // 验证没有调用数据库操作
        verify(orderMapper, never()).insert(any(Order.class));
        verify(orderItemMapper, never()).batchInsert(anyList());
    }

    @Test
    void testCreateOrderInventoryLockFailure() {
        // Mock数据准备
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setOrderId("ORD-123456");
        
        // Mock行为 - 库存锁定失败
        when(orderMapper.insert(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            return 1;
        });
        when(orderItemMapper.batchInsert(anyList())).thenReturn(2);
        when(orderStatusHistoryService.recordStatusChange(anyLong(), any(), anyString(), anyString(), anyString())).thenReturn(true);
        when(inventoryLockService.lockInventoryForOrder(anyLong(), anyList())).thenThrow(new RuntimeException("库存不足"));
        
        // 测试创建订单时库存锁定失败
        assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(testOrderDTO);
        });
        
        // 验证调用
        verify(orderMapper, times(1)).insert(any(Order.class));
        verify(orderItemMapper, times(1)).batchInsert(anyList());
        verify(inventoryLockService, times(1)).lockInventoryForOrder(anyLong(), anyList());
    }

    @Test
    void testUpdateOrderWithInvalidStatus() {
        // Mock数据准备 - 已发货的订单
        Order existingOrder = new Order();
        existingOrder.setId(1L);
        existingOrder.setStatus(Order.OrderStatus.SHIPPED);
        
        // Mock行为
        when(orderMapper.selectById(1L)).thenReturn(existingOrder);
        
        // 测试更新已发货的订单
        OrderDTO updateOrderDTO = new OrderDTO();
        updateOrderDTO.setId(1L);
        updateOrderDTO.setCustomerName("更新后的客户");
        
        assertThrows(RuntimeException.class, () -> {
            orderService.updateOrder(updateOrderDTO);
        });
        
        // 验证调用
        verify(orderMapper, times(1)).selectById(1L);
        verify(orderMapper, never()).updateById(any(Order.class));
    }

    @Test
    void testCountOrdersByStatus() {
        // Mock数据准备
        List<OrderMapper.OrderStatusCount> mockCounts = Arrays.asList(
            createOrderStatusCount("PENDING", 5L),
            createOrderStatusCount("CONFIRMED", 3L),
            createOrderStatusCount("SHIPPED", 2L)
        );
        
        List<Long> storeIds = Arrays.asList(1L, 2L);
        
        // Mock行为
        when(orderMapper.countOrdersByStatus(storeIds)).thenReturn(mockCounts);
        
        // 测试统计订单数量
        List<OrderService.OrderStatusCount> result = orderService.countOrdersByStatus(storeIds);
        
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("PENDING", result.get(0).getStatus());
        assertEquals(5L, result.get(0).getCount());
        assertEquals("CONFIRMED", result.get(1).getStatus());
        assertEquals(3L, result.get(1).getCount());
        
        verify(orderMapper, times(1)).countOrdersByStatus(storeIds);
    }

    @Test
    void testAutoCancelTimeoutOrders() {
        // Mock数据准备
        Order timeoutOrder1 = new Order();
        timeoutOrder1.setId(1L);
        timeoutOrder1.setStatus(Order.OrderStatus.PENDING);
        
        Order timeoutOrder2 = new Order();
        timeoutOrder2.setId(2L);
        timeoutOrder2.setStatus(Order.OrderStatus.PENDING);
        
        List<Order> timeoutOrders = Arrays.asList(timeoutOrder1, timeoutOrder2);
        
        // Mock行为
        when(orderMapper.selectOrdersForAutoCancel(24)).thenReturn(timeoutOrders);
        when(orderMapper.selectById(anyLong())).thenReturn(timeoutOrder1, timeoutOrder2);
        when(orderMapper.updateById(any(Order.class))).thenReturn(1);
        when(orderStatusHistoryService.recordStatusChange(anyLong(), anyString(), anyString(), anyString(), anyString())).thenReturn(true);
        when(inventoryLockService.releaseInventoryLock(anyLong())).thenReturn(true);
        when(kafkaTemplate.send(anyString(), anyString(), any())).thenReturn(null);
        
        // 测试自动取消超时订单
        int result = orderService.autoCancelTimeoutOrders();
        
        assertEquals(2, result);
        
        verify(orderMapper, times(1)).selectOrdersForAutoCancel(24);
        verify(orderMapper, times(2)).selectById(anyLong());
        verify(orderMapper, times(2)).updateById(any(Order.class));
    }

    /**
     * 创建订单状态统计对象
     */
    private OrderMapper.OrderStatusCount createOrderStatusCount(String status, Long count) {
        OrderMapper.OrderStatusCount statusCount = new OrderMapper.OrderStatusCount();
        statusCount.setStatus(status);
        statusCount.setCount(count);
        return statusCount;
    }

    /**
     * 创建测试订单DTO
     */
    private OrderDTO createTestOrderDTO() {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setStoreId(1L);
        orderDTO.setCustomerName("测试客户");
        orderDTO.setCustomerEmail("test@example.com");
        orderDTO.setCustomerPhone("+86-13800138000");
        orderDTO.setTotalAmount(new BigDecimal("199.98"));
        orderDTO.setCurrency("USD");
        orderDTO.setPaymentMethod("CREDIT_CARD");
        orderDTO.setNotes("测试订单");

        // 设置收货地址
        AddressDTO shippingAddress = new AddressDTO();
        shippingAddress.setStreet("测试街道123号");
        shippingAddress.setCity("测试城市");
        shippingAddress.setState("测试省份");
        shippingAddress.setZipCode("100000");
        shippingAddress.setCountry("CN");
        orderDTO.setShippingAddress(shippingAddress);

        // 设置订单明细
        OrderItemDTO item1 = new OrderItemDTO();
        item1.setSku("TEST-SKU-001");
        item1.setProductTitle("测试商品1");
        item1.setQuantity(1);
        item1.setUnitPrice(new BigDecimal("99.99"));
        item1.setTotalPrice(new BigDecimal("99.99"));

        OrderItemDTO item2 = new OrderItemDTO();
        item2.setSku("TEST-SKU-002");
        item2.setProductTitle("测试商品2");
        item2.setQuantity(2);
        item2.setUnitPrice(new BigDecimal("49.99"));
        item2.setTotalPrice(new BigDecimal("99.98"));

        orderDTO.setOrderItems(Arrays.asList(item1, item2));

        return orderDTO;
    }
}