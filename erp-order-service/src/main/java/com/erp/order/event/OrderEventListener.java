package com.erp.order.event;

import com.erp.order.service.OrderNotificationService;
import com.erp.order.service.OrderPlatformSyncService;
import com.erp.order.service.impl.OrderServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * 订单事件监听器
 *
 * @author ERP System
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final OrderNotificationService orderNotificationService;
    private final OrderPlatformSyncService orderPlatformSyncService;

    /**
     * 监听订单状态变更事件
     */
    @KafkaListener(topics = "order-events", groupId = "order-status-notification-group")
    public void handleOrderStatusChangeEvent(OrderServiceImpl.OrderStatusChangeEvent event) {
        log.info("处理订单状态变更事件，订单ID: {}, 状态: {} -> {}", 
                event.getOrderId(), event.getOldStatus(), event.getNewStatus());

        try {
            // 发送通知
            orderNotificationService.sendOrderStatusChangeNotification(
                    event.getOrderId(), event.getOldStatus(), event.getNewStatus(), 
                    event.getReason(), event.getOperator());

            // 同步到平台
            orderPlatformSyncService.syncOrderStatusToPlatform(
                    event.getOrderId(), 
                    com.erp.order.entity.Order.OrderStatus.valueOf(event.getNewStatus()));

        } catch (Exception e) {
            log.error("处理订单状态变更事件失败，订单ID: {}", event.getOrderId(), e);
        }
    }

    /**
     * 监听订单发货事件
     */
    @KafkaListener(topics = "order-events", groupId = "order-shipped-notification-group")
    public void handleOrderShippedEvent(OrderServiceImpl.OrderShippedEvent event) {
        log.info("处理订单发货事件，订单ID: {}, 物流单号: {}", 
                event.getOrderId(), event.getTrackingNumber());

        try {
            // 发送通知
            orderNotificationService.sendOrderShippedNotification(
                    event.getOrderId(), event.getTrackingNumber());

            // 同步到平台
            orderPlatformSyncService.syncOrderShippingToPlatform(
                    event.getOrderId(), event.getTrackingNumber(), event.getShippingMethod());

        } catch (Exception e) {
            log.error("处理订单发货事件失败，订单ID: {}", event.getOrderId(), e);
        }
    }

    /**
     * 监听订单同步请求事件
     */
    @KafkaListener(topics = "order-events", groupId = "order-sync-group")
    public void handleOrderSyncEvent(OrderServiceImpl.OrderSyncEvent event) {
        log.info("处理订单同步事件，店铺ID: {}", event.getStoreId());

        try {
            // 从平台拉取订单更新
            orderPlatformSyncService.pullOrderUpdatesFromPlatform(event.getStoreId());

        } catch (Exception e) {
            log.error("处理订单同步事件失败，店铺ID: {}", event.getStoreId(), e);
        }
    }

    /**
     * 监听库存不足事件
     */
    @KafkaListener(topics = "inventory-events", groupId = "order-inventory-group")
    public void handleInventoryShortageEvent(InventoryShortageEvent event) {
        log.info("处理库存不足事件，订单ID: {}, SKU: {}", event.getOrderId(), event.getSku());

        try {
            // 发送库存不足通知
            orderNotificationService.sendInventoryShortageNotification(
                    event.getOrderId(), event.getSku(), 
                    event.getRequiredQuantity(), event.getAvailableQuantity());

        } catch (Exception e) {
            log.error("处理库存不足事件失败，订单ID: {}", event.getOrderId(), e);
        }
    }

    /**
     * 监听平台订单状态回调事件
     */
    @KafkaListener(topics = "platform-callback-events", groupId = "order-platform-callback-group")
    public void handlePlatformOrderStatusCallback(PlatformOrderStatusCallbackEvent event) {
        log.info("处理平台订单状态回调事件，平台订单ID: {}, 状态: {}", 
                event.getPlatformOrderId(), event.getPlatformStatus());

        try {
            // 处理平台状态回调
            orderPlatformSyncService.handlePlatformOrderStatusCallback(
                    event.getPlatformOrderId(), event.getStoreId(), event.getPlatformStatus());

        } catch (Exception e) {
            log.error("处理平台订单状态回调事件失败，平台订单ID: {}", event.getPlatformOrderId(), e);
        }
    }

    /**
     * 库存不足事件
     */
    public static class InventoryShortageEvent {
        private Long orderId;
        private String sku;
        private Integer requiredQuantity;
        private Integer availableQuantity;

        // Getters and Setters
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }
        public Integer getRequiredQuantity() { return requiredQuantity; }
        public void setRequiredQuantity(Integer requiredQuantity) { this.requiredQuantity = requiredQuantity; }
        public Integer getAvailableQuantity() { return availableQuantity; }
        public void setAvailableQuantity(Integer availableQuantity) { this.availableQuantity = availableQuantity; }
    }

    /**
     * 平台订单状态回调事件
     */
    public static class PlatformOrderStatusCallbackEvent {
        private String platformOrderId;
        private Long storeId;
        private String platformStatus;

        // Getters and Setters
        public String getPlatformOrderId() { return platformOrderId; }
        public void setPlatformOrderId(String platformOrderId) { this.platformOrderId = platformOrderId; }
        public Long getStoreId() { return storeId; }
        public void setStoreId(Long storeId) { this.storeId = storeId; }
        public String getPlatformStatus() { return platformStatus; }
        public void setPlatformStatus(String platformStatus) { this.platformStatus = platformStatus; }
    }
}