package com.erp.platform.service;

import com.erp.platform.dto.PlatformStoreDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 平台服务接口
 *
 * @author ERP System
 */
public interface PlatformService {
    
    /**
     * 创建平台店铺
     */
    PlatformStoreDTO createStore(PlatformStoreDTO storeDTO);
    
    /**
     * 更新平台店铺
     */
    PlatformStoreDTO updateStore(Long storeId, PlatformStoreDTO storeDTO);
    
    /**
     * 删除平台店铺
     */
    void deleteStore(Long storeId);
    
    /**
     * 获取店铺详情
     */
    PlatformStoreDTO getStore(Long storeId);
    
    /**
     * 获取店铺列表
     */
    List<PlatformStoreDTO> getStores(String platformType, String status);
    
    /**
     * 测试店铺连接
     */
    boolean testStoreConnection(Long storeId);
    
    /**
     * 获取店铺状态
     */
    Map<String, Object> getStoreStatus(Long storeId);
    
    /**
     * 拉取订单
     */
    List<Map<String, Object>> fetchOrders(Long storeId, LocalDateTime fromDate, LocalDateTime toDate);
    
    /**
     * 上传商品
     */
    boolean uploadProduct(Long storeId, Map<String, Object> productData);
    
    /**
     * 批量上传商品
     */
    Map<String, Object> batchUploadProducts(Long storeId, List<Map<String, Object>> productsData);
    
    /**
     * 同步库存
     */
    boolean syncInventory(Long storeId, String sku, Integer quantity);
    
    /**
     * 更新订单状态
     */
    boolean updateOrderStatus(Long storeId, String orderId, String status, String trackingNumber);
    
    /**
     * 检查所有店铺连接状态
     */
    void checkAllStoreConnections();
}