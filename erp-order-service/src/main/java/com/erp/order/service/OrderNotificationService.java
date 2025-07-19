package com.erp.order.service;

import com.erp.order.entity.Order;

/**
 * 订单通知服务接口
 *
 * @author ERP System
 */
public interface OrderNotificationService {

    /**
     * 发送订单状态变更通知
     *
     * @param orderId 订单ID
     * @param oldStatus 原状态
     * @param newStatus 新状态
     * @param reason 变更原因
     * @param operator 操作人
     */
    void sendOrderStatusChangeNotification(Long orderId, String oldStatus, String newStatus, String reason, String operator);

    /**
     * 发送订单创建通知
     *
     * @param orderId 订单ID
     */
    void sendOrderCreatedNotification(Long orderId);

    /**
     * 发送订单发货通知
     *
     * @param orderId 订单ID
     * @param trackingNumber 物流单号
     */
    void sendOrderShippedNotification(Long orderId, String trackingNumber);

    /**
     * 发送订单取消通知
     *
     * @param orderId 订单ID
     * @param reason 取消原因
     */
    void sendOrderCancelledNotification(Long orderId, String reason);

    /**
     * 发送订单异常通知
     *
     * @param orderId 订单ID
     * @param errorMessage 错误信息
     */
    void sendOrderErrorNotification(Long orderId, String errorMessage);

    /**
     * 发送库存不足通知
     *
     * @param orderId 订单ID
     * @param sku SKU编码
     * @param requiredQuantity 需要数量
     * @param availableQuantity 可用数量
     */
    void sendInventoryShortageNotification(Long orderId, String sku, Integer requiredQuantity, Integer availableQuantity);
}