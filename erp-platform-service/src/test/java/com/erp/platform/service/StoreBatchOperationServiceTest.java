package com.erp.platform.service;

import com.erp.platform.adapter.PlatformAdapter;
import com.erp.platform.entity.PlatformStore;
import com.erp.platform.repository.PlatformStoreRepository;
import com.erp.platform.repository.StorePermissionRepository;
import com.erp.platform.repository.StoreDataIsolationRepository;
import com.erp.platform.service.impl.PlatformServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 店铺批量操作服务测试
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class StoreBatchOperationServiceTest {
    
    @Mock
    private PlatformStoreRepository platformStoreRepository;
    
    @Mock
    private StorePermissionRepository storePermissionRepository;
    
    @Mock
    private StoreDataIsolationRepository storeDataIsolationRepository;
    
    @Mock
    private PlatformAdapter platformAdapter;
    
    private PlatformServiceImpl platformService;
    
    private PlatformStore testStore1;
    private PlatformStore testStore2;
    
    @BeforeEach
    void setUp() {
        List<PlatformAdapter> adapters = Arrays.asList(platformAdapter);
        platformService = new PlatformServiceImpl(platformStoreRepository, storePermissionRepository, storeDataIsolationRepository, adapters);
        
        // 初始化测试数据
        testStore1 = new PlatformStore();
        testStore1.setId(1L);
        testStore1.setStoreName("测试店铺1");
        testStore1.setPlatformType("WALMART");
        testStore1.setStatus(PlatformStore.StoreStatus.ACTIVE);
        
        testStore2 = new PlatformStore();
        testStore2.setId(2L);
        testStore2.setStoreName("测试店铺2");
        testStore2.setPlatformType("WALMART");
        testStore2.setStatus(PlatformStore.StoreStatus.ACTIVE);
    }
    
    @Test
    void testBatchProductManagement() {
        // 准备测试数据
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<Map<String, Object>> productData = Arrays.asList(
                Map.of("sku", "SKU001", "title", "商品1", "price", 10.0),
                Map.of("sku", "SKU002", "title", "商品2", "price", 20.0)
        );
        
        when(storePermissionRepository.findStoreIdsByUserIdAndPermissions(1L, null, true, null, null))
                .thenReturn(storeIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        when(platformAdapter.getPlatformName()).thenReturn("WALMART");
        when(platformAdapter.batchUploadProducts(anyString(), anyList()))
                .thenReturn(Map.of("total", 2, "success", 2, "failure", 0));
        
        // 执行测试
        Map<String, Object> result = platformService.batchProductManagement(1L, storeIds, "UPLOAD", productData);
        
        // 验证结果
        assertNotNull(result);
        assertEquals("UPLOAD", result.get("operation"));
        assertEquals(2, result.get("totalStores"));
        assertEquals(2, result.get("successStores"));
        assertEquals(0, result.get("failureStores"));
        
        verify(storePermissionRepository).findStoreIdsByUserIdAndPermissions(1L, null, true, null, null);
        verify(platformAdapter, times(2)).batchUploadProducts(anyString(), anyList());
    }
    
    @Test
    void testBatchOrderProcessing() {
        // 准备测试数据
        List<Long> storeIds = Arrays.asList(1L, 2L);
        Map<String, Object> orderCriteria = Map.of("status", "PENDING", "dateRange", "LAST_7_DAYS");
        
        when(storePermissionRepository.findStoreIdsByUserIdAndPermissions(1L, null, true, null, null))
                .thenReturn(storeIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        
        // 执行测试
        Map<String, Object> result = platformService.batchOrderProcessing(1L, storeIds, "SHIP", orderCriteria);
        
        // 验证结果
        assertNotNull(result);
        assertEquals("SHIP", result.get("operation"));
        assertEquals(2, result.get("totalStores"));
        assertTrue((Integer) result.get("totalProcessed") > 0);
        
        verify(storePermissionRepository).findStoreIdsByUserIdAndPermissions(1L, null, true, null, null);
        verify(platformStoreRepository).findById(1L);
        verify(platformStoreRepository).findById(2L);
    }
    
    @Test
    void testBatchStoreConfigUpdate() {
        // 准备测试数据
        List<Long> storeIds = Arrays.asList(1L, 2L);
        Map<String, Object> configUpdates = Map.of(
                "autoSync", true,
                "syncInterval", 600,
                "enableNotifications", true
        );
        
        when(storePermissionRepository.findStoreIdsByUserIdAndPermissions(1L, null, null, null, true))
                .thenReturn(storeIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        when(platformStoreRepository.save(any(PlatformStore.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行测试
        Map<String, Object> result = platformService.batchStoreConfigUpdate(1L, storeIds, configUpdates);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(2, result.get("totalStores"));
        assertEquals(2, result.get("successStores"));
        assertEquals(0, result.get("failureStores"));
        assertEquals(configUpdates, result.get("configUpdates"));
        
        verify(storePermissionRepository).findStoreIdsByUserIdAndPermissions(1L, null, null, null, true);
        verify(platformStoreRepository, times(2)).save(any(PlatformStore.class));
    }
    
    @Test
    void testBatchInventorySync() {
        // 准备测试数据
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<Map<String, Object>> inventoryData = Arrays.asList(
                Map.of("sku", "SKU001", "quantity", 100),
                Map.of("sku", "SKU002", "quantity", 200)
        );
        
        when(storePermissionRepository.findStoreIdsByUserIdAndPermissions(1L, null, true, null, null))
                .thenReturn(storeIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        when(platformAdapter.getPlatformName()).thenReturn("WALMART");
        when(platformAdapter.syncInventory(anyString(), anyString(), anyInt())).thenReturn(true);
        
        // 执行测试
        Map<String, Object> result = platformService.batchInventorySync(1L, storeIds, inventoryData);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(2, result.get("totalStores"));
        assertEquals(4, result.get("totalSynced")); // 2 stores * 2 inventory items
        assertEquals(4, result.get("totalSuccess"));
        assertEquals(0, result.get("totalFailure"));
        
        verify(storePermissionRepository).findStoreIdsByUserIdAndPermissions(1L, null, true, null, null);
        verify(platformAdapter, times(4)).syncInventory(anyString(), anyString(), anyInt());
    }
    
    @Test
    void testCrossStoreDataQuery() {
        // 准备测试数据
        Map<String, Object> queryParams = Map.of("dateRange", "LAST_30_DAYS");
        
        when(storePermissionRepository.findStoreIdsByUserId(1L))
                .thenReturn(Arrays.asList(1L, 2L));
        when(storePermissionRepository.findByUserIdAndStoreId(1L, 1L))
                .thenReturn(Optional.of(createMockPermission()));
        when(storePermissionRepository.findByUserIdAndStoreId(1L, 2L))
                .thenReturn(Optional.of(createMockPermission()));
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        
        // 执行测试
        Map<String, Object> result = platformService.crossStoreDataQuery(1L, "ORDER", queryParams);
        
        // 验证结果
        assertNotNull(result);
        assertEquals("ORDER", result.get("dataType"));
        assertEquals(2, result.get("authorizedStoreCount"));
        assertTrue(result.containsKey("stores"));
        assertTrue(result.containsKey("totalCount"));
        
        verify(storePermissionRepository).findStoreIdsByUserId(1L);
    }
    
    @Test
    void testGetStoreOperationalStats() {
        // 准备测试数据
        List<Long> storeIds = Arrays.asList(1L, 2L);
        
        when(storePermissionRepository.findStoreIdsByUserId(1L))
                .thenReturn(storeIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        
        // 执行测试
        Map<String, Object> result = platformService.getStoreOperationalStats(1L, storeIds, "LAST_30_DAYS");
        
        // 验证结果
        assertNotNull(result);
        assertTrue(result.containsKey("summary"));
        assertTrue(result.containsKey("storeStats"));
        assertEquals("LAST_30_DAYS", result.get("dateRange"));
        
        Map<String, Object> summary = (Map<String, Object>) result.get("summary");
        assertEquals(2, summary.get("totalStores"));
        
        verify(storePermissionRepository).findStoreIdsByUserId(1L);
    }
    
    private com.erp.platform.entity.StorePermission createMockPermission() {
        com.erp.platform.entity.StorePermission permission = new com.erp.platform.entity.StorePermission();
        permission.setCanRead(true);
        permission.setCanWrite(true);
        permission.setCanDelete(false);
        permission.setCanManage(true);
        return permission;
    }
}