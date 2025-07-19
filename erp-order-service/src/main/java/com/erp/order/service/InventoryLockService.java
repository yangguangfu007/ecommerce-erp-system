package com.erp.order.service;

import com.erp.order.entity.OrderInventoryLock;
import com.erp.order.entity.OrderItem;

import java.util.List;

/**
 * 库存锁定服务接口
 *
 * @author ERP System
 */
public interface InventoryLockService {

    /**
     * 为订单锁定库存
     *
     * @param orderId 订单ID
     * @param orderItems 订单明细
     * @return 是否成功
     */
    boolean lockInventoryForOrder(Long orderId, List<OrderItem> orderItems);

    /**
     * 释放订单库存锁定
     *
     * @param orderId 订单ID
     * @return 是否成功
     */
    boolean releaseInventoryLock(Long orderId);

    /**
     * 消费库存锁定（确认订单时）
     *
     * @param orderId 订单ID
     * @return 是否成功
     */
    boolean consumeInventoryLock(Long orderId);

    /**
     * 查询订单库存锁定记录
     *
     * @param orderId 订单ID
     * @return 库存锁定记录列表
     */
    List<OrderInventoryLock> getOrderInventoryLocks(Long orderId);

    /**
     * 检查并释放过期的库存锁定
     *
     * @return 释放数量
     */
    int releaseExpiredLocks();
}