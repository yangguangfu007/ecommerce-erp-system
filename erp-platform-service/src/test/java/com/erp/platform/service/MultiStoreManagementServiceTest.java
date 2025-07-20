package com.erp.platform.service;

import com.erp.platform.entity.PlatformStore;
import com.erp.platform.repository.PlatformStoreRepository;
import com.erp.platform.repository.StorePermissionRepository;
import com.erp.platform.service.impl.PlatformServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 多店铺管理服务测试
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class MultiStoreManagementServiceTest {
    
    @Mock
    private PlatformStoreRepository platformStoreRepository;
    
    @Mock
    private StorePermissionRepository storePermissionRepository;
    
    @Mock
    private com.erp.platform.repository.StoreDataIsolationRepository storeDataIsolationRepository;
    
    private PlatformService platformService;
    
    private PlatformStore testStore1;
    private PlatformStore testStore2;
    
    @BeforeEach
    void setUp() {
        platformService = new PlatformServiceImpl(
                platformStoreRepository, 
                storePermissionRepository, 
                storeDataIsolationRepository, 
                Arrays.asList()
        );
        
        // 准备测试数据
        testStore1 = new PlatformStore();
        testStore1.setId(1L);
        testStore1.setStoreName("沃尔玛店铺");
        testStore1.setPlatformType("WALMART");
        testStore1.setStatus(PlatformStore.StoreStatus.ACTIVE);
        testStore1.setConnectionStatus(true);
        testStore1.setLastSyncTime(LocalDateTime.now().minusHours(1));
        testStore1.setLastConnectionCheck(LocalDateTime.now().minusMinutes(30));
        
        testStore2 = new PlatformStore();
        testStore2.setId(2L);
        testStore2.setStoreName("亚马逊店铺");
        testStore2.setPlatformType("AMAZON");
        testStore2.setStatus(PlatformStore.StoreStatus.ACTIVE);
        testStore2.setConnectionStatus(false);
        testStore2.setLastSyncTime(LocalDateTime.now().minusHours(3));
        testStore2.setLastConnectionCheck(LocalDateTime.now().minusHours(1));
    }
    
    @Test
    void testCrossStoreDataQuery_WithPermissions() {
        // Given
        List<Long> authorizedStoreIds = Arrays.asList(1L, 2L);
        List<PlatformStore> stores = Arrays.asList(testStore1, testStore2);
        
        when(storePermissionRepository.findStoreIdsByUserId(100L)).thenReturn(authorizedStoreIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L))
                .thenReturn(Optional.of(createPermission(100L, 1L, true, false, false, false)));
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 2L))
                .thenReturn(Optional.of(createPermission(100L, 2L, true, false, false, false)));
        
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("dateRange", "LAST_30_DAYS");
        
        // When
        Map<String, Object> result = platformService.crossStoreDataQuery(100L, "ORDER", queryParams);
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("stores"));
        assertTrue(result.containsKey("totalCount"));
        assertTrue(result.containsKey("authorizedStoreCount"));
        assertEquals(2, result.get("authorizedStoreCount"));
        assertEquals("ORDER", result.get("dataType"));
        assertNotNull(result.get("queryTime"));
        
        verify(storePermissionRepository).findStoreIdsByUserId(100L);
        verify(platformStoreRepository).findById(1L);
        verify(platformStoreRepository).findById(2L);
    }
    
    @Test
    void testCrossStoreDataQuery_NoPermissions() {
        // Given
        when(storePermissionRepository.findStoreIdsByUserId(100L)).thenReturn(Arrays.asList());
        
        Map<String, Object> queryParams = new HashMap<>();
        
        // When
        Map<String, Object> result = platformService.crossStoreDataQuery(100L, "ORDER", queryParams);
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("stores"));
        assertTrue(result.containsKey("totalCount"));
        assertEquals(0, result.get("totalCount"));
        assertEquals("用户无店铺访问权限", result.get("message"));
        
        verify(storePermissionRepository).findStoreIdsByUserId(100L);
        verify(platformStoreRepository, never()).findById(any());
    }
    
    @Test
    void testGetStoreOperationalStats() {
        // Given
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<Long> authorizedStoreIds = Arrays.asList(1L, 2L);
        
        when(storePermissionRepository.findStoreIdsByUserId(100L)).thenReturn(authorizedStoreIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        
        // When
        Map<String, Object> result = platformService.getStoreOperationalStats(100L, storeIds, "LAST_30_DAYS");
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("summary"));
        assertTrue(result.containsKey("storeStats"));
        assertTrue(result.containsKey("dateRange"));
        assertTrue(result.containsKey("generatedAt"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) result.get("summary");
        assertEquals(2, summary.get("totalStores"));
        assertTrue(summary.containsKey("totalOrders"));
        assertTrue(summary.containsKey("totalRevenue"));
        assertTrue(summary.containsKey("totalProducts"));
        assertTrue(summary.containsKey("averageOrderValue"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> storeStats = (List<Map<String, Object>>) result.get("storeStats");
        assertEquals(2, storeStats.size());
        
        verify(storePermissionRepository).findStoreIdsByUserId(100L);
        verify(platformStoreRepository).findById(1L);
        verify(platformStoreRepository).findById(2L);
    }
    
    @Test
    void testGetStoreOperationalStats_NoPermissions() {
        // Given
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<Long> authorizedStoreIds = Arrays.asList(); // 用户无权限
        
        when(storePermissionRepository.findStoreIdsByUserId(100L)).thenReturn(authorizedStoreIds);
        
        // When
        Map<String, Object> result = platformService.getStoreOperationalStats(100L, storeIds, "LAST_30_DAYS");
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        assertEquals("用户无权限访问指定店铺", result.get("error"));
        
        verify(storePermissionRepository).findStoreIdsByUserId(100L);
        verify(platformStoreRepository, never()).findById(any());
    }
    
    @Test
    void testGetStoreOperationalStats_PartialPermissions() {
        // Given
        List<Long> storeIds = Arrays.asList(1L, 2L, 3L);
        List<Long> authorizedStoreIds = Arrays.asList(1L, 2L); // 只有部分权限
        
        when(storePermissionRepository.findStoreIdsByUserId(100L)).thenReturn(authorizedStoreIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        
        // When
        Map<String, Object> result = platformService.getStoreOperationalStats(100L, storeIds, "LAST_30_DAYS");
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("summary"));
        assertTrue(result.containsKey("storeStats"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) result.get("summary");
        assertEquals(2, summary.get("totalStores")); // 只统计有权限的店铺
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> storeStats = (List<Map<String, Object>>) result.get("storeStats");
        assertEquals(2, storeStats.size());
        
        verify(storePermissionRepository).findStoreIdsByUserId(100L);
        verify(platformStoreRepository).findById(1L);
        verify(platformStoreRepository).findById(2L);
        verify(platformStoreRepository, never()).findById(3L); // 无权限的店铺不会查询
    }
    
    @Test
    void testCheckMultiStoreDataSync() {
        // Given
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<Long> authorizedStoreIds = Arrays.asList(1L, 2L);
        
        when(storePermissionRepository.findStoreIdsByUserId(100L)).thenReturn(authorizedStoreIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        
        // When
        Map<String, Object> result = platformService.checkMultiStoreDataSync(100L, storeIds);
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("storeStatus"));
        assertTrue(result.containsKey("summary"));
        assertTrue(result.containsKey("checkTime"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> syncStatusList = (List<Map<String, Object>>) result.get("storeStatus");
        assertNotNull(syncStatusList);
        
        // 验证第一个店铺的同步状态
        Map<String, Object> store1Status = syncStatusList.get(0);
        assertEquals(1L, store1Status.get("storeId"));
        assertEquals("沃尔玛店铺", store1Status.get("storeName"));
        assertEquals("WALMART", store1Status.get("platformType"));
        assertTrue((Boolean) store1Status.get("connectionStatus"));
        
        // 验证第二个店铺的同步状态
        Map<String, Object> store2Status = syncStatusList.get(1);
        assertEquals(2L, store2Status.get("storeId"));
        assertEquals("亚马逊店铺", store2Status.get("storeName"));
        assertEquals("AMAZON", store2Status.get("platformType"));
        assertFalse((Boolean) store2Status.get("connectionStatus"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) result.get("summary");
        assertTrue(summary.containsKey("totalStores"));
        assertTrue(summary.containsKey("healthyStores"));
        assertTrue(summary.containsKey("syncIssueStores"));
        assertTrue(summary.containsKey("offlineStores"));
        
        verify(storePermissionRepository).findStoreIdsByUserId(100L);
        verify(platformStoreRepository).findById(1L);
        verify(platformStoreRepository).findById(2L);
    }
    
    @Test
    void testCheckStoreDataConsistency() {
        // Given
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<Long> authorizedStoreIds = Arrays.asList(1L, 2L);
        
        when(storePermissionRepository.findStoreIdsByUserId(100L)).thenReturn(authorizedStoreIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L))
                .thenReturn(Optional.of(createPermission(100L, 1L, true, false, false, false)));
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 2L))
                .thenReturn(Optional.of(createPermission(100L, 2L, true, false, false, false)));
        
        // When
        Map<String, Object> result = platformService.checkStoreDataConsistency(100L, storeIds, "PRODUCT");
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("consistencyAnalysis"));
        assertTrue(result.containsKey("storeResults"));
        assertTrue(result.containsKey("dataType"));
        assertTrue(result.containsKey("checkTime"));
        assertEquals("PRODUCT", result.get("dataType"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> consistencyAnalysis = (Map<String, Object>) result.get("consistencyAnalysis");
        assertNotNull(consistencyAnalysis);
        
        verify(storePermissionRepository).findStoreIdsByUserId(100L);
        verify(platformStoreRepository).findById(1L);
        verify(platformStoreRepository).findById(2L);
    }
    
    @Test
    void testBatchProductManagement() {
        // Given
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<Long> authorizedStoreIds = Arrays.asList(1L, 2L);
        List<Map<String, Object>> productData = Arrays.asList(
                Map.of("sku", "SKU001", "title", "商品1", "price", 10.0),
                Map.of("sku", "SKU002", "title", "商品2", "price", 20.0)
        );
        
        when(storePermissionRepository.findStoreIdsByUserIdAndPermissions(100L, null, true, null, null)).thenReturn(authorizedStoreIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        
        // When
        Map<String, Object> result = platformService.batchProductManagement(100L, storeIds, "UPLOAD", productData);
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("operation"));
        assertTrue(result.containsKey("totalStores"));
        assertTrue(result.containsKey("storeResults"));
        assertTrue(result.containsKey("executedAt"));
        assertEquals("UPLOAD", result.get("operation"));
        
        assertEquals(2, result.get("totalStores"));
        
        verify(storePermissionRepository).findStoreIdsByUserIdAndPermissions(100L, null, true, null, null);
        verify(platformStoreRepository).findById(1L);
        verify(platformStoreRepository).findById(2L);
    }
    
    @Test
    void testBatchOrderProcessing() {
        // Given
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<Long> authorizedStoreIds = Arrays.asList(1L, 2L);
        Map<String, Object> orderCriteria = Map.of(
                "status", "NEW",
                "dateRange", "LAST_7_DAYS"
        );
        
        when(storePermissionRepository.findStoreIdsByUserIdAndPermissions(100L, null, true, null, null)).thenReturn(authorizedStoreIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        
        // When
        Map<String, Object> result = platformService.batchOrderProcessing(100L, storeIds, "SHIP", orderCriteria);
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("operation"));
        assertTrue(result.containsKey("totalStores"));
        assertTrue(result.containsKey("storeResults"));
        assertTrue(result.containsKey("executedAt"));
        assertEquals("SHIP", result.get("operation"));
        
        assertEquals(2, result.get("totalStores"));
        
        verify(storePermissionRepository).findStoreIdsByUserIdAndPermissions(100L, null, true, null, null);
        verify(platformStoreRepository).findById(1L);
        verify(platformStoreRepository).findById(2L);
    }
    
    @Test
    void testBatchInventorySync() {
        // Given
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<Long> authorizedStoreIds = Arrays.asList(1L, 2L);
        List<Map<String, Object>> inventoryData = Arrays.asList(
                Map.of("sku", "SKU001", "quantity", 100),
                Map.of("sku", "SKU002", "quantity", 200)
        );
        
        when(storePermissionRepository.findStoreIdsByUserIdAndPermissions(100L, null, true, null, null)).thenReturn(authorizedStoreIds);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore1));
        when(platformStoreRepository.findById(2L)).thenReturn(Optional.of(testStore2));
        
        // When
        Map<String, Object> result = platformService.batchInventorySync(100L, storeIds, inventoryData);
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("totalStores"));
        assertTrue(result.containsKey("storeResults"));
        assertTrue(result.containsKey("executedAt"));
        
        assertEquals(2, result.get("totalStores"));
        
        verify(storePermissionRepository).findStoreIdsByUserIdAndPermissions(100L, null, true, null, null);
        verify(platformStoreRepository).findById(1L);
        verify(platformStoreRepository).findById(2L);
    }
    
    /**
     * 创建测试权限对象
     */
    private com.erp.platform.entity.StorePermission createPermission(Long userId, Long storeId, 
                                                                    boolean canRead, boolean canWrite, 
                                                                    boolean canDelete, boolean canManage) {
        com.erp.platform.entity.StorePermission permission = new com.erp.platform.entity.StorePermission();
        permission.setUserId(userId);
        permission.setStoreId(storeId);
        permission.setCanRead(canRead);
        permission.setCanWrite(canWrite);
        permission.setCanDelete(canDelete);
        permission.setCanManage(canManage);
        return permission;
    }
}