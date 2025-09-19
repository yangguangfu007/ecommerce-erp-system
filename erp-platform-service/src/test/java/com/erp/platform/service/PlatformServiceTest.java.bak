package com.erp.platform.service;

import com.erp.platform.adapter.PlatformAdapter;
import com.erp.platform.dto.PlatformStoreDTO;
import com.erp.platform.entity.PlatformStore;
import com.erp.platform.repository.PlatformStoreRepository;
import com.erp.platform.service.impl.PlatformServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * 平台服务测试
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class PlatformServiceTest {
    
    @Mock
    private PlatformStoreRepository platformStoreRepository;
    
    @Mock
    private com.erp.platform.repository.StorePermissionRepository storePermissionRepository;
    
    @Mock
    private com.erp.platform.repository.StoreDataIsolationRepository storeDataIsolationRepository;
    
    @Mock
    private PlatformAdapter platformAdapter;
    
    private PlatformService platformService;
    
    @BeforeEach
    void setUp() {
        List<PlatformAdapter> adapters = Arrays.asList(platformAdapter);
        platformService = new PlatformServiceImpl(platformStoreRepository, storePermissionRepository, storeDataIsolationRepository, adapters);
    }
    
    @Test
    void testCreateStore_Success() {
        // 准备测试数据
        PlatformStoreDTO storeDTO = new PlatformStoreDTO();
        storeDTO.setStoreName("测试店铺");
        storeDTO.setPlatformType("WALMART");
        storeDTO.setApiCredentials(Map.of("clientId", "test-id", "clientSecret", "test-secret"));
        storeDTO.setStatus("ACTIVE");
        
        PlatformStore savedStore = new PlatformStore();
        savedStore.setId(1L);
        savedStore.setStoreName("测试店铺");
        savedStore.setPlatformType("WALMART");
        savedStore.setStatus(PlatformStore.StoreStatus.ACTIVE);
        savedStore.setCreateTime(LocalDateTime.now());
        savedStore.setUpdateTime(LocalDateTime.now());
        
        // Mock行为
        when(platformStoreRepository.findByStoreNameAndStatus(anyString(), any()))
                .thenReturn(Optional.empty());
        when(platformStoreRepository.save(any(PlatformStore.class)))
                .thenReturn(savedStore);
        
        // 执行测试
        PlatformStoreDTO result = platformService.createStore(storeDTO);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("测试店铺", result.getStoreName());
        assertEquals("WALMART", result.getPlatformType());
        assertEquals("ACTIVE", result.getStatus());
        
        // 验证调用
        verify(platformStoreRepository).findByStoreNameAndStatus("测试店铺", PlatformStore.StoreStatus.ACTIVE);
        verify(platformStoreRepository).save(any(PlatformStore.class));
    }
    
    @Test
    void testCreateStore_DuplicateName() {
        // 准备测试数据
        PlatformStoreDTO storeDTO = new PlatformStoreDTO();
        storeDTO.setStoreName("重复店铺");
        storeDTO.setPlatformType("WALMART");
        
        PlatformStore existingStore = new PlatformStore();
        existingStore.setId(1L);
        existingStore.setStoreName("重复店铺");
        
        // Mock行为
        when(platformStoreRepository.findByStoreNameAndStatus(anyString(), any()))
                .thenReturn(Optional.of(existingStore));
        
        // 执行测试并验证异常
        assertThrows(Exception.class, () -> {
            platformService.createStore(storeDTO);
        });
        
        // 验证没有保存
        verify(platformStoreRepository, never()).save(any(PlatformStore.class));
    }
    
    @Test
    void testGetStores_WithFilters() {
        // 准备测试数据
        PlatformStore store1 = new PlatformStore();
        store1.setId(1L);
        store1.setStoreName("沃尔玛店铺");
        store1.setPlatformType("WALMART");
        store1.setStatus(PlatformStore.StoreStatus.ACTIVE);
        
        PlatformStore store2 = new PlatformStore();
        store2.setId(2L);
        store2.setStoreName("亚马逊店铺");
        store2.setPlatformType("AMAZON");
        store2.setStatus(PlatformStore.StoreStatus.ACTIVE);
        
        List<PlatformStore> stores = Arrays.asList(store1, store2);
        
        // Mock行为
        when(platformStoreRepository.findByPlatformTypeAndStatus("WALMART", PlatformStore.StoreStatus.ACTIVE))
                .thenReturn(Arrays.asList(store1));
        
        // 执行测试
        List<PlatformStoreDTO> result = platformService.getStores("WALMART", "ACTIVE");
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("沃尔玛店铺", result.get(0).getStoreName());
        assertEquals("WALMART", result.get(0).getPlatformType());
        
        // 验证调用
        verify(platformStoreRepository).findByPlatformTypeAndStatus("WALMART", PlatformStore.StoreStatus.ACTIVE);
    }
    
    @Test
    void testTestStoreConnection_Success() {
        // 准备测试数据
        PlatformStore store = new PlatformStore();
        store.setId(1L);
        store.setPlatformType("WALMART");
        
        // Mock行为
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(store));
        when(platformAdapter.getPlatformName()).thenReturn("WALMART");
        when(platformAdapter.testConnection("1")).thenReturn(true);
        when(platformStoreRepository.save(any(PlatformStore.class))).thenReturn(store);
        
        // 执行测试
        boolean result = platformService.testStoreConnection(1L);
        
        // 验证结果
        assertTrue(result);
        
        // 验证调用
        verify(platformStoreRepository).findById(1L);
        verify(platformAdapter).testConnection("1");
        verify(platformStoreRepository).save(any(PlatformStore.class));
    }
    
    @Test
    void testFetchOrders_Success() {
        // 准备测试数据
        PlatformStore store = new PlatformStore();
        store.setId(1L);
        store.setPlatformType("WALMART");
        
        LocalDateTime fromDate = LocalDateTime.now().minusDays(1);
        LocalDateTime toDate = LocalDateTime.now();
        
        List<Map<String, Object>> mockOrders = Arrays.asList(
                Map.of("orderId", "ORDER001", "status", "NEW"),
                Map.of("orderId", "ORDER002", "status", "PROCESSING")
        );
        
        // Mock行为
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(store));
        when(platformAdapter.getPlatformName()).thenReturn("WALMART");
        when(platformAdapter.fetchOrders("1", fromDate, toDate)).thenReturn(mockOrders);
        when(platformStoreRepository.save(any(PlatformStore.class))).thenReturn(store);
        
        // 执行测试
        List<Map<String, Object>> result = platformService.fetchOrders(1L, fromDate, toDate);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("ORDER001", result.get(0).get("orderId"));
        assertEquals("ORDER002", result.get(1).get("orderId"));
        
        // 验证调用
        verify(platformStoreRepository).findById(1L);
        verify(platformAdapter).fetchOrders("1", fromDate, toDate);
        verify(platformStoreRepository).save(any(PlatformStore.class));
    }
    
    @Test
    void testUploadProduct_Success() {
        // 准备测试数据
        PlatformStore store = new PlatformStore();
        store.setId(1L);
        store.setPlatformType("WALMART");
        
        Map<String, Object> productData = Map.of(
                "sku", "TEST-SKU-001",
                "title", "测试商品",
                "price", 99.99
        );
        
        // Mock行为
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(store));
        when(platformAdapter.getPlatformName()).thenReturn("WALMART");
        when(platformAdapter.uploadProduct("1", productData)).thenReturn(true);
        
        // 执行测试
        boolean result = platformService.uploadProduct(1L, productData);
        
        // 验证结果
        assertTrue(result);
        
        // 验证调用
        verify(platformStoreRepository).findById(1L);
        verify(platformAdapter).uploadProduct("1", productData);
    }
    
    @Test
    void testBatchUploadProducts_Success() {
        // 准备测试数据
        PlatformStore store = new PlatformStore();
        store.setId(1L);
        store.setPlatformType("WALMART");
        
        List<Map<String, Object>> productsData = Arrays.asList(
                Map.of("sku", "SKU001", "title", "商品1", "price", 10.0),
                Map.of("sku", "SKU002", "title", "商品2", "price", 20.0)
        );
        
        Map<String, Object> batchResult = Map.of(
                "total", 2,
                "success", 2,
                "failure", 0
        );
        
        // Mock行为
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(store));
        when(platformAdapter.getPlatformName()).thenReturn("WALMART");
        when(platformAdapter.batchUploadProducts("1", productsData)).thenReturn(batchResult);
        
        // 执行测试
        Map<String, Object> result = platformService.batchUploadProducts(1L, productsData);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(2, result.get("total"));
        assertEquals(2, result.get("success"));
        assertEquals(0, result.get("failure"));
        
        // 验证调用
        verify(platformStoreRepository).findById(1L);
        verify(platformAdapter).batchUploadProducts("1", productsData);
    }
}