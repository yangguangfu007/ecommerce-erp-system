package com.erp.platform.service;

import com.erp.platform.dto.PlatformStoreDTO;
import com.erp.platform.entity.PlatformStore;
import com.erp.platform.repository.PlatformStoreRepository;
import com.erp.platform.service.impl.PlatformServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 平台服务单元测试类
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
public class PlatformServiceUnitTest {

    @Mock
    private PlatformStoreRepository platformStoreRepository;

    @InjectMocks
    private PlatformServiceImpl platformService;

    private PlatformStore testStore;
    private PlatformStoreDTO testStoreDTO;

    @BeforeEach
    void setUp() {
        testStore = new PlatformStore();
        testStore.setId(1L);
        testStore.setStoreName("测试店铺");
        testStore.setPlatformType("WALMART");
        testStore.setPlatformStoreId("test-store-123");
        testStore.setApiCredentials("{\"clientId\":\"test-client-id\",\"clientSecret\":\"test-client-secret\"}");
        testStore.setStatus(PlatformStore.StoreStatus.ACTIVE);
        testStore.setConnectionStatus(true);

        testStoreDTO = new PlatformStoreDTO();
        testStoreDTO.setStoreName("测试店铺");
        testStoreDTO.setPlatformType("WALMART");
        testStoreDTO.setPlatformStoreId("test-store-123");
        testStoreDTO.setApiCredentials(Map.of("clientId", "test-client-id", "clientSecret", "test-client-secret"));
        testStoreDTO.setStatus("ACTIVE");
    }

    @Test
    void testCreateStore() {
        // Given
        when(platformStoreRepository.save(any(PlatformStore.class))).thenReturn(testStore);

        // When
        PlatformStoreDTO result = platformService.createStore(testStoreDTO);

        // Then
        assertNotNull(result);
        assertEquals("测试店铺", result.getStoreName());
        assertEquals("WALMART", result.getPlatformType());
        verify(platformStoreRepository, times(1)).save(any(PlatformStore.class));
    }

    @Test
    void testGetStore() {
        // Given
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));

        // When
        PlatformStoreDTO result = platformService.getStore(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("测试店铺", result.getStoreName());
        assertEquals("WALMART", result.getPlatformType());
        verify(platformStoreRepository, times(1)).findById(1L);
    }

    @Test
    void testGetStoreNotFound() {
        // Given
        when(platformStoreRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(com.erp.common.exception.BusinessException.class, () -> {
            platformService.getStore(999L);
        });

        verify(platformStoreRepository, times(1)).findById(999L);
    }

    @Test
    void testGetStores() {
        // Given
        List<PlatformStore> stores = Arrays.asList(testStore);
        when(platformStoreRepository.findByPlatformTypeAndStatus("WALMART", PlatformStore.StoreStatus.ACTIVE))
                .thenReturn(stores);

        // When
        List<PlatformStoreDTO> result = platformService.getStores("WALMART", "ACTIVE");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("测试店铺", result.get(0).getStoreName());
        verify(platformStoreRepository, times(1)).findByPlatformTypeAndStatus("WALMART", PlatformStore.StoreStatus.ACTIVE);
    }

    @Test
    void testUpdateStore() {
        // Given
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));
        when(platformStoreRepository.save(any(PlatformStore.class))).thenReturn(testStore);

        testStoreDTO.setStoreName("更新后的店铺");

        // When
        PlatformStoreDTO result = platformService.updateStore(1L, testStoreDTO);

        // Then
        assertNotNull(result);
        verify(platformStoreRepository, times(1)).findById(1L);
        verify(platformStoreRepository, times(1)).save(any(PlatformStore.class));
    }

    @Test
    void testDeleteStore() {
        // Given
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));

        // When
        platformService.deleteStore(1L);

        // Then
        verify(platformStoreRepository, times(1)).findById(1L);
        verify(platformStoreRepository, times(1)).save(any(PlatformStore.class));
    }

    @Test
    void testTestStoreConnection() {
        // Given
        when(platformStoreRepository.findById(1L)).thenReturn(Optional.of(testStore));

        // When
        boolean result = platformService.testStoreConnection(1L);

        // Then
        assertTrue(result);
        verify(platformStoreRepository, times(1)).findById(1L);
    }

    @Test
    void testTestStoreConnectionNotFound() {
        // Given
        when(platformStoreRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(com.erp.common.exception.BusinessException.class, () -> {
            platformService.testStoreConnection(999L);
        });

        verify(platformStoreRepository, times(1)).findById(999L);
    }
}