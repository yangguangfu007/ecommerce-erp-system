package com.erp.platform.service.impl;

import com.erp.common.exception.BusinessException;
import com.erp.common.util.JsonUtils;
import com.erp.platform.adapter.PlatformAdapter;
import com.erp.platform.dto.PlatformStoreDTO;
import com.erp.platform.dto.StorePermissionDTO;
import com.erp.platform.entity.PlatformStore;
import com.erp.platform.entity.StorePermission;
import com.erp.platform.entity.StoreDataIsolation;
import com.erp.platform.repository.PlatformStoreRepository;
import com.erp.platform.repository.StorePermissionRepository;
import com.erp.platform.repository.StoreDataIsolationRepository;
import com.erp.platform.service.PlatformService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 平台服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlatformServiceImpl implements PlatformService {
    
    private final PlatformStoreRepository platformStoreRepository;
    private final StorePermissionRepository storePermissionRepository;
    private final StoreDataIsolationRepository storeDataIsolationRepository;
    private final List<PlatformAdapter> platformAdapters;
    
    @Override
    @Transactional
    public PlatformStoreDTO createStore(PlatformStoreDTO storeDTO) {
        log.info("创建平台店铺: {}", storeDTO.getStoreName());
        
        // 检查店铺名称是否已存在
        Optional<PlatformStore> existingStore = platformStoreRepository
                .findByStoreNameAndStatus(storeDTO.getStoreName(), PlatformStore.StoreStatus.ACTIVE);
        if (existingStore.isPresent()) {
            throw new BusinessException("店铺名称已存在: " + storeDTO.getStoreName());
        }
        
        // 转换DTO到实体
        PlatformStore store = new PlatformStore();
        BeanUtils.copyProperties(storeDTO, store, "id", "apiCredentials", "configData");
        
        // 处理JSON字段
        if (storeDTO.getApiCredentials() != null) {
            store.setApiCredentials(JsonUtils.toJsonString(storeDTO.getApiCredentials()));
        }
        if (storeDTO.getConfigData() != null) {
            store.setConfigData(JsonUtils.toJsonString(storeDTO.getConfigData()));
        }
        
        store.setStatus(PlatformStore.StoreStatus.valueOf(
                storeDTO.getStatus() != null ? storeDTO.getStatus() : "ACTIVE"));
        
        // 保存店铺
        store = platformStoreRepository.save(store);
        
        // 测试连接
        testStoreConnectionAsync(store.getId());
        
        log.info("成功创建平台店铺: {}, ID: {}", store.getStoreName(), store.getId());
        return convertToDTO(store);
    }
    
    @Override
    @Transactional
    public PlatformStoreDTO updateStore(Long storeId, PlatformStoreDTO storeDTO) {
        log.info("更新平台店铺: {}", storeId);
        
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        // 更新基本信息
        BeanUtils.copyProperties(storeDTO, store, "id", "apiCredentials", "configData", "createdAt");
        
        // 处理JSON字段
        if (storeDTO.getApiCredentials() != null) {
            store.setApiCredentials(JsonUtils.toJsonString(storeDTO.getApiCredentials()));
        }
        if (storeDTO.getConfigData() != null) {
            store.setConfigData(JsonUtils.toJsonString(storeDTO.getConfigData()));
        }
        
        if (storeDTO.getStatus() != null) {
            store.setStatus(PlatformStore.StoreStatus.valueOf(storeDTO.getStatus()));
        }
        
        // 保存更新
        store = platformStoreRepository.save(store);
        
        // 重新测试连接
        testStoreConnectionAsync(store.getId());
        
        log.info("成功更新平台店铺: {}", storeId);
        return convertToDTO(store);
    }
    
    @Override
    @Transactional
    public void deleteStore(Long storeId) {
        log.info("删除平台店铺: {}", storeId);
        
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        // 软删除
        store.setStatus(PlatformStore.StoreStatus.DELETED);
        platformStoreRepository.save(store);
        
        log.info("成功删除平台店铺: {}", storeId);
    }
    
    @Override
    public PlatformStoreDTO getStore(Long storeId) {
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        return convertToDTO(store);
    }
    
    @Override
    public List<PlatformStoreDTO> getStores(String platformType, String status) {
        List<PlatformStore> stores;
        
        if (platformType != null && status != null) {
            stores = platformStoreRepository.findByPlatformTypeAndStatus(
                    platformType, PlatformStore.StoreStatus.valueOf(status));
        } else if (status != null) {
            stores = platformStoreRepository.findByStatus(PlatformStore.StoreStatus.valueOf(status));
        } else {
            stores = platformStoreRepository.findAll();
        }
        
        return stores.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<PlatformStoreDTO> getStoresByUser(Long userId, String platformType, String status) {
        log.info("获取用户店铺列表: userId={}, platformType={}, status={}", userId, platformType, status);
        
        // 获取用户有权限的店铺ID列表
        List<Long> storeIds = storePermissionRepository.findStoreIdsByUserId(userId);
        
        if (storeIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 根据店铺ID列表查询店铺信息
        List<PlatformStore> stores = platformStoreRepository.findAllById(storeIds);
        
        // 根据条件过滤
        if (platformType != null) {
            stores = stores.stream()
                    .filter(store -> platformType.equals(store.getPlatformType()))
                    .collect(Collectors.toList());
        }
        
        if (status != null) {
            PlatformStore.StoreStatus storeStatus = PlatformStore.StoreStatus.valueOf(status);
            stores = stores.stream()
                    .filter(store -> storeStatus.equals(store.getStatus()))
                    .collect(Collectors.toList());
        }
        
        return stores.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public boolean testStoreConnection(Long storeId) {
        log.info("测试店铺连接: {}", storeId);
        
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        PlatformAdapter adapter = getPlatformAdapter(store.getPlatformType());
        boolean connected = adapter.testConnection(store.getId().toString());
        
        // 更新连接状态
        store.setConnectionStatus(connected);
        store.setLastConnectionCheck(LocalDateTime.now());
        platformStoreRepository.save(store);
        
        log.info("店铺连接测试完成: {}, 结果: {}", storeId, connected);
        return connected;
    }
    
    @Override
    public Map<String, Object> validateStoreCredentials(Long storeId) {
        log.info("验证店铺API凭证: {}", storeId);
        
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            PlatformAdapter adapter = getPlatformAdapter(store.getPlatformType());
            Map<String, Object> validationResult = adapter.validateCredentials(store.getId().toString());
            
            result.put("valid", true);
            result.put("details", validationResult);
            
            // 更新连接状态
            store.setConnectionStatus(true);
            store.setLastConnectionCheck(LocalDateTime.now());
            
        } catch (Exception e) {
            log.error("验证店铺API凭证失败: {}", storeId, e);
            result.put("valid", false);
            result.put("error", e.getMessage());
            
            // 更新连接状态
            store.setConnectionStatus(false);
            store.setLastConnectionCheck(LocalDateTime.now());
        }
        
        platformStoreRepository.save(store);
        
        return result;
    }
    
    @Override
    public Map<String, Object> getStoreStatus(Long storeId) {
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        PlatformAdapter adapter = getPlatformAdapter(store.getPlatformType());
        return adapter.getPlatformStatus(store.getId().toString());
    }
    
    @Override
    public List<Map<String, Object>> fetchOrders(Long storeId, LocalDateTime fromDate, LocalDateTime toDate) {
        log.info("拉取店铺订单: {}, 时间范围: {} - {}", storeId, fromDate, toDate);
        
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        PlatformAdapter adapter = getPlatformAdapter(store.getPlatformType());
        List<Map<String, Object>> orders = adapter.fetchOrders(store.getId().toString(), fromDate, toDate);
        
        // 更新最后同步时间
        store.setLastSyncTime(LocalDateTime.now());
        platformStoreRepository.save(store);
        
        log.info("成功拉取店铺订单: {}, 数量: {}", storeId, orders.size());
        return orders;
    }
    
    @Override
    public boolean uploadProduct(Long storeId, Map<String, Object> productData) {
        log.info("上传商品到店铺: {}, SKU: {}", storeId, productData.get("sku"));
        
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        PlatformAdapter adapter = getPlatformAdapter(store.getPlatformType());
        return adapter.uploadProduct(store.getId().toString(), productData);
    }
    
    @Override
    public Map<String, Object> batchUploadProducts(Long storeId, List<Map<String, Object>> productsData) {
        log.info("批量上传商品到店铺: {}, 数量: {}", storeId, productsData.size());
        
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        PlatformAdapter adapter = getPlatformAdapter(store.getPlatformType());
        return adapter.batchUploadProducts(store.getId().toString(), productsData);
    }
    
    @Override
    public boolean syncInventory(Long storeId, String sku, Integer quantity) {
        log.info("同步库存到店铺: {}, SKU: {}, 数量: {}", storeId, sku, quantity);
        
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        PlatformAdapter adapter = getPlatformAdapter(store.getPlatformType());
        return adapter.syncInventory(store.getId().toString(), sku, quantity);
    }
    
    @Override
    public boolean updateOrderStatus(Long storeId, String orderId, String status, String trackingNumber) {
        log.info("更新订单状态: 店铺{}, 订单{}, 状态{}", storeId, orderId, status);
        
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        PlatformAdapter adapter = getPlatformAdapter(store.getPlatformType());
        return adapter.updateOrderStatus(store.getId().toString(), orderId, status, trackingNumber);
    }
    
    @Override
    @Scheduled(fixedRate = 300000) // 每5分钟检查一次
    public void checkAllStoreConnections() {
        log.debug("开始检查所有店铺连接状态");
        
        LocalDateTime checkTime = LocalDateTime.now().minusMinutes(30); // 30分钟内未检查的店铺
        List<PlatformStore> stores = platformStoreRepository.findStoresNeedConnectionCheck(checkTime);
        
        for (PlatformStore store : stores) {
            testStoreConnectionAsync(store.getId());
        }
        
        log.debug("完成检查所有店铺连接状态，检查数量: {}", stores.size());
    }
    
    /**
     * 异步测试店铺连接
     */
    @Async
    public void testStoreConnectionAsync(Long storeId) {
        try {
            testStoreConnection(storeId);
        } catch (Exception e) {
            log.error("异步测试店铺连接失败: {}", storeId, e);
        }
    }
    
    /**
     * 获取平台适配器
     */
    private PlatformAdapter getPlatformAdapter(String platformType) {
        return platformAdapters.stream()
                .filter(adapter -> adapter.getPlatformName().equalsIgnoreCase(platformType))
                .findFirst()
                .orElseThrow(() -> new BusinessException("不支持的平台类型: " + platformType));
    }
    
    // 店铺权限管理实现
    
    @Override
    @Transactional
    public StorePermissionDTO assignStorePermission(StorePermissionDTO permissionDTO) {
        log.info("分配店铺权限: userId={}, storeId={}, permissionType={}", 
                permissionDTO.getUserId(), permissionDTO.getStoreId(), permissionDTO.getPermissionType());
        
        // 检查店铺是否存在
        PlatformStore store = platformStoreRepository.findById(permissionDTO.getStoreId())
                .orElseThrow(() -> new BusinessException("店铺不存在: " + permissionDTO.getStoreId()));
        
        // 检查是否已存在权限
        Optional<StorePermission> existingPermission = storePermissionRepository
                .findByUserIdAndStoreId(permissionDTO.getUserId(), permissionDTO.getStoreId());
        
        StorePermission permission;
        if (existingPermission.isPresent()) {
            // 更新现有权限
            permission = existingPermission.get();
            log.info("更新现有店铺权限: {}", permission.getId());
        } else {
            // 创建新权限
            permission = new StorePermission();
            permission.setUserId(permissionDTO.getUserId());
            permission.setStoreId(permissionDTO.getStoreId());
        }
        
        // 设置权限信息
        permission.setPermissionType(StorePermission.PermissionType.valueOf(permissionDTO.getPermissionType()));
        permission.setCanRead(permissionDTO.getCanRead());
        permission.setCanWrite(permissionDTO.getCanWrite());
        permission.setCanDelete(permissionDTO.getCanDelete());
        permission.setCanManage(permissionDTO.getCanManage());
        
        permission = storePermissionRepository.save(permission);
        
        log.info("成功分配店铺权限: {}", permission.getId());
        return convertPermissionToDTO(permission, store.getStoreName(), null);
    }
    
    @Override
    @Transactional
    public StorePermissionDTO updateStorePermission(Long permissionId, StorePermissionDTO permissionDTO) {
        log.info("更新店铺权限: {}", permissionId);
        
        StorePermission permission = storePermissionRepository.findById(permissionId)
                .orElseThrow(() -> new BusinessException("权限不存在: " + permissionId));
        
        // 更新权限信息
        if (permissionDTO.getPermissionType() != null) {
            permission.setPermissionType(StorePermission.PermissionType.valueOf(permissionDTO.getPermissionType()));
        }
        if (permissionDTO.getCanRead() != null) {
            permission.setCanRead(permissionDTO.getCanRead());
        }
        if (permissionDTO.getCanWrite() != null) {
            permission.setCanWrite(permissionDTO.getCanWrite());
        }
        if (permissionDTO.getCanDelete() != null) {
            permission.setCanDelete(permissionDTO.getCanDelete());
        }
        if (permissionDTO.getCanManage() != null) {
            permission.setCanManage(permissionDTO.getCanManage());
        }
        
        permission = storePermissionRepository.save(permission);
        
        // 获取店铺名称
        PlatformStore store = platformStoreRepository.findById(permission.getStoreId())
                .orElse(null);
        String storeName = store != null ? store.getStoreName() : null;
        
        log.info("成功更新店铺权限: {}", permissionId);
        return convertPermissionToDTO(permission, storeName, null);
    }
    
    @Override
    @Transactional
    public void removeStorePermission(Long permissionId) {
        log.info("删除店铺权限: {}", permissionId);
        
        StorePermission permission = storePermissionRepository.findById(permissionId)
                .orElseThrow(() -> new BusinessException("权限不存在: " + permissionId));
        
        storePermissionRepository.delete(permission);
        
        log.info("成功删除店铺权限: {}", permissionId);
    }
    
    @Override
    public List<StorePermissionDTO> getUserStorePermissions(Long userId) {
        log.info("获取用户店铺权限列表: {}", userId);
        
        List<StorePermission> permissions = storePermissionRepository.findByUserId(userId);
        
        return permissions.stream()
                .map(permission -> {
                    PlatformStore store = platformStoreRepository.findById(permission.getStoreId())
                            .orElse(null);
                    String storeName = store != null ? store.getStoreName() : null;
                    return convertPermissionToDTO(permission, storeName, null);
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public List<StorePermissionDTO> getStorePermissions(Long storeId) {
        log.info("获取店铺权限列表: {}", storeId);
        
        List<StorePermission> permissions = storePermissionRepository.findByStoreId(storeId);
        
        PlatformStore store = platformStoreRepository.findById(storeId)
                .orElse(null);
        String storeName = store != null ? store.getStoreName() : null;
        
        return permissions.stream()
                .map(permission -> convertPermissionToDTO(permission, storeName, null))
                .collect(Collectors.toList());
    }
    
    @Override
    public boolean hasStorePermission(Long userId, Long storeId, String permissionType) {
        switch (permissionType.toUpperCase()) {
            case "READ":
                return storePermissionRepository.hasPermission(userId, storeId, true, null, null, null);
            case "WRITE":
                return storePermissionRepository.hasPermission(userId, storeId, null, true, null, null);
            case "DELETE":
                return storePermissionRepository.hasPermission(userId, storeId, null, null, true, null);
            case "MANAGE":
                return storePermissionRepository.hasPermission(userId, storeId, null, null, null, true);
            default:
                return false;
        }
    }
    
    // 数据隔离管理实现
    
    @Override
    @Transactional
    public void configureDataIsolation(Long storeId, String dataType, String isolationLevel, Map<String, Object> configParams) {
        log.info("配置店铺数据隔离: storeId={}, dataType={}, isolationLevel={}", storeId, dataType, isolationLevel);
        
        // 检查店铺是否存在
        platformStoreRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("店铺不存在: " + storeId));
        
        StoreDataIsolation.DataType dataTypeEnum = StoreDataIsolation.DataType.valueOf(dataType.toUpperCase());
        StoreDataIsolation.IsolationLevel isolationLevelEnum = StoreDataIsolation.IsolationLevel.valueOf(isolationLevel.toUpperCase());
        
        // 查找现有配置
        Optional<StoreDataIsolation> existingConfig = storeDataIsolationRepository
                .findByStoreIdAndDataType(storeId, dataTypeEnum);
        
        StoreDataIsolation config;
        if (existingConfig.isPresent()) {
            config = existingConfig.get();
        } else {
            config = new StoreDataIsolation();
            config.setStoreId(storeId);
            config.setDataType(dataTypeEnum);
        }
        
        config.setIsolationLevel(isolationLevelEnum);
        config.setEnabled(true);
        if (configParams != null) {
            config.setConfigParams(JsonUtils.toJsonString(configParams));
        }
        
        storeDataIsolationRepository.save(config);
        
        log.info("成功配置店铺数据隔离: {}", config.getId());
    }
    
    @Override
    public Map<String, Object> getDataIsolationConfig(Long storeId) {
        log.info("获取店铺数据隔离配置: {}", storeId);
        
        List<StoreDataIsolation> configs = storeDataIsolationRepository.findByStoreId(storeId);
        
        Map<String, Object> result = new HashMap<>();
        for (StoreDataIsolation config : configs) {
            Map<String, Object> configData = new HashMap<>();
            configData.put("isolationLevel", config.getIsolationLevel().name());
            configData.put("enabled", config.getEnabled());
            if (config.getConfigParams() != null) {
                configData.put("configParams", JsonUtils.parseMap(config.getConfigParams()));
            }
            result.put(config.getDataType().name(), configData);
        }
        
        return result;
    }
    
    @Override
    public boolean checkDataAccess(Long userId, Long storeId, String dataType, String operation) {
        log.debug("检查数据访问权限: userId={}, storeId={}, dataType={}, operation={}", 
                userId, storeId, dataType, operation);
        
        // 检查用户是否有店铺权限
        Optional<StorePermission> permission = storePermissionRepository.findByUserIdAndStoreId(userId, storeId);
        if (permission.isEmpty()) {
            return false;
        }
        
        StorePermission perm = permission.get();
        
        // 根据操作类型检查权限
        switch (operation.toUpperCase()) {
            case "READ":
                return perm.getCanRead();
            case "WRITE":
            case "CREATE":
            case "UPDATE":
                return perm.getCanWrite();
            case "DELETE":
                return perm.getCanDelete();
            case "MANAGE":
                return perm.getCanManage();
            default:
                return false;
        }
    }
    
    // 多店铺数据统一管理实现
    
    @Override
    public Map<String, Object> crossStoreDataQuery(Long userId, String dataType, Map<String, Object> queryParams) {
        log.info("跨店铺数据查询: userId={}, dataType={}", userId, dataType);
        
        // 获取用户有权限的店铺列表
        List<Long> authorizedStoreIds = storePermissionRepository.findStoreIdsByUserId(userId);
        
        if (authorizedStoreIds.isEmpty()) {
            return Map.of("stores", Collections.emptyList(), "totalCount", 0, "message", "用户无店铺访问权限");
        }
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> storeDataList = new ArrayList<>();
        int totalCount = 0;
        
        for (Long storeId : authorizedStoreIds) {
            // 检查数据访问权限
            if (!checkDataAccess(userId, storeId, dataType, "READ")) {
                continue;
            }
            
            try {
                PlatformStore store = platformStoreRepository.findById(storeId).orElse(null);
                if (store == null || !PlatformStore.StoreStatus.ACTIVE.equals(store.getStatus())) {
                    continue;
                }
                
                // 根据数据类型查询相应数据
                Map<String, Object> storeData = queryStoreData(store, dataType, queryParams);
                if (storeData != null && !storeData.isEmpty()) {
                    storeData.put("storeId", storeId);
                    storeData.put("storeName", store.getStoreName());
                    storeData.put("platformType", store.getPlatformType());
                    storeDataList.add(storeData);
                    
                    Object count = storeData.get("count");
                    if (count instanceof Number) {
                        totalCount += ((Number) count).intValue();
                    }
                }
                
            } catch (Exception e) {
                log.error("查询店铺数据失败: storeId={}, dataType={}", storeId, dataType, e);
            }
        }
        
        result.put("stores", storeDataList);
        result.put("totalCount", totalCount);
        result.put("authorizedStoreCount", authorizedStoreIds.size());
        result.put("dataType", dataType);
        result.put("queryTime", LocalDateTime.now());
        
        log.info("跨店铺数据查询完成: userId={}, dataType={}, 店铺数量={}, 总记录数={}", 
                userId, dataType, storeDataList.size(), totalCount);
        
        return result;
    }
    
    @Override
    public Map<String, Object> getStoreOperationalStats(Long userId, List<Long> storeIds, String dateRange) {
        log.info("获取店铺运营数据统计: userId={}, storeIds={}, dateRange={}", userId, storeIds, dateRange);
        
        // 验证用户对店铺的访问权限
        List<Long> authorizedStoreIds = storePermissionRepository.findStoreIdsByUserId(userId);
        List<Long> validStoreIds = storeIds.stream()
                .filter(authorizedStoreIds::contains)
                .collect(Collectors.toList());
        
        if (validStoreIds.isEmpty()) {
            return Map.of("error", "用户无权限访问指定店铺");
        }
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> storeStats = new ArrayList<>();
        
        // 汇总统计数据
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStores", validStoreIds.size());
        summary.put("totalOrders", 0);
        summary.put("totalRevenue", 0.0);
        summary.put("totalProducts", 0);
        summary.put("averageOrderValue", 0.0);
        
        for (Long storeId : validStoreIds) {
            try {
                PlatformStore store = platformStoreRepository.findById(storeId).orElse(null);
                if (store == null) continue;
                
                Map<String, Object> storeStat = new HashMap<>();
                storeStat.put("storeId", storeId);
                storeStat.put("storeName", store.getStoreName());
                storeStat.put("platformType", store.getPlatformType());
                storeStat.put("status", store.getStatus().name());
                storeStat.put("connectionStatus", store.getConnectionStatus());
                storeStat.put("lastSyncTime", store.getLastSyncTime());
                
                // 获取店铺运营数据（这里可以调用外部服务获取实际数据）
                Map<String, Object> operationalData = getStoreOperationalData(store, dateRange);
                storeStat.putAll(operationalData);
                
                storeStats.add(storeStat);
                
                // 累加到汇总数据
                if (operationalData.containsKey("orderCount")) {
                    summary.put("totalOrders", (Integer) summary.get("totalOrders") + 
                            (Integer) operationalData.getOrDefault("orderCount", 0));
                }
                if (operationalData.containsKey("revenue")) {
                    summary.put("totalRevenue", (Double) summary.get("totalRevenue") + 
                            (Double) operationalData.getOrDefault("revenue", 0.0));
                }
                if (operationalData.containsKey("productCount")) {
                    summary.put("totalProducts", (Integer) summary.get("totalProducts") + 
                            (Integer) operationalData.getOrDefault("productCount", 0));
                }
                
            } catch (Exception e) {
                log.error("获取店铺运营数据失败: storeId={}", storeId, e);
            }
        }
        
        // 计算平均订单价值
        int totalOrders = (Integer) summary.get("totalOrders");
        if (totalOrders > 0) {
            double avgOrderValue = (Double) summary.get("totalRevenue") / totalOrders;
            summary.put("averageOrderValue", Math.round(avgOrderValue * 100.0) / 100.0);
        }
        
        result.put("summary", summary);
        result.put("storeStats", storeStats);
        result.put("dateRange", dateRange);
        result.put("generatedAt", LocalDateTime.now());
        
        log.info("店铺运营数据统计完成: userId={}, 有效店铺数={}", userId, validStoreIds.size());
        
        return result;
    }
    
    @Override
    public Map<String, Object> checkMultiStoreDataSync(Long userId, List<Long> storeIds) {
        log.info("检查多店铺数据同步状态: userId={}, storeIds={}", userId, storeIds);
        
        // 验证用户权限
        List<Long> authorizedStoreIds = storePermissionRepository.findStoreIdsByUserId(userId);
        List<Long> validStoreIds = storeIds.stream()
                .filter(authorizedStoreIds::contains)
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> syncStatusList = new ArrayList<>();
        
        int healthyStores = 0;
        int syncIssueStores = 0;
        int offlineStores = 0;
        
        for (Long storeId : validStoreIds) {
            try {
                PlatformStore store = platformStoreRepository.findById(storeId).orElse(null);
                if (store == null) continue;
                
                Map<String, Object> syncStatus = new HashMap<>();
                syncStatus.put("storeId", storeId);
                syncStatus.put("storeName", store.getStoreName());
                syncStatus.put("platformType", store.getPlatformType());
                syncStatus.put("connectionStatus", store.getConnectionStatus());
                syncStatus.put("lastSyncTime", store.getLastSyncTime());
                syncStatus.put("lastConnectionCheck", store.getLastConnectionCheck());
                
                // 判断同步状态
                String status = "HEALTHY";
                List<String> issues = new ArrayList<>();
                
                if (store.getConnectionStatus() == null || !store.getConnectionStatus()) {
                    status = "OFFLINE";
                    issues.add("连接失败");
                    offlineStores++;
                } else {
                    // 检查最后同步时间
                    if (store.getLastSyncTime() == null || 
                        store.getLastSyncTime().isBefore(LocalDateTime.now().minusHours(2))) {
                        status = "SYNC_ISSUE";
                        issues.add("同步延迟");
                        syncIssueStores++;
                    } else {
                        healthyStores++;
                    }
                    
                    // 检查连接检查时间
                    if (store.getLastConnectionCheck() == null || 
                        store.getLastConnectionCheck().isBefore(LocalDateTime.now().minusMinutes(30))) {
                        if (!"SYNC_ISSUE".equals(status)) {
                            status = "SYNC_ISSUE";
                            syncIssueStores++;
                            healthyStores--;
                        }
                        issues.add("连接检查过期");
                    }
                }
                
                syncStatus.put("status", status);
                syncStatus.put("issues", issues);
                syncStatusList.add(syncStatus);
                
            } catch (Exception e) {
                log.error("检查店铺同步状态失败: storeId={}", storeId, e);
            }
        }
        
        // 汇总统计
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStores", validStoreIds.size());
        summary.put("healthyStores", healthyStores);
        summary.put("syncIssueStores", syncIssueStores);
        summary.put("offlineStores", offlineStores);
        summary.put("healthRate", validStoreIds.size() > 0 ? 
                Math.round((double) healthyStores / validStoreIds.size() * 100.0) : 0);
        
        result.put("summary", summary);
        result.put("storeStatus", syncStatusList);
        result.put("checkTime", LocalDateTime.now());
        
        log.info("多店铺数据同步状态检查完成: userId={}, 健康店铺={}, 问题店铺={}, 离线店铺={}", 
                userId, healthyStores, syncIssueStores, offlineStores);
        
        return result;
    }
    
    @Override
    public Map<String, Object> checkStoreDataConsistency(Long userId, List<Long> storeIds, String dataType) {
        log.info("检查店铺数据一致性: userId={}, storeIds={}, dataType={}", userId, storeIds, dataType);
        
        // 验证用户权限
        List<Long> authorizedStoreIds = storePermissionRepository.findStoreIdsByUserId(userId);
        List<Long> validStoreIds = storeIds.stream()
                .filter(authorizedStoreIds::contains)
                .filter(storeId -> checkDataAccess(userId, storeId, dataType, "READ"))
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> consistencyResults = new ArrayList<>();
        
        // 数据一致性检查逻辑
        Map<String, Set<String>> dataComparison = new HashMap<>();
        
        for (Long storeId : validStoreIds) {
            try {
                PlatformStore store = platformStoreRepository.findById(storeId).orElse(null);
                if (store == null) continue;
                
                Map<String, Object> storeConsistency = new HashMap<>();
                storeConsistency.put("storeId", storeId);
                storeConsistency.put("storeName", store.getStoreName());
                storeConsistency.put("platformType", store.getPlatformType());
                
                // 获取店铺数据摘要用于一致性比较
                Set<String> dataDigest = getStoreDataDigest(store, dataType);
                dataComparison.put(storeId.toString(), dataDigest);
                
                storeConsistency.put("dataCount", dataDigest.size());
                storeConsistency.put("lastUpdated", store.getUpdateTime());
                
                consistencyResults.add(storeConsistency);
                
            } catch (Exception e) {
                log.error("检查店铺数据一致性失败: storeId={}, dataType={}", storeId, dataType, e);
            }
        }
        
        // 分析数据一致性
        Map<String, Object> consistencyAnalysis = analyzeDataConsistency(dataComparison);
        
        result.put("dataType", dataType);
        result.put("storeResults", consistencyResults);
        result.put("consistencyAnalysis", consistencyAnalysis);
        result.put("checkTime", LocalDateTime.now());
        
        log.info("店铺数据一致性检查完成: userId={}, dataType={}, 检查店铺数={}", 
                userId, dataType, validStoreIds.size());
        
        return result;
    }
    
    /**
     * 查询店铺数据
     */
    private Map<String, Object> queryStoreData(PlatformStore store, String dataType, Map<String, Object> queryParams) {
        // 这里可以根据数据类型调用不同的服务获取数据
        // 目前返回模拟数据
        Map<String, Object> data = new HashMap<>();
        
        switch (dataType.toUpperCase()) {
            case "ORDER":
                data.put("count", 100 + (int)(Math.random() * 500));
                data.put("type", "订单数据");
                break;
            case "PRODUCT":
                data.put("count", 50 + (int)(Math.random() * 200));
                data.put("type", "商品数据");
                break;
            case "INVENTORY":
                data.put("count", 200 + (int)(Math.random() * 1000));
                data.put("type", "库存数据");
                break;
            default:
                data.put("count", 0);
                data.put("type", "未知数据类型");
        }
        
        return data;
    }
    
    /**
     * 获取店铺运营数据
     */
    private Map<String, Object> getStoreOperationalData(PlatformStore store, String dateRange) {
        // 这里可以调用外部服务获取实际运营数据
        // 目前返回模拟数据
        Map<String, Object> data = new HashMap<>();
        
        int baseOrders = 50;
        double baseRevenue = 5000.0;
        int baseProducts = 100;
        
        // 根据平台类型调整基础数据
        if ("WALMART".equals(store.getPlatformType())) {
            baseOrders *= 2;
            baseRevenue *= 1.5;
        }
        
        data.put("orderCount", baseOrders + (int)(Math.random() * 100));
        data.put("revenue", Math.round((baseRevenue + Math.random() * 2000) * 100.0) / 100.0);
        data.put("productCount", baseProducts + (int)(Math.random() * 50));
        data.put("conversionRate", Math.round((2.0 + Math.random() * 3.0) * 100.0) / 100.0);
        
        return data;
    }
    
    /**
     * 获取店铺数据摘要
     */
    private Set<String> getStoreDataDigest(PlatformStore store, String dataType) {
        // 这里可以调用外部服务获取实际数据摘要
        // 目前返回模拟数据
        Set<String> digest = new HashSet<>();
        
        int count = 10 + (int)(Math.random() * 20);
        for (int i = 0; i < count; i++) {
            digest.add(dataType + "_" + store.getId() + "_" + i);
        }
        
        return digest;
    }
    
    /**
     * 分析数据一致性
     */
    private Map<String, Object> analyzeDataConsistency(Map<String, Set<String>> dataComparison) {
        Map<String, Object> analysis = new HashMap<>();
        
        if (dataComparison.size() < 2) {
            analysis.put("status", "INSUFFICIENT_DATA");
            analysis.put("message", "需要至少两个店铺进行一致性比较");
            return analysis;
        }
        
        // 计算数据重叠度
        List<Set<String>> dataSets = new ArrayList<>(dataComparison.values());
        Set<String> intersection = new HashSet<>(dataSets.get(0));
        Set<String> union = new HashSet<>(dataSets.get(0));
        
        for (int i = 1; i < dataSets.size(); i++) {
            intersection.retainAll(dataSets.get(i));
            union.addAll(dataSets.get(i));
        }
        
        double consistencyRate = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
        
        analysis.put("status", consistencyRate > 0.8 ? "CONSISTENT" : 
                    consistencyRate > 0.5 ? "PARTIALLY_CONSISTENT" : "INCONSISTENT");
        analysis.put("consistencyRate", Math.round(consistencyRate * 100.0) / 100.0);
        analysis.put("commonDataCount", intersection.size());
        analysis.put("totalUniqueDataCount", union.size());
        analysis.put("storeCount", dataComparison.size());
        
        return analysis;
    }
    
    // 店铺批量操作功能实现
    
    @Override
    @Transactional
    public Map<String, Object> batchProductManagement(Long userId, List<Long> storeIds, String operation, List<Map<String, Object>> productData) {
        log.info("批量商品管理: userId={}, storeIds={}, operation={}, productCount={}", 
                userId, storeIds, operation, productData.size());
        
        // 验证用户权限
        List<Long> authorizedStoreIds = storePermissionRepository.findStoreIdsByUserIdAndPermissions(
                userId, null, true, null, null);
        List<Long> validStoreIds = storeIds.stream()
                .filter(authorizedStoreIds::contains)
                .collect(Collectors.toList());
        
        if (validStoreIds.isEmpty()) {
            return Map.of("error", "用户无权限对指定店铺执行写操作");
        }
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> storeResults = new ArrayList<>();
        
        int totalSuccess = 0;
        int totalFailure = 0;
        
        for (Long storeId : validStoreIds) {
            Map<String, Object> storeResult = new HashMap<>();
            storeResult.put("storeId", storeId);
            
            try {
                PlatformStore store = platformStoreRepository.findById(storeId).orElse(null);
                if (store == null) {
                    storeResult.put("status", "FAILED");
                    storeResult.put("error", "店铺不存在");
                    storeResults.add(storeResult);
                    totalFailure++;
                    continue;
                }
                
                storeResult.put("storeName", store.getStoreName());
                storeResult.put("platformType", store.getPlatformType());
                
                // 执行批量商品操作
                Map<String, Object> operationResult = executeProductOperation(store, operation, productData);
                storeResult.putAll(operationResult);
                
                if ("SUCCESS".equals(operationResult.get("status"))) {
                    totalSuccess++;
                } else {
                    totalFailure++;
                }
                
            } catch (Exception e) {
                log.error("批量商品管理失败: storeId={}, operation={}", storeId, operation, e);
                storeResult.put("status", "FAILED");
                storeResult.put("error", e.getMessage());
                totalFailure++;
            }
            
            storeResults.add(storeResult);
        }
        
        result.put("operation", operation);
        result.put("totalStores", validStoreIds.size());
        result.put("successStores", totalSuccess);
        result.put("failureStores", totalFailure);
        result.put("storeResults", storeResults);
        result.put("executedAt", LocalDateTime.now());
        
        log.info("批量商品管理完成: userId={}, operation={}, 成功={}, 失败={}", 
                userId, operation, totalSuccess, totalFailure);
        
        return result;
    }
    
    @Override
    @Transactional
    public Map<String, Object> batchOrderProcessing(Long userId, List<Long> storeIds, String operation, Map<String, Object> orderCriteria) {
        log.info("批量订单处理: userId={}, storeIds={}, operation={}", userId, storeIds, operation);
        
        // 验证用户权限
        List<Long> authorizedStoreIds = storePermissionRepository.findStoreIdsByUserIdAndPermissions(
                userId, null, true, null, null);
        List<Long> validStoreIds = storeIds.stream()
                .filter(authorizedStoreIds::contains)
                .collect(Collectors.toList());
        
        if (validStoreIds.isEmpty()) {
            return Map.of("error", "用户无权限对指定店铺执行订单操作");
        }
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> storeResults = new ArrayList<>();
        
        int totalProcessed = 0;
        int totalSuccess = 0;
        int totalFailure = 0;
        
        for (Long storeId : validStoreIds) {
            Map<String, Object> storeResult = new HashMap<>();
            storeResult.put("storeId", storeId);
            
            try {
                PlatformStore store = platformStoreRepository.findById(storeId).orElse(null);
                if (store == null) {
                    storeResult.put("status", "FAILED");
                    storeResult.put("error", "店铺不存在");
                    storeResults.add(storeResult);
                    continue;
                }
                
                storeResult.put("storeName", store.getStoreName());
                storeResult.put("platformType", store.getPlatformType());
                
                // 执行批量订单操作
                Map<String, Object> operationResult = executeOrderOperation(store, operation, orderCriteria);
                storeResult.putAll(operationResult);
                
                int processed = (Integer) operationResult.getOrDefault("processedCount", 0);
                int success = (Integer) operationResult.getOrDefault("successCount", 0);
                int failure = (Integer) operationResult.getOrDefault("failureCount", 0);
                
                totalProcessed += processed;
                totalSuccess += success;
                totalFailure += failure;
                
            } catch (Exception e) {
                log.error("批量订单处理失败: storeId={}, operation={}", storeId, operation, e);
                storeResult.put("status", "FAILED");
                storeResult.put("error", e.getMessage());
                totalFailure++;
            }
            
            storeResults.add(storeResult);
        }
        
        result.put("operation", operation);
        result.put("totalStores", validStoreIds.size());
        result.put("totalProcessed", totalProcessed);
        result.put("totalSuccess", totalSuccess);
        result.put("totalFailure", totalFailure);
        result.put("storeResults", storeResults);
        result.put("executedAt", LocalDateTime.now());
        
        log.info("批量订单处理完成: userId={}, operation={}, 处理={}, 成功={}, 失败={}", 
                userId, operation, totalProcessed, totalSuccess, totalFailure);
        
        return result;
    }
    
    @Override
    @Transactional
    public Map<String, Object> batchStoreConfigUpdate(Long userId, List<Long> storeIds, Map<String, Object> configUpdates) {
        log.info("批量店铺配置更新: userId={}, storeIds={}, configKeys={}", 
                userId, storeIds, configUpdates.keySet());
        
        // 验证用户权限
        List<Long> authorizedStoreIds = storePermissionRepository.findStoreIdsByUserIdAndPermissions(
                userId, null, null, null, true);
        List<Long> validStoreIds = storeIds.stream()
                .filter(authorizedStoreIds::contains)
                .collect(Collectors.toList());
        
        if (validStoreIds.isEmpty()) {
            return Map.of("error", "用户无权限对指定店铺执行管理操作");
        }
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> storeResults = new ArrayList<>();
        
        int totalSuccess = 0;
        int totalFailure = 0;
        
        for (Long storeId : validStoreIds) {
            Map<String, Object> storeResult = new HashMap<>();
            storeResult.put("storeId", storeId);
            
            try {
                PlatformStore store = platformStoreRepository.findById(storeId).orElse(null);
                if (store == null) {
                    storeResult.put("status", "FAILED");
                    storeResult.put("error", "店铺不存在");
                    storeResults.add(storeResult);
                    totalFailure++;
                    continue;
                }
                
                storeResult.put("storeName", store.getStoreName());
                storeResult.put("platformType", store.getPlatformType());
                
                // 更新店铺配置
                Map<String, Object> currentConfig = new HashMap<>();
                if (store.getConfigData() != null) {
                    currentConfig = JsonUtils.parseMap(store.getConfigData());
                }
                
                // 合并配置更新
                currentConfig.putAll(configUpdates);
                store.setConfigData(JsonUtils.toJsonString(currentConfig));
                
                platformStoreRepository.save(store);
                
                storeResult.put("status", "SUCCESS");
                storeResult.put("updatedConfigs", configUpdates.keySet());
                totalSuccess++;
                
            } catch (Exception e) {
                log.error("批量店铺配置更新失败: storeId={}", storeId, e);
                storeResult.put("status", "FAILED");
                storeResult.put("error", e.getMessage());
                totalFailure++;
            }
            
            storeResults.add(storeResult);
        }
        
        result.put("totalStores", validStoreIds.size());
        result.put("successStores", totalSuccess);
        result.put("failureStores", totalFailure);
        result.put("configUpdates", configUpdates);
        result.put("storeResults", storeResults);
        result.put("executedAt", LocalDateTime.now());
        
        log.info("批量店铺配置更新完成: userId={}, 成功={}, 失败={}", userId, totalSuccess, totalFailure);
        
        return result;
    }
    
    @Override
    @Transactional
    public Map<String, Object> batchInventorySync(Long userId, List<Long> storeIds, List<Map<String, Object>> inventoryData) {
        log.info("批量库存同步: userId={}, storeIds={}, inventoryCount={}", 
                userId, storeIds, inventoryData.size());
        
        // 验证用户权限
        List<Long> authorizedStoreIds = storePermissionRepository.findStoreIdsByUserIdAndPermissions(
                userId, null, true, null, null);
        List<Long> validStoreIds = storeIds.stream()
                .filter(authorizedStoreIds::contains)
                .collect(Collectors.toList());
        
        if (validStoreIds.isEmpty()) {
            return Map.of("error", "用户无权限对指定店铺执行库存同步");
        }
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> storeResults = new ArrayList<>();
        
        int totalSynced = 0;
        int totalSuccess = 0;
        int totalFailure = 0;
        
        for (Long storeId : validStoreIds) {
            Map<String, Object> storeResult = new HashMap<>();
            storeResult.put("storeId", storeId);
            
            try {
                PlatformStore store = platformStoreRepository.findById(storeId).orElse(null);
                if (store == null) {
                    storeResult.put("status", "FAILED");
                    storeResult.put("error", "店铺不存在");
                    storeResults.add(storeResult);
                    continue;
                }
                
                storeResult.put("storeName", store.getStoreName());
                storeResult.put("platformType", store.getPlatformType());
                
                // 执行库存同步
                Map<String, Object> syncResult = executeInventorySync(store, inventoryData);
                storeResult.putAll(syncResult);
                
                int synced = (Integer) syncResult.getOrDefault("syncedCount", 0);
                int success = (Integer) syncResult.getOrDefault("successCount", 0);
                int failure = (Integer) syncResult.getOrDefault("failureCount", 0);
                
                totalSynced += synced;
                totalSuccess += success;
                totalFailure += failure;
                
            } catch (Exception e) {
                log.error("批量库存同步失败: storeId={}", storeId, e);
                storeResult.put("status", "FAILED");
                storeResult.put("error", e.getMessage());
                totalFailure++;
            }
            
            storeResults.add(storeResult);
        }
        
        result.put("totalStores", validStoreIds.size());
        result.put("totalSynced", totalSynced);
        result.put("totalSuccess", totalSuccess);
        result.put("totalFailure", totalFailure);
        result.put("storeResults", storeResults);
        result.put("executedAt", LocalDateTime.now());
        
        log.info("批量库存同步完成: userId={}, 同步={}, 成功={}, 失败={}", 
                userId, totalSynced, totalSuccess, totalFailure);
        
        return result;
    }
    
    /**
     * 执行商品操作
     */
    private Map<String, Object> executeProductOperation(PlatformStore store, String operation, List<Map<String, Object>> productData) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            PlatformAdapter adapter = getPlatformAdapter(store.getPlatformType());
            
            switch (operation.toUpperCase()) {
                case "UPLOAD":
                case "CREATE":
                    Map<String, Object> uploadResult = adapter.batchUploadProducts(store.getId().toString(), productData);
                    result.put("status", "SUCCESS");
                    result.putAll(uploadResult);
                    break;
                    
                case "UPDATE":
                    int successCount = 0;
                    int failureCount = 0;
                    
                    for (Map<String, Object> product : productData) {
                        boolean success = adapter.uploadProduct(store.getId().toString(), product);
                        if (success) {
                            successCount++;
                        } else {
                            failureCount++;
                        }
                    }
                    
                    result.put("status", failureCount == 0 ? "SUCCESS" : "PARTIAL_SUCCESS");
                    result.put("total", productData.size());
                    result.put("success", successCount);
                    result.put("failure", failureCount);
                    break;
                    
                default:
                    result.put("status", "FAILED");
                    result.put("error", "不支持的操作类型: " + operation);
            }
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 执行订单操作
     */
    private Map<String, Object> executeOrderOperation(PlatformStore store, String operation, Map<String, Object> orderCriteria) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 这里可以调用订单服务执行实际操作
            // 目前返回模拟结果
            int processedCount = 10 + (int)(Math.random() * 20);
            int successCount = (int)(processedCount * 0.9);
            int failureCount = processedCount - successCount;
            
            result.put("status", failureCount == 0 ? "SUCCESS" : "PARTIAL_SUCCESS");
            result.put("processedCount", processedCount);
            result.put("successCount", successCount);
            result.put("failureCount", failureCount);
            result.put("operation", operation);
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("error", e.getMessage());
            result.put("processedCount", 0);
            result.put("successCount", 0);
            result.put("failureCount", 0);
        }
        
        return result;
    }
    
    /**
     * 执行库存同步
     */
    private Map<String, Object> executeInventorySync(PlatformStore store, List<Map<String, Object>> inventoryData) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            PlatformAdapter adapter = getPlatformAdapter(store.getPlatformType());
            
            int successCount = 0;
            int failureCount = 0;
            
            for (Map<String, Object> inventory : inventoryData) {
                String sku = (String) inventory.get("sku");
                Integer quantity = (Integer) inventory.get("quantity");
                
                if (sku != null && quantity != null) {
                    boolean success = adapter.syncInventory(store.getId().toString(), sku, quantity);
                    if (success) {
                        successCount++;
                    } else {
                        failureCount++;
                    }
                } else {
                    failureCount++;
                }
            }
            
            result.put("status", failureCount == 0 ? "SUCCESS" : "PARTIAL_SUCCESS");
            result.put("syncedCount", inventoryData.size());
            result.put("successCount", successCount);
            result.put("failureCount", failureCount);
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("error", e.getMessage());
            result.put("syncedCount", 0);
            result.put("successCount", 0);
            result.put("failureCount", inventoryData.size());
        }
        
        return result;
    }
    
    /**
     * 转换实体到DTO
     */
    private PlatformStoreDTO convertToDTO(PlatformStore store) {
        PlatformStoreDTO dto = new PlatformStoreDTO();
        BeanUtils.copyProperties(store, dto);
        
        // 处理JSON字段
        if (store.getApiCredentials() != null) {
            dto.setApiCredentials(JsonUtils.parseMap(store.getApiCredentials()));
        }
        if (store.getConfigData() != null) {
            dto.setConfigData(JsonUtils.parseMap(store.getConfigData()));
        }
        
        dto.setStatus(store.getStatus().name());
        
        return dto;
    }
    
    /**
     * 转换权限实体到DTO
     */
    private StorePermissionDTO convertPermissionToDTO(StorePermission permission, String storeName, String userName) {
        StorePermissionDTO dto = new StorePermissionDTO();
        BeanUtils.copyProperties(permission, dto);
        
        dto.setPermissionType(permission.getPermissionType().name());
        dto.setStoreName(storeName);
        dto.setUserName(userName);
        
        if (permission.getCreateTime() != null) {
            dto.setCreatedAt(permission.getCreateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (permission.getUpdateTime() != null) {
            dto.setUpdatedAt(permission.getUpdateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        return dto;
    }
}