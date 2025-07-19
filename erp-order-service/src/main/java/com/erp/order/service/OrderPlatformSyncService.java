package com.erp.order.service;

import com.erp.order.entity.Order;

/**
 * 订单平台同步服务接口
 *
 * @author ERP System
 */
public interface OrderPlatformSyncService {

    /**
     * 同步订单状态到平台
     *
     * @param orderId 订单ID
     * @param status 订单状态
     * @return 是否成功
     */
    boolean syncOrderStatusToPlatform(Long orderId, Order.OrderStatus status);

    /**
     * 同步订单发货信息到平台
     *
     * @param orderId 订单ID
     * @param trackingNumber 物流单号
     * @param shippingMethod 配送方式
     * @return 是否成功
     */
    boolean syncOrderShippingToPlatform(Long orderId, String trackingNumber, String shippingMethod);

    /**
     * 从平台拉取订单更新
     *
     * @param storeId 店铺ID
     * @return 同步数量
     */
    int pullOrderUpdatesFromPlatform(Long storeId);

    /**
     * 处理平台订单状态变更回调
     *
     * @param platformOrderId 平台订单ID
     * @param storeId 店铺ID
     * @param platformStatus 平台状态
     * @return 是否成功
     */
    boolean handlePlatformOrderStatusCallback(String platformOrderId, Long storeId, String platformStatus);

    /**
     * 重试失败的同步任务
     *
     * @return 重试数量
     */
    int retryFailedSyncTasks();
}