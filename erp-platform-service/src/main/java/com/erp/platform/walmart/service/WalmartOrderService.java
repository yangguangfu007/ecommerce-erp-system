package com.erp.platform.walmart.service;

import com.erp.platform.walmart.dto.WalmartOrder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 沃尔玛订单服务接口
 *
 * @author ERP System
 */
public interface WalmartOrderService {
    
    /**
     * 拉取订单
     *
     * @param storeId 店铺ID
     * @param fromDate 开始时间
     * @param toDate 结束时间
     * @return 订单列表
     */
    List<WalmartOrder> fetchOrders(String storeId, LocalDateTime fromDate, LocalDateTime toDate);
    
    /**
     * 转换订单格式
     *
     * @param walmartOrder 沃尔玛订单
     * @return 标准订单格式
     */
    Map<String, Object> convertToStandardOrder(WalmartOrder walmartOrder);
    
    /**
     * 同步订单状态
     *
     * @param storeId 店铺ID
     * @param orderId 订单ID
     * @return 同步结果
     */
    boolean syncOrderStatus(String storeId, String orderId);
    
    /**
     * 处理订单状态变化
     *
     * @param storeId 店铺ID
     * @param orderId 订单ID
     * @param oldStatus 旧状态
     * @param newStatus 新状态
     */
    void handleOrderStatusChange(String storeId, String orderId, String oldStatus, String newStatus);
}