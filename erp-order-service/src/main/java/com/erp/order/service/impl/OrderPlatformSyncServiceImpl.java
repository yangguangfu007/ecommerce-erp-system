package com.erp.order.service.impl;

import com.erp.order.dto.OrderDTO;
import com.erp.order.entity.Order;
import com.erp.order.service.OrderPlatformSyncService;
import com.erp.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 订单平台同步服务实现类
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderPlatformSyncServiceImpl implements OrderPlatformSyncService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final OrderService orderService;

    @Override
    public boolean syncOrderStatusToPlatform(Long orderId, Order.OrderStatus status) {
        log.info("同步订单状态到平台，订单ID: {}, 状态: {}", orderId, status);

        try {
            OrderDTO order = orderService.getOrderById(orderId);
            if (order == null) {
                log.warn("订单不存在，无法同步状态，订单ID: {}", orderId);
                return false;
            }

            // 构建同步请求
            Map<String, Object> syncRequest = new HashMap<>();
            syncRequest.put("type", "ORDER_STATUS_SYNC");
            syncRequest.put("orderId", orderId);
            syncRequest.put("orderNo", order.getOrderId());
            syncRequest.put("platformOrderId", order.getPlatformOrderId());
            syncRequest.put("storeId", order.getStoreId());
            syncRequest.put("status", status.name());
            syncRequest.put("timestamp", LocalDateTime.now());

            // 发送到平台服务
            kafkaTemplate.send("platform-sync-events", "ORDER_STATUS_SYNC", syncRequest);
            
            log.info("订单状态同步请求发送成功，订单ID: {}", orderId);
            return true;
        } catch (Exception e) {
            log.error("同步订单状态到平台失败，订单ID: {}", orderId, e);
            return false;
        }
    }

    @Override
    public boolean syncOrderShippingToPlatform(Long orderId, String trackingNumber, String shippingMethod) {
        log.info("同步订单发货信息到平台，订单ID: {}, 物流单号: {}", orderId, trackingNumber);

        try {
            OrderDTO order = orderService.getOrderById(orderId);
            if (order == null) {
                log.warn("订单不存在，无法同步发货信息，订单ID: {}", orderId);
                return false;
            }

            // 构建同步请求
            Map<String, Object> syncRequest = new HashMap<>();
            syncRequest.put("type", "ORDER_SHIPPING_SYNC");
            syncRequest.put("orderId", orderId);
            syncRequest.put("orderNo", order.getOrderId());
            syncRequest.put("platformOrderId", order.getPlatformOrderId());
            syncRequest.put("storeId", order.getStoreId());
            syncRequest.put("trackingNumber", trackingNumber);
            syncRequest.put("shippingMethod", shippingMethod);
            syncRequest.put("shipDate", order.getShipDate());
            syncRequest.put("timestamp", LocalDateTime.now());

            // 发送到平台服务
            kafkaTemplate.send("platform-sync-events", "ORDER_SHIPPING_SYNC", syncRequest);
            
            log.info("订单发货信息同步请求发送成功，订单ID: {}", orderId);
            return true;
        } catch (Exception e) {
            log.error("同步订单发货信息到平台失败，订单ID: {}", orderId, e);
            return false;
        }
    }

    @Override
    public int pullOrderUpdatesFromPlatform(Long storeId) {
        log.info("从平台拉取订单更新，店铺ID: {}", storeId);

        try {
            // 构建拉取请求
            Map<String, Object> pullRequest = new HashMap<>();
            pullRequest.put("type", "ORDER_PULL_REQUEST");
            pullRequest.put("storeId", storeId);
            pullRequest.put("timestamp", LocalDateTime.now());

            // 发送到平台服务
            kafkaTemplate.send("platform-sync-events", "ORDER_PULL_REQUEST", pullRequest);
            
            log.info("订单拉取请求发送成功，店铺ID: {}", storeId);
            // 返回0，实际数量由异步处理返回
            return 0;
        } catch (Exception e) {
            log.error("从平台拉取订单更新失败，店铺ID: {}", storeId, e);
            return 0;
        }
    }

    @Override
    public boolean handlePlatformOrderStatusCallback(String platformOrderId, Long storeId, String platformStatus) {
        log.info("处理平台订单状态变更回调，平台订单ID: {}, 店铺ID: {}, 平台状态: {}", 
                platformOrderId, storeId, platformStatus);

        try {
            // 根据平台订单ID查找本地订单
            OrderDTO order = orderService.getOrderByOrderNo(platformOrderId); // 这里需要修改为根据平台订单ID查询
            if (order == null) {
                log.warn("未找到对应的本地订单，平台订单ID: {}", platformOrderId);
                return false;
            }

            // 映射平台状态到本地状态
            Order.OrderStatus localStatus = mapPlatformStatusToLocal(platformStatus);
            if (localStatus == null) {
                log.warn("无法映射平台状态到本地状态，平台状态: {}", platformStatus);
                return false;
            }

            // 更新本地订单状态
            boolean result = orderService.updateOrderStatus(order.getId(), localStatus, 
                    "平台状态同步: " + platformStatus, "PLATFORM_SYNC");

            if (result) {
                log.info("平台订单状态同步成功，订单ID: {}, 状态: {}", order.getId(), localStatus);
            } else {
                log.error("平台订单状态同步失败，订单ID: {}", order.getId());
            }

            return result;
        } catch (Exception e) {
            log.error("处理平台订单状态变更回调失败，平台订单ID: {}", platformOrderId, e);
            return false;
        }
    }

    @Override
    public int retryFailedSyncTasks() {
        log.info("重试失败的同步任务");

        try {
            // 构建重试请求
            Map<String, Object> retryRequest = new HashMap<>();
            retryRequest.put("type", "SYNC_RETRY_REQUEST");
            retryRequest.put("timestamp", LocalDateTime.now());

            // 发送到平台服务
            kafkaTemplate.send("platform-sync-events", "SYNC_RETRY_REQUEST", retryRequest);
            
            log.info("同步重试请求发送成功");
            // 返回0，实际数量由异步处理返回
            return 0;
        } catch (Exception e) {
            log.error("重试失败的同步任务失败", e);
            return 0;
        }
    }

    /**
     * 映射平台状态到本地状态
     */
    private Order.OrderStatus mapPlatformStatusToLocal(String platformStatus) {
        if (platformStatus == null) {
            return null;
        }

        switch (platformStatus.toUpperCase()) {
            case "PENDING":
            case "CREATED":
                return Order.OrderStatus.PENDING;
            case "CONFIRMED":
            case "ACKNOWLEDGED":
                return Order.OrderStatus.CONFIRMED;
            case "PROCESSING":
            case "READY_FOR_PICKUP":
                return Order.OrderStatus.PROCESSING;
            case "SHIPPED":
            case "IN_TRANSIT":
                return Order.OrderStatus.SHIPPED;
            case "DELIVERED":
            case "COMPLETED":
                return Order.OrderStatus.DELIVERED;
            case "CANCELLED":
                return Order.OrderStatus.CANCELLED;
            case "REFUNDED":
                return Order.OrderStatus.REFUNDED;
            default:
                log.warn("未知的平台状态: {}", platformStatus);
                return null;
        }
    }
}