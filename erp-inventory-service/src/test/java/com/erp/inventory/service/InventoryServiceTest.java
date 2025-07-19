package com.erp.inventory.service;

import com.erp.inventory.dto.InventoryDTO;
import com.erp.inventory.dto.InventoryOperationDTO;
import com.erp.inventory.entity.Inventory;
import com.erp.inventory.mapper.InventoryMapper;
import com.erp.inventory.service.impl.InventoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 库存服务测试类
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryMapper inventoryMapper;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private Inventory testInventory;
    private InventoryDTO testInventoryDTO;
    private InventoryOperationDTO testOperationDTO;

    @BeforeEach
    void setUp() {
        // 准备测试数据
        testInventory = new Inventory();
        testInventory.setId(1L);
        testInventory.setSku("TEST-SKU-001");
        testInventory.setStoreId(1L);
        testInventory.setAvailableQuantity(100);
        testInventory.setReservedQuantity(10);
        testInventory.setTotalQuantity(110);
        testInventory.setSafetyStock(20);
        testInventory.setVersion(1);

        testInventoryDTO = new InventoryDTO();
        testInventoryDTO.setSku("TEST-SKU-001");
        testInventoryDTO.setStoreId(1L);
        testInventoryDTO.setAvailableQuantity(100);
        testInventoryDTO.setReservedQuantity(10);
        testInventoryDTO.setTotalQuantity(110);
        testInventoryDTO.setSafetyStock(20);

        testOperationDTO = new InventoryOperationDTO();
        testOperationDTO.setSku("TEST-SKU-001");
        testOperationDTO.setStoreId(1L);
        testOperationDTO.setQuantity(5);
        testOperationDTO.setReferenceId("ORDER-001");
        testOperationDTO.setReferenceType("ORDER");
        testOperationDTO.setReason("测试扣减");
        testOperationDTO.setOperator("TEST");
    }

    @Test
    void testGetInventory() {
        // Mock Redis operations
        var valueOperations = mock(org.springframework.data.redis.core.ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        
        // Mock数据库查询
        when(inventoryMapper.selectBySkuAndStore("TEST-SKU-001", 1L)).thenReturn(testInventory);
        
        // 执行测试
        InventoryDTO result = inventoryService.getInventory("TEST-SKU-001", 1L);
        
        // 验证结果
        assertNotNull(result);
        assertEquals("TEST-SKU-001", result.getSku());
        assertEquals(1L, result.getStoreId());
        assertEquals(100, result.getAvailableQuantity());
        
        // 验证缓存操作
        verify(valueOperations).set(anyString(), any(), anyLong(), any());
    }

    @Test
    void testCheckInventoryAvailable() {
        // Mock数据库查询
        when(inventoryMapper.selectBySkuAndStore("TEST-SKU-001", 1L)).thenReturn(testInventory);
        
        // 测试库存充足的情况
        boolean available = inventoryService.checkInventoryAvailable("TEST-SKU-001", 1L, 50);
        assertTrue(available);
        
        // 测试库存不足的情况
        boolean notAvailable = inventoryService.checkInventoryAvailable("TEST-SKU-001", 1L, 150);
        assertFalse(notAvailable);
    }

    @Test
    void testInventoryNeedsAlert() {
        // 设置库存低于安全库存
        testInventory.setAvailableQuantity(15);
        testInventory.setSafetyStock(20);
        
        assertTrue(testInventory.needsAlert());
        
        // 设置库存高于安全库存
        testInventory.setAvailableQuantity(25);
        assertFalse(testInventory.needsAlert());
    }

    @Test
    void testInventoryOperations() {
        // 测试扣减操作
        testInventory.deductAvailable(10);
        assertEquals(90, testInventory.getAvailableQuantity());
        
        // 测试增加操作
        testInventory.addAvailable(5);
        assertEquals(95, testInventory.getAvailableQuantity());
        
        // 测试预留操作
        testInventory.reserve(20);
        assertEquals(75, testInventory.getAvailableQuantity());
        assertEquals(30, testInventory.getReservedQuantity());
        
        // 测试释放预留操作
        testInventory.release(10);
        assertEquals(85, testInventory.getAvailableQuantity());
        assertEquals(20, testInventory.getReservedQuantity());
    }

    @Test
    void testUpdateTotalQuantity() {
        testInventory.setAvailableQuantity(80);
        testInventory.setReservedQuantity(15);
        
        testInventory.updateTotalQuantity();
        
        assertEquals(95, testInventory.getTotalQuantity());
    }
}