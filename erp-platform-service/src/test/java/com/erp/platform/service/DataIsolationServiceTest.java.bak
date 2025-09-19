package com.erp.platform.service;

import com.erp.common.exception.BusinessException;
import com.erp.platform.entity.PlatformStore;
import com.erp.platform.entity.StoreDataIsolation;
import com.erp.platform.entity.StorePermission;
import com.erp.platform.repository.PlatformStoreRepository;
import com.erp.platform.repository.StoreDataIsolationRepository;
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
 * 数据隔离服务测试
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class DataIsolationServiceTest {
    
    @Mock
    private PlatformStoreRepository platformStoreRepository;
    
    @Mock
    private StorePermissionRepository storePermissionRepository;
    
    @Mock
    private StoreDataIsolationRepository storeDataIsolationRepository;
    
    private PlatformService platformService;
    
    private PlatformStore testStore;
    private StoreDataIsolation testIsolation;
    private StorePermission testPermission;
    
    @BeforeEach
    void setUp() {
        platformService = new PlatformServiceImpl(
                platformStoreRepository, 
                storePermissionRepository, 
                storeDataIsolationRepository, 
                Arrays.asList()
        );
        
        // 准备测试数据
        testStore = new PlatformStore();
        testStore.setId(1L);
        testStore.setStoreName("测试店铺");
        testStore.setPlatformType("WALMART");
        testStore.setStatus(PlatformStore.StoreStatus.ACTIVE);
        testStore.setCreateTime(LocalDateTime.now());
        
        testIsolation = new StoreDataIsolation();
        testIsolation.setId(1L);
        testIsolation.setStoreId(1L);
        testIsolation.setDataType(StoreDataIsolation.DataType.ORDER);
        testIsolation.setIsolationLevel(StoreDataIsolation.IsolationLevel.STRICT);
        testIsolation.setEnabled(true);
        testIsolation.setConfigParams("{\"maxRecords\":1000}");
        
        testPermission = new StorePermission();
        testPermission.setId(1L);
        testPermission.setUserId(100L);
        testPermission.setStoreId(1L);
        testPermission.setPermissionType(StorePermission.PermissionType.ADMIN);
        testPermission.setCanRead(true);
        testPermission.setCanWrite(true);
        testPermission.setCanDelete(false);
        testPermission.setCanManage(true);
    }
    
    @Test
    void testConfigureDataIsolation_NewConfig() {
        // Given
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));
        when(storeDataIsolationRepository.findByStoreIdAndDataType(1L, StoreDataIsolation.DataType.ORDER))
                .thenReturn(Optional.empty());
        when(storeDataIsolationRepository.save(any(StoreDataIsolation.class))).thenReturn(testIsolation);
        
        Map<String, Object> configParams = new HashMap<>();
        configParams.put("maxRecords", 1000);
        configParams.put("retentionDays", 30);
        
        // When
        platformService.configureDataIsolation(1L, "ORDER", "STRICT", configParams);
        
        // Then
        verify(platformStoreRepository).findById(1L);
        verify(storeDataIsolationRepository).findByStoreIdAndDataType(1L, StoreDataIsolation.DataType.ORDER);
        verify(storeDataIsolationRepository).save(any(StoreDataIsolation.class));
    }
    
    @Test
    void testConfigureDataIsolation_UpdateExisting() {
        // Given
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));
        when(storeDataIsolationRepository.findByStoreIdAndDataType(1L, StoreDataIsolation.DataType.ORDER))
                .thenReturn(Optional.of(testIsolation));
        when(storeDataIsolationRepository.save(any(StoreDataIsolation.class))).thenReturn(testIsolation);
        
        Map<String, Object> configParams = new HashMap<>();
        configParams.put("maxRecords", 2000);
        
        // When
        platformService.configureDataIsolation(1L, "ORDER", "MODERATE", configParams);
        
        // Then
        verify(platformStoreRepository).findById(1L);
        verify(storeDataIsolationRepository).findByStoreIdAndDataType(1L, StoreDataIsolation.DataType.ORDER);
        verify(storeDataIsolationRepository).save(any(StoreDataIsolation.class));
    }
    
    @Test
    void testConfigureDataIsolation_StoreNotFound() {
        // Given
        when(platformStoreRepository.findById(999L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(BusinessException.class, () -> {
            platformService.configureDataIsolation(999L, "ORDER", "STRICT", null);
        });
        
        verify(platformStoreRepository).findById(999L);
        verify(storeDataIsolationRepository, never()).save(any(StoreDataIsolation.class));
    }
    
    @Test
    void testGetDataIsolationConfig() {
        // Given
        List<StoreDataIsolation> configs = Arrays.asList(testIsolation);
        when(storeDataIsolationRepository.findByStoreId(1L)).thenReturn(configs);
        
        // When
        Map<String, Object> result = platformService.getDataIsolationConfig(1L);
        
        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("ORDER"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> orderConfig = (Map<String, Object>) result.get("ORDER");
        assertEquals("STRICT", orderConfig.get("isolationLevel"));
        assertTrue((Boolean) orderConfig.get("enabled"));
        assertNotNull(orderConfig.get("configParams"));
        
        verify(storeDataIsolationRepository).findByStoreId(1L);
    }
    
    @Test
    void testCheckDataAccess_HasPermission() {
        // Given
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.of(testPermission));
        
        // When
        boolean result = platformService.checkDataAccess(100L, 1L, "ORDER", "READ");
        
        // Then
        assertTrue(result);
        
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
    }
    
    @Test
    void testCheckDataAccess_NoPermission() {
        // Given
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.empty());
        
        // When
        boolean result = platformService.checkDataAccess(100L, 1L, "ORDER", "READ");
        
        // Then
        assertFalse(result);
        
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
    }
    
    @Test
    void testCheckDataAccess_ReadOperation() {
        // Given
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.of(testPermission));
        
        // When
        boolean result = platformService.checkDataAccess(100L, 1L, "ORDER", "READ");
        
        // Then
        assertTrue(result);
        
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
    }
    
    @Test
    void testCheckDataAccess_WriteOperation() {
        // Given
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.of(testPermission));
        
        // When
        boolean result = platformService.checkDataAccess(100L, 1L, "ORDER", "WRITE");
        
        // Then
        assertTrue(result);
        
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
    }
    
    @Test
    void testCheckDataAccess_CreateOperation() {
        // Given
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.of(testPermission));
        
        // When
        boolean result = platformService.checkDataAccess(100L, 1L, "ORDER", "CREATE");
        
        // Then
        assertTrue(result);
        
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
    }
    
    @Test
    void testCheckDataAccess_UpdateOperation() {
        // Given
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.of(testPermission));
        
        // When
        boolean result = platformService.checkDataAccess(100L, 1L, "ORDER", "UPDATE");
        
        // Then
        assertTrue(result);
        
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
    }
    
    @Test
    void testCheckDataAccess_DeleteOperation() {
        // Given
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.of(testPermission));
        
        // When
        boolean result = platformService.checkDataAccess(100L, 1L, "ORDER", "DELETE");
        
        // Then
        assertFalse(result); // testPermission has canDelete = false
        
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
    }
    
    @Test
    void testCheckDataAccess_ManageOperation() {
        // Given
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.of(testPermission));
        
        // When
        boolean result = platformService.checkDataAccess(100L, 1L, "ORDER", "MANAGE");
        
        // Then
        assertTrue(result);
        
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
    }
    
    @Test
    void testCheckDataAccess_InvalidOperation() {
        // Given
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.of(testPermission));
        
        // When
        boolean result = platformService.checkDataAccess(100L, 1L, "ORDER", "INVALID");
        
        // Then
        assertFalse(result);
        
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
    }
    
    @Test
    void testCheckDataAccess_NoWritePermission() {
        // Given
        StorePermission readOnlyPermission = new StorePermission();
        readOnlyPermission.setUserId(100L);
        readOnlyPermission.setStoreId(1L);
        readOnlyPermission.setCanRead(true);
        readOnlyPermission.setCanWrite(false);
        readOnlyPermission.setCanDelete(false);
        readOnlyPermission.setCanManage(false);
        
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.of(readOnlyPermission));
        
        // When
        boolean result = platformService.checkDataAccess(100L, 1L, "ORDER", "WRITE");
        
        // Then
        assertFalse(result);
        
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
    }
}