package com.erp.order.service;

import com.erp.order.dto.AddressDTO;
import com.erp.order.dto.OrderDTO;
import com.erp.order.dto.OrderItemDTO;
import com.erp.order.dto.OrderQueryDTO;
import com.erp.order.entity.Order;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.Resource;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 订单服务测试类
 *
 * @author ERP System
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class OrderServiceTest {

    @Resource
    private OrderService orderService;

    private OrderDTO testOrderDTO;

    @BeforeEach
    void setUp() {
        // 准备测试数据
        testOrderDTO = createTestOrderDTO();
    }

    @Test
    void testCreateOrder() {
        // 测试创建订单
        Long orderId = orderService.createOrder(testOrderDTO);
        
        assertNotNull(orderId);
        assertTrue(orderId > 0);

        // 验证订单是否创建成功
        OrderDTO createdOrder = orderService.getOrderById(orderId);
        assertNotNull(createdOrder);
        assertEquals(testOrderDTO.getCustomerName(), createdOrder.getCustomerName());
        assertEquals(testOrderDTO.getTotalAmount(), createdOrder.getTotalAmount());
        assertEquals("PENDING", createdOrder.getStatus());
    }

    @Test
    void testGetOrderById() {
        // 先创建订单
        Long orderId = orderService.createOrder(testOrderDTO);
        
        // 测试查询订单
        OrderDTO order = orderService.getOrderById(orderId);
        
        assertNotNull(order);
        assertEquals(orderId, order.getId());
        assertEquals(testOrderDTO.getCustomerName(), order.getCustomerName());
        assertEquals(testOrderDTO.getCustomerEmail(), order.getCustomerEmail());
        assertNotNull(order.getOrderItems());
        assertEquals(2, order.getOrderItems().size());
    }

    @Test
    void testUpdateOrderStatus() {
        // 先创建订单
        Long orderId = orderService.createOrder(testOrderDTO);
        
        // 测试更新订单状态
        boolean result = orderService.updateOrderStatus(orderId, Order.OrderStatus.CONFIRMED, "测试确认", "TEST_USER");
        
        assertTrue(result);
        
        // 验证状态是否更新成功
        OrderDTO updatedOrder = orderService.getOrderById(orderId);
        assertEquals("CONFIRMED", updatedOrder.getStatus());
        assertNotNull(updatedOrder.getConfirmDate());
    }

    @Test
    void testConfirmOrder() {
        // 先创建订单
        Long orderId = orderService.createOrder(testOrderDTO);
        
        // 测试确认订单
        boolean result = orderService.confirmOrder(orderId, "TEST_USER");
        
        assertTrue(result);
        
        // 验证订单状态
        OrderDTO confirmedOrder = orderService.getOrderById(orderId);
        assertEquals("CONFIRMED", confirmedOrder.getStatus());
    }

    @Test
    void testShipOrder() {
        // 先创建并确认订单
        Long orderId = orderService.createOrder(testOrderDTO);
        orderService.confirmOrder(orderId, "TEST_USER");
        
        // 测试发货订单
        String trackingNumber = "TN123456789";
        String shippingMethod = "EXPRESS";
        boolean result = orderService.shipOrder(orderId, trackingNumber, shippingMethod, "TEST_USER");
        
        assertTrue(result);
        
        // 验证订单状态和发货信息
        OrderDTO shippedOrder = orderService.getOrderById(orderId);
        assertEquals("SHIPPED", shippedOrder.getStatus());
        assertEquals(trackingNumber, shippedOrder.getTrackingNumber());
        assertEquals(shippingMethod, shippedOrder.getShippingMethod());
        assertNotNull(shippedOrder.getShipDate());
    }

    @Test
    void testCancelOrder() {
        // 先创建订单
        Long orderId = orderService.createOrder(testOrderDTO);
        
        // 测试取消订单
        String reason = "客户要求取消";
        boolean result = orderService.cancelOrder(orderId, reason, "TEST_USER");
        
        assertTrue(result);
        
        // 验证订单状态
        OrderDTO cancelledOrder = orderService.getOrderById(orderId);
        assertEquals("CANCELLED", cancelledOrder.getStatus());
    }

    @Test
    void testQueryOrders() {
        // 先创建几个测试订单
        OrderDTO order1 = createTestOrderDTO();
        order1.setCustomerName("张三");
        orderService.createOrder(order1);

        OrderDTO order2 = createTestOrderDTO();
        order2.setCustomerName("李四");
        orderService.createOrder(order2);

        // 测试查询订单列表
        OrderQueryDTO query = new OrderQueryDTO();
        query.setCustomerName("张三");
        
        List<OrderDTO> orders = orderService.getOrderList(query);
        
        assertNotNull(orders);
        assertEquals(1, orders.size());
        assertEquals("张三", orders.get(0).getCustomerName());
    }

    @Test
    void testBatchUpdateOrderStatus() {
        // 先创建多个订单
        Long orderId1 = orderService.createOrder(testOrderDTO);
        
        OrderDTO order2 = createTestOrderDTO();
        order2.setCustomerName("李四");
        Long orderId2 = orderService.createOrder(order2);

        List<Long> orderIds = Arrays.asList(orderId1, orderId2);
        
        // 测试批量更新状态
        int result = orderService.batchUpdateOrderStatus(orderIds, Order.OrderStatus.CONFIRMED, "批量确认", "TEST_USER");
        
        assertEquals(2, result);
        
        // 验证状态是否更新成功
        OrderDTO updatedOrder1 = orderService.getOrderById(orderId1);
        OrderDTO updatedOrder2 = orderService.getOrderById(orderId2);
        
        assertEquals("CONFIRMED", updatedOrder1.getStatus());
        assertEquals("CONFIRMED", updatedOrder2.getStatus());
    }

    @Test
    void testInvalidStatusTransition() {
        // 先创建并发货订单
        Long orderId = orderService.createOrder(testOrderDTO);
        orderService.confirmOrder(orderId, "TEST_USER");
        orderService.updateOrderStatus(orderId, Order.OrderStatus.PROCESSING, "处理中", "TEST_USER");
        orderService.shipOrder(orderId, "TN123", "EXPRESS", "TEST_USER");
        
        // 测试无效的状态流转（已发货的订单不能回到确认状态）
        assertThrows(Exception.class, () -> {
            orderService.updateOrderStatus(orderId, Order.OrderStatus.CONFIRMED, "无效流转", "TEST_USER");
        });
    }

    @Test
    void testDeleteOrder() {
        // 先创建订单
        Long orderId = orderService.createOrder(testOrderDTO);
        
        // 测试删除订单
        boolean result = orderService.deleteOrder(orderId);
        
        assertTrue(result);
        
        // 验证订单是否被删除
        OrderDTO deletedOrder = orderService.getOrderById(orderId);
        assertNull(deletedOrder);
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