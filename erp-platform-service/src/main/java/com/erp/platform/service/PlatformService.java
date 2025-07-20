package com.erp.platform.service;

import com.erp.platform.dto.PlatformStoreDTO;
import com.erp.platform.dto.StorePermissionDTO;

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
     * 根据用户权限获取店铺列表
     */
    List<PlatformStoreDTO> getStoresByUser(Long userId, String platformType, String status);
    
    /**
     * 测试店铺连接
     */
    boolean testStoreConnection(Long storeId);
    
    /**
     * 验证店铺API凭证
     */
    Map<String, Object> validateStoreCredentials(Long storeId);
    
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
    
    // 店铺权限管理
    
    /**
     * 分配店铺权限
     */
    StorePermissionDTO assignStorePermission(StorePermissionDTO permissionDTO);
    
    /**
     * 更新店铺权限
     */
    StorePermissionDTO updateStorePermission(Long permissionId, StorePermissionDTO permissionDTO);
    
    /**
     * 删除店铺权限
     */
    void removeStorePermission(Long permissionId);
    
    /**
     * 获取用户的店铺权限列表
     */
    List<StorePermissionDTO> getUserStorePermissions(Long userId);
    
    /**
     * 获取店铺的权限列表
     */
    List<StorePermissionDTO> getStorePermissions(Long storeId);
    
    /**
     * 检查用户是否有店铺权限
     */
    boolean hasStorePermission(Long userId, Long storeId, String permissionType);
    
    // 数据隔离管理
    
    /**
     * 配置店铺数据隔离
     */
    void configureDataIsolation(Long storeId, String dataType, String isolationLevel, Map<String, Object> configParams);
    
    /**
     * 获取店铺数据隔离配置
     */
    Map<String, Object> getDataIsolationConfig(Long storeId);
    
    /**
     * 检查数据访问权限
     */
    boolean checkDataAccess(Long userId, Long storeId, String dataType, String operation);
    
    // 多店铺数据统一管理
    
    /**
     * 跨店铺数据查询
     */
    Map<String, Object> crossStoreDataQuery(Long userId, String dataType, Map<String, Object> queryParams);
    
    /**
     * 店铺运营数据统计
     */
    Map<String, Object> getStoreOperationalStats(Long userId, List<Long> storeIds, String dateRange);
    
    /**
     * 多店铺数据同步状态检查
     */
    Map<String, Object> checkMultiStoreDataSync(Long userId, List<Long> storeIds);
    
    /**
     * 店铺数据一致性检查
     */
    Map<String, Object> checkStoreDataConsistency(Long userId, List<Long> storeIds, String dataType);
    
    // 店铺批量操作功能
    
    /**
     * 批量商品管理
     */
    Map<String, Object> batchProductManagement(Long userId, List<Long> storeIds, String operation, List<Map<String, Object>> productData);
    
    /**
     * 批量订单处理
     */
    Map<String, Object> batchOrderProcessing(Long userId, List<Long> storeIds, String operation, Map<String, Object> orderCriteria);
    
    /**
     * 批量店铺配置更新
     */
    Map<String, Object> batchStoreConfigUpdate(Long userId, List<Long> storeIds, Map<String, Object> configUpdates);
    
    /**
     * 批量库存同步
     */
    Map<String, Object> batchInventorySync(Long userId, List<Long> storeIds, List<Map<String, Object>> inventoryData);
}