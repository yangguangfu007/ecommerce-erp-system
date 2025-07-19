package com.erp.platform.service.impl;

import com.erp.common.exception.BusinessException;
import com.erp.common.util.JsonUtils;
import com.erp.platform.adapter.PlatformAdapter;
import com.erp.platform.dto.PlatformStoreDTO;
import com.erp.platform.entity.PlatformStore;
import com.erp.platform.repository.PlatformStoreRepository;
import com.erp.platform.service.PlatformService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
}