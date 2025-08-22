package com.erp.order.service.impl;

import com.erp.order.dto.OrderDTO;
import com.erp.order.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * 订单通知服务实现类测试
 * 测试订单通知相关的业务逻辑
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("订单通知服务测试")
class OrderNotificationServiceImplTest {

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderNotificationServiceImpl orderNotificationService;

    private OrderDTO testOrder;

    @BeforeEach
    void setUp() {
        // 准备测试订单数据
        testOrder = new OrderDTO();
        testOrder.setId(1L);
        testOrder.setOrderId("ORD20240101001");
        testOrder.setCustomerName("张三");
        testOrder.setCustomerEmail("zhangsan@example.com");
        testOrder.setTotalAmount(new BigDecimal("299.99"));
        testOrder.setCurrency("CNY");
        testOrder.setOrderDate(LocalDateTime.now());
        testOrder.setShippingMethod("顺丰快递");
        testOrder.setShipDate(LocalDateTime.now());
    }

    @Test
    @DisplayName("测试发送订单状态变更通知")
    void testSendOrderStatusChangeNotification() {
        // 准备测试数据
        Long orderId = 1L;
        String oldStatus = "PENDING";
        String newStatus = "CONFIRMED";
        String reason = "管理员确认";
        String operator = "admin";

        // Mock orderService返回
        when(orderService.getOrderById(orderId)).thenReturn(testOrder);

        // 执行测试
        orderNotificationService.sendOrderStatusChangeNotification(orderId, oldStatus, newStatus, reason, operator);

        // 验证Kafka消息发送
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(kafkaTemplate).send(topicCaptor.capture(), keyCaptor.capture(), messageCaptor.capture());

        // 验证消息内容
        assertThat(topicCaptor.getValue()).isEqualTo("notification-events");
        assertThat(keyCaptor.getValue()).isEqualTo("ORDER_STATUS_CHANGE");

        Map<String, Object> notification = messageCaptor.getValue();
        assertThat(notification.get("type")).isEqualTo("ORDER_STATUS_CHANGE");
        assertThat(notification.get("orderId")).isEqualTo(orderId);
        assertThat(notification.get("orderNo")).isEqualTo("ORD20240101001");
        assertThat(notification.get("customerName")).isEqualTo("张三");
        assertThat(notification.get("customerEmail")).isEqualTo("zhangsan@example.com");
        assertThat(notification.get("oldStatus")).isEqualTo(oldStatus);
        assertThat(notification.get("newStatus")).isEqualTo(newStatus);
        assertThat(notification.get("reason")).isEqualTo(reason);
        assertThat(notification.get("operator")).isEqualTo(operator);
        assertThat(notification.get("timestamp")).isNotNull();

        // 验证orderService被调用
        verify(orderService).getOrderById(orderId);
    }

    @Test
    @DisplayName("测试发送订单创建通知")
    void testSendOrderCreatedNotification() {
        // 准备测试数据
        Long orderId = 1L;

        // Mock orderService返回
        when(orderService.getOrderById(orderId)).thenReturn(testOrder);

        // 执行测试
        orderNotificationService.sendOrderCreatedNotification(orderId);

        // 验证Kafka消息发送
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(kafkaTemplate).send(topicCaptor.capture(), keyCaptor.capture(), messageCaptor.capture());

        // 验证消息内容
        assertThat(topicCaptor.getValue()).isEqualTo("notification-events");
        assertThat(keyCaptor.getValue()).isEqualTo("ORDER_CREATED");

        Map<String, Object> notification = messageCaptor.getValue();
        assertThat(notification.get("type")).isEqualTo("ORDER_CREATED");
        assertThat(notification.get("orderId")).isEqualTo(orderId);
        assertThat(notification.get("orderNo")).isEqualTo("ORD20240101001");
        assertThat(notification.get("customerName")).isEqualTo("张三");
        assertThat(notification.get("customerEmail")).isEqualTo("zhangsan@example.com");
        assertThat(notification.get("totalAmount")).isEqualTo(new BigDecimal("299.99"));
        assertThat(notification.get("currency")).isEqualTo("CNY");
        assertThat(notification.get("orderDate")).isNotNull();
        assertThat(notification.get("timestamp")).isNotNull();

        // 验证orderService被调用
        verify(orderService).getOrderById(orderId);
    }

    @Test
    @DisplayName("测试发送订单发货通知")
    void testSendOrderShippedNotification() {
        // 准备测试数据
        Long orderId = 1L;
        String trackingNumber = "SF1234567890";

        // Mock orderService返回
        when(orderService.getOrderById(orderId)).thenReturn(testOrder);

        // 执行测试
        orderNotificationService.sendOrderShippedNotification(orderId, trackingNumber);

        // 验证Kafka消息发送
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(kafkaTemplate).send(topicCaptor.capture(), keyCaptor.capture(), messageCaptor.capture());

        // 验证消息内容
        assertThat(topicCaptor.getValue()).isEqualTo("notification-events");
        assertThat(keyCaptor.getValue()).isEqualTo("ORDER_SHIPPED");

        Map<String, Object> notification = messageCaptor.getValue();
        assertThat(notification.get("type")).isEqualTo("ORDER_SHIPPED");
        assertThat(notification.get("orderId")).isEqualTo(orderId);
        assertThat(notification.get("orderNo")).isEqualTo("ORD20240101001");
        assertThat(notification.get("customerName")).isEqualTo("张三");
        assertThat(notification.get("customerEmail")).isEqualTo("zhangsan@example.com");
        assertThat(notification.get("trackingNumber")).isEqualTo(trackingNumber);
        assertThat(notification.get("shippingMethod")).isEqualTo("顺丰快递");
        assertThat(notification.get("shipDate")).isNotNull();
        assertThat(notification.get("timestamp")).isNotNull();

        // 验证orderService被调用
        verify(orderService).getOrderById(orderId);
    }

    @Test
    @DisplayName("测试发送订单取消通知")
    void testSendOrderCancelledNotification() {
        // 准备测试数据
        Long orderId = 1L;
        String reason = "客户要求取消";

        // Mock orderService返回
        when(orderService.getOrderById(orderId)).thenReturn(testOrder);

        // 执行测试
        orderNotificationService.sendOrderCancelledNotification(orderId, reason);

        // 验证Kafka消息发送
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(kafkaTemplate).send(topicCaptor.capture(), keyCaptor.capture(), messageCaptor.capture());

        // 验证消息内容
        assertThat(topicCaptor.getValue()).isEqualTo("notification-events");
        assertThat(keyCaptor.getValue()).isEqualTo("ORDER_CANCELLED");

        Map<String, Object> notification = messageCaptor.getValue();
        assertThat(notification.get("type")).isEqualTo("ORDER_CANCELLED");
        assertThat(notification.get("orderId")).isEqualTo(orderId);
        assertThat(notification.get("orderNo")).isEqualTo("ORD20240101001");
        assertThat(notification.get("customerName")).isEqualTo("张三");
        assertThat(notification.get("customerEmail")).isEqualTo("zhangsan@example.com");
        assertThat(notification.get("reason")).isEqualTo(reason);
        assertThat(notification.get("totalAmount")).isEqualTo(new BigDecimal("299.99"));
        assertThat(notification.get("currency")).isEqualTo("CNY");
        assertThat(notification.get("timestamp")).isNotNull();

        // 验证orderService被调用
        verify(orderService).getOrderById(orderId);
    }

    @Test
    @DisplayName("测试发送订单异常通知")
    void testSendOrderErrorNotification() {
        // 准备测试数据
        Long orderId = 1L;
        String errorMessage = "支付处理失败";

        // Mock orderService返回
        when(orderService.getOrderById(orderId)).thenReturn(testOrder);

        // 执行测试
        orderNotificationService.sendOrderErrorNotification(orderId, errorMessage);

        // 验证Kafka消息发送
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(kafkaTemplate).send(topicCaptor.capture(), keyCaptor.capture(), messageCaptor.capture());

        // 验证消息内容
        assertThat(topicCaptor.getValue()).isEqualTo("notification-events");
        assertThat(keyCaptor.getValue()).isEqualTo("ORDER_ERROR");

        Map<String, Object> notification = messageCaptor.getValue();
        assertThat(notification.get("type")).isEqualTo("ORDER_ERROR");
        assertThat(notification.get("orderId")).isEqualTo(orderId);
        assertThat(notification.get("orderNo")).isEqualTo("ORD20240101001");
        assertThat(notification.get("errorMessage")).isEqualTo(errorMessage);
        assertThat(notification.get("timestamp")).isNotNull();

        // 验证orderService被调用
        verify(orderService).getOrderById(orderId);
    }

    @Test
    @DisplayName("测试发送库存不足通知")
    void testSendInventoryShortageNotification() {
        // 准备测试数据
        Long orderId = 1L;
        String sku = "SKU001";
        Integer requiredQuantity = 10;
        Integer availableQuantity = 5;

        // Mock orderService返回
        when(orderService.getOrderById(orderId)).thenReturn(testOrder);

        // 执行测试
        orderNotificationService.sendInventoryShortageNotification(orderId, sku, requiredQuantity, availableQuantity);

        // 验证Kafka消息发送
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(kafkaTemplate).send(topicCaptor.capture(), keyCaptor.capture(), messageCaptor.capture());

        // 验证消息内容
        assertThat(topicCaptor.getValue()).isEqualTo("notification-events");
        assertThat(keyCaptor.getValue()).isEqualTo("INVENTORY_SHORTAGE");

        Map<String, Object> notification = messageCaptor.getValue();
        assertThat(notification.get("type")).isEqualTo("INVENTORY_SHORTAGE");
        assertThat(notification.get("orderId")).isEqualTo(orderId);
        assertThat(notification.get("orderNo")).isEqualTo("ORD20240101001");
        assertThat(notification.get("sku")).isEqualTo(sku);
        assertThat(notification.get("requiredQuantity")).isEqualTo(requiredQuantity);
        assertThat(notification.get("availableQuantity")).isEqualTo(availableQuantity);
        assertThat(notification.get("shortageQuantity")).isEqualTo(5); // 10 - 5
        assertThat(notification.get("timestamp")).isNotNull();

        // 验证orderService被调用
        verify(orderService).getOrderById(orderId);
    }

    @Test
    @DisplayName("测试订单不存在时的通知处理")
    void testSendNotificationWhenOrderNotFound() {
        // 准备测试数据
        Long orderId = 999L;

        // Mock orderService返回null
        when(orderService.getOrderById(orderId)).thenReturn(null);

        // 执行测试
        orderNotificationService.sendOrderStatusChangeNotification(orderId, "PENDING", "CONFIRMED", "测试", "admin");

        // 验证orderService被调用
        verify(orderService).getOrderById(orderId);

        // 验证没有发送Kafka消息
        verify(kafkaTemplate, never()).send(any(), any(), any());
    }

    @Test
    @DisplayName("测试Kafka发送异常处理")
    void testKafkaExceptionHandling() {
        // 准备测试数据
        Long orderId = 1L;

        // Mock orderService返回
        when(orderService.getOrderById(orderId)).thenReturn(testOrder);

        // Mock Kafka发送异常
        doThrow(new RuntimeException("Kafka连接失败")).when(kafkaTemplate).send(any(), any(), any());

        // 执行测试（不应该抛出异常）
        orderNotificationService.sendOrderCreatedNotification(orderId);

        // 验证orderService被调用
        verify(orderService).getOrderById(orderId);

        // 验证Kafka发送被尝试
        verify(kafkaTemplate).send(any(), any(), any());
    }

    @Test
    @DisplayName("测试订单异常通知中订单为空的情况")
    void testSendOrderErrorNotificationWithNullOrder() {
        // 准备测试数据
        Long orderId = 999L;
        String errorMessage = "订单处理异常";

        // Mock orderService返回null
        when(orderService.getOrderById(orderId)).thenReturn(null);

        // 执行测试
        orderNotificationService.sendOrderErrorNotification(orderId, errorMessage);

        // 验证Kafka消息发送
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(kafkaTemplate).send(topicCaptor.capture(), keyCaptor.capture(), messageCaptor.capture());

        // 验证消息内容
        Map<String, Object> notification = messageCaptor.getValue();
        assertThat(notification.get("type")).isEqualTo("ORDER_ERROR");
        assertThat(notification.get("orderId")).isEqualTo(orderId);
        assertThat(notification.get("orderNo")).isEqualTo("UNKNOWN"); // 订单不存在时的默认值
        assertThat(notification.get("errorMessage")).isEqualTo(errorMessage);
        assertThat(notification.get("timestamp")).isNotNull();

        // 验证orderService被调用
        verify(orderService).getOrderById(orderId);
    }

    @Test
    @DisplayName("测试库存不足通知中订单为空的情况")
    void testSendInventoryShortageNotificationWithNullOrder() {
        // 准备测试数据
        Long orderId = 999L;
        String sku = "SKU999";
        Integer requiredQuantity = 10;
        Integer availableQuantity = 0;

        // Mock orderService返回null
        when(orderService.getOrderById(orderId)).thenReturn(null);

        // 执行测试
        orderNotificationService.sendInventoryShortageNotification(orderId, sku, requiredQuantity, availableQuantity);

        // 验证Kafka消息发送
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Map> messageCaptor = ArgumentCaptor.forClass(Map.class);

        verify(kafkaTemplate).send(topicCaptor.capture(), keyCaptor.capture(), messageCaptor.capture());

        // 验证消息内容
        Map<String, Object> notification = messageCaptor.getValue();
        assertThat(notification.get("type")).isEqualTo("INVENTORY_SHORTAGE");
        assertThat(notification.get("orderId")).isEqualTo(orderId);
        assertThat(notification.get("orderNo")).isEqualTo("UNKNOWN"); // 订单不存在时的默认值
        assertThat(notification.get("sku")).isEqualTo(sku);
        assertThat(notification.get("requiredQuantity")).isEqualTo(requiredQuantity);
        assertThat(notification.get("availableQuantity")).isEqualTo(availableQuantity);
        assertThat(notification.get("shortageQuantity")).isEqualTo(10); // 10 - 0
        assertThat(notification.get("timestamp")).isNotNull();

        // 验证orderService被调用
        verify(orderService).getOrderById(orderId);
    }
}