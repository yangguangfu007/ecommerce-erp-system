package com.erp.platform.service;

import com.erp.common.exception.BusinessException;
import com.erp.platform.dto.PlatformStoreDTO;
import com.erp.platform.dto.StorePermissionDTO;
import com.erp.platform.entity.PlatformStore;
import com.erp.platform.entity.StorePermission;
import com.erp.platform.entity.StoreDataIsolation;
import com.erp.platform.repository.PlatformStoreRepository;
import com.erp.platform.repository.StorePermissionRepository;
import com.erp.platform.repository.StoreDataIsolationRepository;
import com.erp.platform.service.impl.PlatformServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 店铺管理服务测试
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class StoreManagementServiceTest {
    
    @Mock
    private PlatformStoreRepository platformStoreRepository;
    
    @Mock
    private StorePermissionRepository storePermissionRepository;
    
    @Mock
    private StoreDataIsolationRepository storeDataIsolationRepository;
    
    @Mock
    private List<com.erp.platform.adapter.PlatformAdapter> platformAdapters;
    
    @InjectMocks
    private PlatformServiceImpl platformService;
    
    private PlatformStore testStore;
    private StorePermission testPermission;
    private StoreDataIsolation testDataIsolation;
    
    @BeforeEach
    void setUp() {
        // 初始化测试数据
        testStore = new PlatformStore();
        testStore.setId(1L);
        testStore.setStoreName("测试店铺");
        testStore.setPlatformType("WALMART");
        testStore.setStatus(PlatformStore.StoreStatus.ACTIVE);
        testStore.setApiCredentials("{\"clientId\":\"test\",\"clientSecret\":\"secret\"}");
        
        testPermission = new StorePermission();
        testPermission.setId(1L);
        testPermission.setUserId(1L);
        testPermission.setStoreId(1L);
        testPermission.setPermissionType(StorePermission.PermissionType.ADMIN);
        testPermission.setCanRead(true);
        testPermission.setCanWrite(true);
        testPermission.setCanDelete(false);
        testPermission.setCanManage(true);
        
        testDataIsolation = new StoreDataIsolation();
        testDataIsolation.setId(1L);
        testDataIsolation.setStoreId(1L);
        testDataIsolation.setDataType(StoreDataIsolation.DataType.ORDER);
        testDataIsolation.setIsolationLevel(StoreDataIsolation.IsolationLevel.STRICT);
        testDataIsolation.setEnabled(true);
    }
    
    @Test
    void testCreateStore() {
        // 准备测试数据
        PlatformStoreDTO storeDTO = new PlatformStoreDTO();
        storeDTO.setStoreName("新店铺");
        storeDTO.setPlatformType("WALMART");
        storeDTO.setStatus("ACTIVE");
        
        when(platformStoreRepository.findByStoreNameAndStatus(anyString(), any()))
                .thenReturn(Optional.empty());
        when(platformStoreRepository.save(any(PlatformStore.class)))
                .thenReturn(testStore);
        
        // 执行测试
        PlatformStoreDTO result = platformService.createStore(storeDTO);
        
        // 验证结果
        assertNotNull(result);
        assertEquals("测试店铺", result.getStoreName());
        assertEquals("WALMART", result.getPlatformType());
        
        verify(platformStoreRepository).findByStoreNameAndStatus(anyString(), any());
        verify(platformStoreRepository).save(any(PlatformStore.class));
    }
    
    @Test
    void testCreateStoreDuplicateName() {
        // 准备测试数据
        PlatformStoreDTO storeDTO = new PlatformStoreDTO();
        storeDTO.setStoreName("重复店铺");
        
        when(platformStoreRepository.findByStoreNameAndStatus(anyString(), any()))
                .thenReturn(Optional.of(testStore));
        
        // 执行测试并验证异常
        assertThrows(BusinessException.class, () -> {
            platformService.createStore(storeDTO);
        });
        
        verify(platformStoreRepository).findByStoreNameAndStatus(anyString(), any());
        verify(platformStoreRepository, never()).save(any());
    }
    
    @Test
    void testGetStoresByUser() {
        // 准备测试数据
        List<Long> storeIds = Arrays.asList(1L, 2L);
        List<PlatformStore> stores = Arrays.asList(testStore);
        
        when(storePermissionRepository.findStoreIdsByUserId(1L))
                .thenReturn(storeIds);
        when(platformStoreRepository.findAllById(storeIds))
                .thenReturn(stores);
        
        // 执行测试
        List<PlatformStoreDTO> result = platformService.getStoresByUser(1L, null, null);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("测试店铺", result.get(0).getStoreName());
        
        verify(storePermissionRepository).findStoreIdsByUserId(1L);
        verify(platformStoreRepository).findAllById(storeIds);
    }
    
    @Test
    void testAssignStorePermission() {
        // 准备测试数据
        StorePermissionDTO permissionDTO = new StorePermissionDTO();
        permissionDTO.setUserId(1L);
        permissionDTO.setStoreId(1L);
        permissionDTO.setPermissionType("ADMIN");
        permissionDTO.setCanRead(true);
        permissionDTO.setCanWrite(true);
        permissionDTO.setCanDelete(false);
        permissionDTO.setCanManage(true);
        
        when(platformStoreRepository.findById(1L))
                .thenReturn(Optional.of(testStore));
        when(storePermissionRepository.findByUserIdAndStoreId(1L, 1L))
                .thenReturn(Optional.empty());
        when(storePermissionRepository.save(any(StorePermission.class)))
                .thenReturn(testPermission);
        
        // 执行测试
        StorePermissionDTO result = platformService.assignStorePermission(permissionDTO);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertEquals(1L, result.getStoreId());
        assertEquals("ADMIN", result.getPermissionType());
        assertTrue(result.getCanRead());
        assertTrue(result.getCanWrite());
        assertFalse(result.getCanDelete());
        assertTrue(result.getCanManage());
        
        verify(platformStoreRepository).findById(1L);
        verify(storePermissionRepository).findByUserIdAndStoreId(1L, 1L);
        verify(storePermissionRepository).save(any(StorePermission.class));
    }
    
    @Test
    void testUpdateStorePermission() {
        // 准备测试数据
        StorePermissionDTO permissionDTO = new StorePermissionDTO();
        permissionDTO.setCanDelete(true);
        
        when(storePermissionRepository.findById(1L))
                .thenReturn(Optional.of(testPermission));
        when(storePermissionRepository.save(any(StorePermission.class)))
                .thenReturn(testPermission);
        when(platformStoreRepository.findById(1L))
                .thenReturn(Optional.of(testStore));
        
        // 执行测试
        StorePermissionDTO result = platformService.updateStorePermission(1L, permissionDTO);
        
        // 验证结果
        assertNotNull(result);
        
        verify(storePermissionRepository).findById(1L);
        verify(storePermissionRepository).save(any(StorePermission.class));
    }
    
    @Test
    void testRemoveStorePermission() {
        // 准备测试数据
        when(storePermissionRepository.findById(1L))
                .thenReturn(Optional.of(testPermission));
        
        // 执行测试
        platformService.removeStorePermission(1L);
        
        // 验证结果
        verify(storePermissionRepository).findById(1L);
        verify(storePermissionRepository).delete(testPermission);
    }
    
    @Test
    void testGetUserStorePermissions() {
        // 准备测试数据
        List<StorePermission> permissions = Arrays.asList(testPermission);
        
        when(storePermissionRepository.findByUserId(1L))
                .thenReturn(permissions);
        when(platformStoreRepository.findById(1L))
                .thenReturn(Optional.of(testStore));
        
        // 执行测试
        List<StorePermissionDTO> result = platformService.getUserStorePermissions(1L);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("ADMIN", result.get(0).getPermissionType());
        
        verify(storePermissionRepository).findByUserId(1L);
    }
    
    @Test
    void testHasStorePermission() {
        // 准备测试数据
        when(storePermissionRepository.hasPermission(1L, 1L, true, null, null, null))
                .thenReturn(true);
        
        // 执行测试
        boolean result = platformService.hasStorePermission(1L, 1L, "READ");
        
        // 验证结果
        assertTrue(result);
        
        verify(storePermissionRepository).hasPermission(1L, 1L, true, null, null, null);
    }
    
    @Test
    void testConfigureDataIsolation() {
        // 准备测试数据
        Map<String, Object> configParams = new HashMap<>();
        configParams.put("allowCrossStoreView", false);
        configParams.put("auditAccess", true);
        
        when(platformStoreRepository.findById(1L))
                .thenReturn(Optional.of(testStore));
        when(storeDataIsolationRepository.findByStoreIdAndDataType(1L, StoreDataIsolation.DataType.ORDER))
                .thenReturn(Optional.empty());
        when(storeDataIsolationRepository.save(any(StoreDataIsolation.class)))
                .thenReturn(testDataIsolation);
        
        // 执行测试
        platformService.configureDataIsolation(1L, "ORDER", "STRICT", configParams);
        
        // 验证结果
        verify(platformStoreRepository).findById(1L);
        verify(storeDataIsolationRepository).findByStoreIdAndDataType(1L, StoreDataIsolation.DataType.ORDER);
        verify(storeDataIsolationRepository).save(any(StoreDataIsolation.class));
    }
    
    @Test
    void testGetDataIsolationConfig() {
        // 准备测试数据
        List<StoreDataIsolation> configs = Arrays.asList(testDataIsolation);
        
        when(storeDataIsolationRepository.findByStoreId(1L))
                .thenReturn(configs);
        
        // 执行测试
        Map<String, Object> result = platformService.getDataIsolationConfig(1L);
        
        // 验证结果
        assertNotNull(result);
        assertTrue(result.containsKey("ORDER"));
        
        verify(storeDataIsolationRepository).findByStoreId(1L);
    }
    
    @Test
    void testCheckDataAccess() {
        // 准备测试数据
        when(storePermissionRepository.findByUserIdAndStoreId(1L, 1L))
                .thenReturn(Optional.of(testPermission));
        
        // 执行测试
        boolean readAccess = platformService.checkDataAccess(1L, 1L, "ORDER", "READ");
        boolean writeAccess = platformService.checkDataAccess(1L, 1L, "ORDER", "WRITE");
        boolean deleteAccess = platformService.checkDataAccess(1L, 1L, "ORDER", "DELETE");
        
        // 验证结果
        assertTrue(readAccess);
        assertTrue(writeAccess);
        assertFalse(deleteAccess);
        
        verify(storePermissionRepository, times(3)).findByUserIdAndStoreId(1L, 1L);
    }
    
    @Test
    void testCheckDataAccessNoPermission() {
        // 准备测试数据
        when(storePermissionRepository.findByUserIdAndStoreId(1L, 1L))
                .thenReturn(Optional.empty());
        
        // 执行测试
        boolean result = platformService.checkDataAccess(1L, 1L, "ORDER", "READ");
        
        // 验证结果
        assertFalse(result);
        
        verify(storePermissionRepository).findByUserIdAndStoreId(1L, 1L);
    }
}