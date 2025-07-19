package com.erp.order.service.impl;

import com.erp.order.dto.OrderDTO;
import com.erp.order.service.OrderNotificationService;
import com.erp.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 订单通知服务实现类
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderNotificationServiceImpl implements OrderNotificationService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final OrderService orderService;

    @Override
    public void sendOrderStatusChangeNotification(Long orderId, String oldStatus, String newStatus, String reason, String operator) {
        log.info("发送订单状态变更通知，订单ID: {}, 状态: {} -> {}", orderId, oldStatus, newStatus);

        try {
            OrderDTO order = orderService.getOrderById(orderId);
            if (order == null) {
                log.warn("订单不存在，无法发送通知，订单ID: {}", orderId);
                return;
            }

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "ORDER_STATUS_CHANGE");
            notification.put("orderId", orderId);
            notification.put("orderNo", order.getOrderId());
            notification.put("customerName", order.getCustomerName());
            notification.put("customerEmail", order.getCustomerEmail());
            notification.put("oldStatus", oldStatus);
            notification.put("newStatus", newStatus);
            notification.put("reason", reason);
            notification.put("operator", operator);
            notification.put("timestamp", LocalDateTime.now());

            // 发送到通知服务
            kafkaTemplate.send("notification-events", "ORDER_STATUS_CHANGE", notification);
            
            log.info("订单状态变更通知发送成功，订单ID: {}", orderId);
        } catch (Exception e) {
            log.error("发送订单状态变更通知失败，订单ID: {}", orderId, e);
        }
    }

    @Override
    public void sendOrderCreatedNotification(Long orderId) {
        log.info("发送订单创建通知，订单ID: {}", orderId);

        try {
            OrderDTO order = orderService.getOrderById(orderId);
            if (order == null) {
                log.warn("订单不存在，无法发送通知，订单ID: {}", orderId);
                return;
            }

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "ORDER_CREATED");
            notification.put("orderId", orderId);
            notification.put("orderNo", order.getOrderId());
            notification.put("customerName", order.getCustomerName());
            notification.put("customerEmail", order.getCustomerEmail());
            notification.put("totalAmount", order.getTotalAmount());
            notification.put("currency", order.getCurrency());
            notification.put("orderDate", order.getOrderDate());
            notification.put("timestamp", LocalDateTime.now());

            // 发送到通知服务
            kafkaTemplate.send("notification-events", "ORDER_CREATED", notification);
            
            log.info("订单创建通知发送成功，订单ID: {}", orderId);
        } catch (Exception e) {
            log.error("发送订单创建通知失败，订单ID: {}", orderId, e);
        }
    }

    @Override
    public void sendOrderShippedNotification(Long orderId, String trackingNumber) {
        log.info("发送订单发货通知，订单ID: {}, 物流单号: {}", orderId, trackingNumber);

        try {
            OrderDTO order = orderService.getOrderById(orderId);
            if (order == null) {
                log.warn("订单不存在，无法发送通知，订单ID: {}", orderId);
                return;
            }

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "ORDER_SHIPPED");
            notification.put("orderId", orderId);
            notification.put("orderNo", order.getOrderId());
            notification.put("customerName", order.getCustomerName());
            notification.put("customerEmail", order.getCustomerEmail());
            notification.put("trackingNumber", trackingNumber);
            notification.put("shippingMethod", order.getShippingMethod());
            notification.put("shipDate", order.getShipDate());
            notification.put("timestamp", LocalDateTime.now());

            // 发送到通知服务
            kafkaTemplate.send("notification-events", "ORDER_SHIPPED", notification);
            
            log.info("订单发货通知发送成功，订单ID: {}", orderId);
        } catch (Exception e) {
            log.error("发送订单发货通知失败，订单ID: {}", orderId, e);
        }
    }

    @Override
    public void sendOrderCancelledNotification(Long orderId, String reason) {
        log.info("发送订单取消通知，订单ID: {}, 原因: {}", orderId, reason);

        try {
            OrderDTO order = orderService.getOrderById(orderId);
            if (order == null) {
                log.warn("订单不存在，无法发送通知，订单ID: {}", orderId);
                return;
            }

            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "ORDER_CANCELLED");
            notification.put("orderId", orderId);
            notification.put("orderNo", order.getOrderId());
            notification.put("customerName", order.getCustomerName());
            notification.put("customerEmail", order.getCustomerEmail());
            notification.put("reason", reason);
            notification.put("totalAmount", order.getTotalAmount());
            notification.put("currency", order.getCurrency());
            notification.put("timestamp", LocalDateTime.now());

            // 发送到通知服务
            kafkaTemplate.send("notification-events", "ORDER_CANCELLED", notification);
            
            log.info("订单取消通知发送成功，订单ID: {}", orderId);
        } catch (Exception e) {
            log.error("发送订单取消通知失败，订单ID: {}", orderId, e);
        }
    }

    @Override
    public void sendOrderErrorNotification(Long orderId, String errorMessage) {
        log.info("发送订单异常通知，订单ID: {}, 错误: {}", orderId, errorMessage);

        try {
            OrderDTO order = orderService.getOrderById(orderId);
            
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "ORDER_ERROR");
            notification.put("orderId", orderId);
            notification.put("orderNo", order != null ? order.getOrderId() : "UNKNOWN");
            notification.put("errorMessage", errorMessage);
            notification.put("timestamp", LocalDateTime.now());

            // 发送到通知服务（高优先级）
            kafkaTemplate.send("notification-events", "ORDER_ERROR", notification);
            
            log.info("订单异常通知发送成功，订单ID: {}", orderId);
        } catch (Exception e) {
            log.error("发送订单异常通知失败，订单ID: {}", orderId, e);
        }
    }

    @Override
    public void sendInventoryShortageNotification(Long orderId, String sku, Integer requiredQuantity, Integer availableQuantity) {
        log.info("发送库存不足通知，订单ID: {}, SKU: {}, 需要: {}, 可用: {}", 
                orderId, sku, requiredQuantity, availableQuantity);

        try {
            OrderDTO order = orderService.getOrderById(orderId);
            
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "INVENTORY_SHORTAGE");
            notification.put("orderId", orderId);
            notification.put("orderNo", order != null ? order.getOrderId() : "UNKNOWN");
            notification.put("sku", sku);
            notification.put("requiredQuantity", requiredQuantity);
            notification.put("availableQuantity", availableQuantity);
            notification.put("shortageQuantity", requiredQuantity - availableQuantity);
            notification.put("timestamp", LocalDateTime.now());

            // 发送到通知服务（高优先级）
            kafkaTemplate.send("notification-events", "INVENTORY_SHORTAGE", notification);
            
            log.info("库存不足通知发送成功，订单ID: {}", orderId);
        } catch (Exception e) {
            log.error("发送库存不足通知失败，订单ID: {}", orderId, e);
        }
    }
}