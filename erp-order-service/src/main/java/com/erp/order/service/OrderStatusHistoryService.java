package com.erp.order.service;

import com.erp.order.entity.OrderStatusHistory;

import java.util.List;

/**
 * 订单状态变更记录服务接口
 *
 * @author ERP System
 */
public interface OrderStatusHistoryService {

    /**
     * 记录状态变更
     *
     * @param orderId 订单ID
     * @param fromStatus 原状态
     * @param toStatus 新状态
     * @param reason 变更原因
     * @param operator 操作人
     * @return 是否成功
     */
    boolean recordStatusChange(Long orderId, String fromStatus, String toStatus, String reason, String operator);

    /**
     * 查询订单状态变更历史
     *
     * @param orderId 订单ID
     * @return 状态变更历史列表
     */
    List<OrderStatusHistory> getOrderStatusHistory(Long orderId);

    /**
     * 查询最近的状态变更记录
     *
     * @param orderId 订单ID
     * @return 最近的状态变更记录
     */
    OrderStatusHistory getLatestStatusHistory(Long orderId);
}