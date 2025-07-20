package com.erp.platform.adapter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 平台适配器接口
 *
 * @author ERP System
 */
public interface PlatformAdapter {
    
    /**
     * 获取平台名称
     */
    String getPlatformName();
    
    /**
     * 测试平台连接
     *
     * @param storeId 店铺ID
     * @return 连接是否成功
     */
    boolean testConnection(String storeId);
    
    /**
     * 验证API凭证
     *
     * @param storeId 店铺ID
     * @return 验证结果
     */
    Map<String, Object> validateCredentials(String storeId);
    
    /**
     * 拉取订单
     *
     * @param storeId 店铺ID
     * @param fromDate 开始时间
     * @param toDate 结束时间
     * @return 订单列表
     */
    List<Map<String, Object>> fetchOrders(String storeId, LocalDateTime fromDate, LocalDateTime toDate);
    
    /**
     * 上传商品
     *
     * @param storeId 店铺ID
     * @param productData 商品数据
     * @return 上传是否成功
     */
    boolean uploadProduct(String storeId, Map<String, Object> productData);
    
    /**
     * 批量上传商品
     *
     * @param storeId 店铺ID
     * @param productsData 商品数据列表
     * @return 上传结果
     */
    Map<String, Object> batchUploadProducts(String storeId, List<Map<String, Object>> productsData);
    
    /**
     * 同步库存
     *
     * @param storeId 店铺ID
     * @param sku SKU
     * @param quantity 库存数量
     * @return 同步是否成功
     */
    boolean syncInventory(String storeId, String sku, Integer quantity);
    
    /**
     * 更新订单状态
     *
     * @param storeId 店铺ID
     * @param orderId 订单ID
     * @param status 订单状态
     * @param trackingNumber 物流单号
     * @return 更新是否成功
     */
    boolean updateOrderStatus(String storeId, String orderId, String status, String trackingNumber);
    
    /**
     * 获取平台状态
     *
     * @param storeId 店铺ID
     * @return 平台状态信息
     */
    Map<String, Object> getPlatformStatus(String storeId);
}