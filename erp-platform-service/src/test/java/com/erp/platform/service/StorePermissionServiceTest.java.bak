package com.erp.platform.service;

import com.erp.common.exception.BusinessException;
import com.erp.platform.dto.StorePermissionDTO;
import com.erp.platform.entity.PlatformStore;
import com.erp.platform.entity.StorePermission;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * 店铺权限服务测试
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class StorePermissionServiceTest {
    
    @Mock
    private PlatformStoreRepository platformStoreRepository;
    
    @Mock
    private StorePermissionRepository storePermissionRepository;
    
    @Mock
    private com.erp.platform.repository.StoreDataIsolationRepository storeDataIsolationRepository;
    
    private PlatformService platformService;
    
    private PlatformStore testStore;
    private StorePermission testPermission;
    private StorePermissionDTO testPermissionDTO;
    
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
        
        testPermission = new StorePermission();
        testPermission.setId(1L);
        testPermission.setUserId(100L);
        testPermission.setStoreId(1L);
        testPermission.setPermissionType(StorePermission.PermissionType.ADMIN);
        testPermission.setCanRead(true);
        testPermission.setCanWrite(true);
        testPermission.setCanDelete(false);
        testPermission.setCanManage(true);
        
        testPermissionDTO = new StorePermissionDTO();
        testPermissionDTO.setUserId(100L);
        testPermissionDTO.setStoreId(1L);
        testPermissionDTO.setPermissionType("ADMIN");
        testPermissionDTO.setCanRead(true);
        testPermissionDTO.setCanWrite(true);
        testPermissionDTO.setCanDelete(false);
        testPermissionDTO.setCanManage(true);
    }
    
    @Test
    void testAssignStorePermission_NewPermission() {
        // Given
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.empty());
        when(storePermissionRepository.save(any(StorePermission.class))).thenReturn(testPermission);
        
        // When
        StorePermissionDTO result = platformService.assignStorePermission(testPermissionDTO);
        
        // Then
        assertNotNull(result);
        assertEquals(100L, result.getUserId());
        assertEquals(1L, result.getStoreId());
        assertEquals("ADMIN", result.getPermissionType());
        assertTrue(result.getCanRead());
        assertTrue(result.getCanWrite());
        assertFalse(result.getCanDelete());
        assertTrue(result.getCanManage());
        
        verify(platformStoreRepository).findById(1L);
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
        verify(storePermissionRepository).save(any(StorePermission.class));
    }
    
    @Test
    void testAssignStorePermission_UpdateExisting() {
        // Given
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));
        when(storePermissionRepository.findByUserIdAndStoreId(100L, 1L)).thenReturn(Optional.of(testPermission));
        when(storePermissionRepository.save(any(StorePermission.class))).thenReturn(testPermission);
        
        // When
        StorePermissionDTO result = platformService.assignStorePermission(testPermissionDTO);
        
        // Then
        assertNotNull(result);
        assertEquals(100L, result.getUserId());
        assertEquals(1L, result.getStoreId());
        
        verify(platformStoreRepository).findById(1L);
        verify(storePermissionRepository).findByUserIdAndStoreId(100L, 1L);
        verify(storePermissionRepository).save(any(StorePermission.class));
    }
    
    @Test
    void testAssignStorePermission_StoreNotFound() {
        // Given
        when(platformStoreRepository.findById(999L)).thenReturn(Optional.empty());
        
        testPermissionDTO.setStoreId(999L);
        
        // When & Then
        assertThrows(BusinessException.class, () -> {
            platformService.assignStorePermission(testPermissionDTO);
        });
        
        verify(platformStoreRepository).findById(999L);
        verify(storePermissionRepository, never()).save(any(StorePermission.class));
    }
    
    @Test
    void testUpdateStorePermission() {
        // Given
        when(storePermissionRepository.findById(1L)).thenReturn(Optional.of(testPermission));
        when(storePermissionRepository.save(any(StorePermission.class))).thenReturn(testPermission);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));
        
        StorePermissionDTO updateDTO = new StorePermissionDTO();
        updateDTO.setPermissionType("OPERATOR");
        updateDTO.setCanDelete(true);
        
        // When
        StorePermissionDTO result = platformService.updateStorePermission(1L, updateDTO);
        
        // Then
        assertNotNull(result);
        
        verify(storePermissionRepository).findById(1L);
        verify(storePermissionRepository).save(any(StorePermission.class));
        verify(platformStoreRepository).findById(1L);
    }
    
    @Test
    void testUpdateStorePermission_NotFound() {
        // Given
        when(storePermissionRepository.findById(999L)).thenReturn(Optional.empty());
        
        StorePermissionDTO updateDTO = new StorePermissionDTO();
        updateDTO.setPermissionType("OPERATOR");
        
        // When & Then
        assertThrows(BusinessException.class, () -> {
            platformService.updateStorePermission(999L, updateDTO);
        });
        
        verify(storePermissionRepository).findById(999L);
        verify(storePermissionRepository, never()).save(any(StorePermission.class));
    }
    
    @Test
    void testRemoveStorePermission() {
        // Given
        when(storePermissionRepository.findById(1L)).thenReturn(Optional.of(testPermission));
        
        // When
        platformService.removeStorePermission(1L);
        
        // Then
        verify(storePermissionRepository).findById(1L);
        verify(storePermissionRepository).delete(testPermission);
    }
    
    @Test
    void testRemoveStorePermission_NotFound() {
        // Given
        when(storePermissionRepository.findById(999L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(BusinessException.class, () -> {
            platformService.removeStorePermission(999L);
        });
        
        verify(storePermissionRepository).findById(999L);
        verify(storePermissionRepository, never()).delete(any(StorePermission.class));
    }
    
    @Test
    void testGetUserStorePermissions() {
        // Given
        List<StorePermission> permissions = Arrays.asList(testPermission);
        when(storePermissionRepository.findByUserId(100L)).thenReturn(permissions);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));
        
        // When
        List<StorePermissionDTO> result = platformService.getUserStorePermissions(100L);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getUserId());
        assertEquals(1L, result.get(0).getStoreId());
        assertEquals("测试店铺", result.get(0).getStoreName());
        
        verify(storePermissionRepository).findByUserId(100L);
        verify(platformStoreRepository).findById(1L);
    }
    
    @Test
    void testGetStorePermissions() {
        // Given
        List<StorePermission> permissions = Arrays.asList(testPermission);
        when(storePermissionRepository.findByStoreId(1L)).thenReturn(permissions);
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));
        
        // When
        List<StorePermissionDTO> result = platformService.getStorePermissions(1L);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getUserId());
        assertEquals(1L, result.get(0).getStoreId());
        assertEquals("测试店铺", result.get(0).getStoreName());
        
        verify(storePermissionRepository).findByStoreId(1L);
        verify(platformStoreRepository).findById(1L);
    }
    
    @Test
    void testHasStorePermission_Read() {
        // Given
        when(storePermissionRepository.hasPermission(100L, 1L, true, null, null, null)).thenReturn(true);
        
        // When
        boolean result = platformService.hasStorePermission(100L, 1L, "READ");
        
        // Then
        assertTrue(result);
        
        verify(storePermissionRepository).hasPermission(100L, 1L, true, null, null, null);
    }
    
    @Test
    void testHasStorePermission_Write() {
        // Given
        when(storePermissionRepository.hasPermission(100L, 1L, null, true, null, null)).thenReturn(true);
        
        // When
        boolean result = platformService.hasStorePermission(100L, 1L, "WRITE");
        
        // Then
        assertTrue(result);
        
        verify(storePermissionRepository).hasPermission(100L, 1L, null, true, null, null);
    }
    
    @Test
    void testHasStorePermission_Delete() {
        // Given
        when(storePermissionRepository.hasPermission(100L, 1L, null, null, true, null)).thenReturn(false);
        
        // When
        boolean result = platformService.hasStorePermission(100L, 1L, "DELETE");
        
        // Then
        assertFalse(result);
        
        verify(storePermissionRepository).hasPermission(100L, 1L, null, null, true, null);
    }
    
    @Test
    void testHasStorePermission_Manage() {
        // Given
        when(storePermissionRepository.hasPermission(100L, 1L, null, null, null, true)).thenReturn(true);
        
        // When
        boolean result = platformService.hasStorePermission(100L, 1L, "MANAGE");
        
        // Then
        assertTrue(result);
        
        verify(storePermissionRepository).hasPermission(100L, 1L, null, null, null, true);
    }
    
    @Test
    void testHasStorePermission_InvalidType() {
        // When
        boolean result = platformService.hasStorePermission(100L, 1L, "INVALID");
        
        // Then
        assertFalse(result);
        
        verify(storePermissionRepository, never()).hasPermission(anyLong(), anyLong(), any(), any(), any(), any());
    }
    
    @Test
    void testGetStoresByUser() {
        // Given
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<PlatformStore> stores = Arrays.asList(testStore);
        
        when(storePermissionRepository.findStoreIdsByUserId(100L)).thenReturn(storeIds);
        when(platformStoreRepository.findAllById(storeIds)).thenReturn(stores);
        
        // When
        List<com.erp.platform.dto.PlatformStoreDTO> result = platformService.getStoresByUser(100L, null, null);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("测试店铺", result.get(0).getStoreName());
        
        verify(storePermissionRepository).findStoreIdsByUserId(100L);
        verify(platformStoreRepository).findAllById(storeIds);
    }
    
    @Test
    void testGetStoresByUser_NoPermissions() {
        // Given
        when(storePermissionRepository.findStoreIdsByUserId(100L)).thenReturn(Arrays.asList());
        
        // When
        List<com.erp.platform.dto.PlatformStoreDTO> result = platformService.getStoresByUser(100L, null, null);
        
        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        
        verify(storePermissionRepository).findStoreIdsByUserId(100L);
        verify(platformStoreRepository, never()).findAllById(any());
    }
    
    @Test
    void testGetStoresByUser_WithFilters() {
        // Given
        List<Long> storeIds = Arrays.asList(1L);
        List<PlatformStore> stores = Arrays.asList(testStore);
        
        when(storePermissionRepository.findStoreIdsByUserId(100L)).thenReturn(storeIds);
        when(platformStoreRepository.findAllById(storeIds)).thenReturn(stores);
        
        // When
        List<com.erp.platform.dto.PlatformStoreDTO> result = platformService.getStoresByUser(100L, "WALMART", "ACTIVE");
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("测试店铺", result.get(0).getStoreName());
        assertEquals("WALMART", result.get(0).getPlatformType());
        
        verify(storePermissionRepository).findStoreIdsByUserId(100L);
        verify(platformStoreRepository).findAllById(storeIds);
    }
}