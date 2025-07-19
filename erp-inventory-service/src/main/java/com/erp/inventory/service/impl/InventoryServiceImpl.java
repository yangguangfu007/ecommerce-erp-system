package com.erp.inventory.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.common.exception.BusinessException;
import com.erp.common.response.ResultCode;
import com.erp.inventory.dto.InventoryDTO;
import com.erp.inventory.dto.InventoryOperationDTO;
import com.erp.inventory.entity.Inventory;
import com.erp.inventory.entity.InventoryTransaction;
import com.erp.inventory.mapper.InventoryMapper;
import com.erp.inventory.mapper.InventoryTransactionMapper;
import com.erp.inventory.service.InventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 库存服务实现类
 *
 * @author ERP System
 */
@Service
public class InventoryServiceImpl implements InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryServiceImpl.class);

    @Autowired
    private InventoryMapper inventoryMapper;
    
    @Autowired
    private InventoryTransactionMapper transactionMapper;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    private static final String INVENTORY_CACHE_PREFIX = "inventory:";
    private static final String INVENTORY_LOCK_PREFIX = "inventory_lock:";
    private static final int CACHE_EXPIRE_MINUTES = 30;
    private static final int MAX_RETRY_TIMES = 3;

    @Override
    public InventoryDTO getInventory(String sku, Long storeId) {
        String cacheKey = INVENTORY_CACHE_PREFIX + sku + ":" + storeId;
        
        // 先从缓存获取
        InventoryDTO cached = (InventoryDTO) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        // 从数据库查询
        Inventory inventory = inventoryMapper.selectBySkuAndStore(sku, storeId);
        if (inventory == null) {
            return null;
        }

        InventoryDTO dto = convertToDTO(inventory);
        
        // 缓存结果
        redisTemplate.opsForValue().set(cacheKey, dto, CACHE_EXPIRE_MINUTES, TimeUnit.MINUTES);
        
        return dto;
    }

    @Override
    public List<InventoryDTO> getInventoryBySku(String sku) {
        List<Inventory> inventories = inventoryMapper.selectBySku(sku);
        return inventories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryDTO> getInventoryByStore(Long storeId) {
        List<Inventory> inventories = inventoryMapper.selectByStoreId(storeId);
        return inventories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InventoryDTO saveOrUpdateInventory(InventoryDTO inventoryDTO) {
        Inventory inventory = new Inventory();
        BeanUtils.copyProperties(inventoryDTO, inventory);
        
        // 更新总库存
        inventory.updateTotalQuantity();
        
        if (inventory.getId() == null) {
            inventoryMapper.insert(inventory);
        } else {
            inventoryMapper.updateById(inventory);
        }
        
        // 清除缓存
        clearInventoryCache(inventory.getSku(), inventory.getStoreId());
        
        return convertToDTO(inventory);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deductInventory(InventoryOperationDTO operationDTO) {
        return executeInventoryOperation(operationDTO, InventoryTransaction.TransactionType.OUTBOUND, 
                (inventory, quantity, version) -> 
                        inventoryMapper.deductAvailableQuantity(inventory.getSku(), 
                                inventory.getStoreId(), quantity, version));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean releaseInventory(InventoryOperationDTO operationDTO) {
        return executeInventoryOperation(operationDTO, InventoryTransaction.TransactionType.INBOUND,
                (inventory, quantity, version) -> 
                        inventoryMapper.addAvailableQuantity(inventory.getSku(), 
                                inventory.getStoreId(), quantity, version));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean reserveInventory(InventoryOperationDTO operationDTO) {
        return executeInventoryOperation(operationDTO, InventoryTransaction.TransactionType.RESERVE,
                (inventory, quantity, version) -> 
                        inventoryMapper.reserveQuantity(inventory.getSku(), 
                                inventory.getStoreId(), quantity, version));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean releaseReservedInventory(InventoryOperationDTO operationDTO) {
        return executeInventoryOperation(operationDTO, InventoryTransaction.TransactionType.RELEASE,
                (inventory, quantity, version) -> 
                        inventoryMapper.releaseQuantity(inventory.getSku(), 
                                inventory.getStoreId(), quantity, version));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean adjustInventory(InventoryOperationDTO operationDTO) {
        String lockKey = INVENTORY_LOCK_PREFIX + operationDTO.getSku() + ":" + operationDTO.getStoreId();
        
        try {
            // 获取分布式锁
            if (!acquireLock(lockKey)) {
                throw new BusinessException(ResultCode.SERVICE_UNAVAILABLE.getCode(), "系统繁忙，请稍后重试");
            }

            Inventory inventory = inventoryMapper.selectBySkuAndStore(operationDTO.getSku(), operationDTO.getStoreId());
            if (inventory == null) {
                throw new BusinessException(ResultCode.INVENTORY_NOT_FOUND);
            }

            int beforeQuantity = inventory.getAvailableQuantity();
            inventory.setAvailableQuantity(operationDTO.getQuantity());
            inventory.updateTotalQuantity();
            
            inventoryMapper.updateById(inventory);

            // 记录变动
            recordTransaction(operationDTO, InventoryTransaction.TransactionType.ADJUST, 
                    beforeQuantity, inventory.getAvailableQuantity());

            // 清除缓存
            clearInventoryCache(operationDTO.getSku(), operationDTO.getStoreId());

            // 发送库存变动事件
            publishInventoryEvent(operationDTO, InventoryTransaction.TransactionType.ADJUST);

            return true;
        } finally {
            releaseLock(lockKey);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchDeductInventory(List<InventoryOperationDTO> operations) {
        for (InventoryOperationDTO operation : operations) {
            if (!deductInventory(operation)) {
                throw new BusinessException("批量扣减库存失败，SKU: " + operation.getSku());
            }
        }
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchReleaseInventory(List<InventoryOperationDTO> operations) {
        for (InventoryOperationDTO operation : operations) {
            if (!releaseInventory(operation)) {
                throw new BusinessException("批量释放库存失败，SKU: " + operation.getSku());
            }
        }
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean allocateInventory(String sku, Map<Long, Integer> storeAllocations) {
        // 检查总分配数量是否超过可用库存
        int totalAllocation = storeAllocations.values().stream().mapToInt(Integer::intValue).sum();
        
        List<Inventory> inventories = inventoryMapper.selectBySku(sku);
        int totalAvailable = inventories.stream().mapToInt(Inventory::getAvailableQuantity).sum();
        
        if (totalAllocation > totalAvailable) {
            throw new BusinessException(ResultCode.INVENTORY_ALLOCATION_FAILED);
        }

        // 执行分配
        for (Map.Entry<Long, Integer> entry : storeAllocations.entrySet()) {
            Long storeId = entry.getKey();
            Integer quantity = entry.getValue();
            
            InventoryOperationDTO operation = new InventoryOperationDTO();
            operation.setSku(sku);
            operation.setStoreId(storeId);
            operation.setQuantity(quantity);
            operation.setReason("库存分配");
            operation.setOperator("SYSTEM");
            
            if (!releaseInventory(operation)) {
                throw new BusinessException("库存分配失败，店铺ID: " + storeId);
            }
        }
        
        return true;
    }

    @Override
    public boolean checkInventoryAvailable(String sku, Long storeId, Integer quantity) {
        Inventory inventory = inventoryMapper.selectBySkuAndStore(sku, storeId);
        return inventory != null && inventory.isAvailable(quantity);
    }

    @Override
    public List<InventoryDTO> getLowStockInventories() {
        List<Inventory> inventories = inventoryMapper.selectLowStockInventories();
        return inventories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean syncInventory(String sku, Long storeId) {
        // 清除缓存，强制从数据库重新加载
        clearInventoryCache(sku, storeId);
        
        // 重新加载库存信息
        InventoryDTO inventory = getInventory(sku, storeId);
        
        // 发送同步事件
        Map<String, Object> syncEvent = new HashMap<>();
        syncEvent.put("sku", sku);
        syncEvent.put("storeId", storeId);
        syncEvent.put("inventory", inventory);
        syncEvent.put("timestamp", LocalDateTime.now());
        
        kafkaTemplate.send("inventory-sync", syncEvent);
        
        return true;
    }

    /**
     * 执行库存操作的通用方法
     */
    private boolean executeInventoryOperation(InventoryOperationDTO operationDTO, 
                                            InventoryTransaction.TransactionType transactionType,
                                            InventoryOperationFunction operation) {
        String lockKey = INVENTORY_LOCK_PREFIX + operationDTO.getSku() + ":" + operationDTO.getStoreId();
        
        try {
            // 获取分布式锁
            if (!acquireLock(lockKey)) {
                throw new BusinessException(ResultCode.SERVICE_UNAVAILABLE.getCode(), "系统繁忙，请稍后重试");
            }

            // 重试机制
            for (int i = 0; i < MAX_RETRY_TIMES; i++) {
                Inventory inventory = inventoryMapper.selectBySkuAndStore(operationDTO.getSku(), operationDTO.getStoreId());
                if (inventory == null) {
                    throw new BusinessException(ResultCode.INVENTORY_NOT_FOUND);
                }

                int beforeQuantity = inventory.getAvailableQuantity();
                
                // 执行原子操作
                int affected = operation.execute(inventory, operationDTO.getQuantity(), inventory.getVersion());
                
                if (affected > 0) {
                    // 计算操作后数量
                    int afterQuantity = calculateAfterQuantity(beforeQuantity, operationDTO.getQuantity(), transactionType);
                    
                    // 记录变动
                    recordTransaction(operationDTO, transactionType, beforeQuantity, afterQuantity);

                    // 清除缓存
                    clearInventoryCache(operationDTO.getSku(), operationDTO.getStoreId());

                    // 发送库存变动事件
                    publishInventoryEvent(operationDTO, transactionType);

                    return true;
                } else if (i == MAX_RETRY_TIMES - 1) {
                    // 最后一次重试失败
                    throw new BusinessException(ResultCode.INVENTORY_INSUFFICIENT);
                }
                
                // 短暂等待后重试
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new BusinessException(ResultCode.INTERNAL_SERVER_ERROR.getCode(), "操作被中断");
                }
            }
            
            return false;
        } finally {
            releaseLock(lockKey);
        }
    }

    /**
     * 计算操作后数量
     */
    private int calculateAfterQuantity(int beforeQuantity, int operationQuantity, 
                                     InventoryTransaction.TransactionType transactionType) {
        switch (transactionType) {
            case OUTBOUND:
            case RESERVE:
                return beforeQuantity - operationQuantity;
            case INBOUND:
            case RELEASE:
                return beforeQuantity + operationQuantity;
            default:
                return beforeQuantity;
        }
    }

    /**
     * 记录库存变动
     */
    private void recordTransaction(InventoryOperationDTO operationDTO, 
                                 InventoryTransaction.TransactionType transactionType,
                                 int beforeQuantity, int afterQuantity) {
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setTransactionId(UUID.randomUUID().toString());
        transaction.setSku(operationDTO.getSku());
        transaction.setStoreId(operationDTO.getStoreId());
        transaction.setTransactionType(transactionType);
        transaction.setQuantity(operationDTO.getQuantity());
        transaction.setBeforeQuantity(beforeQuantity);
        transaction.setAfterQuantity(afterQuantity);
        transaction.setReferenceId(operationDTO.getReferenceId());
        transaction.setReferenceType(operationDTO.getReferenceType());
        transaction.setReason(operationDTO.getReason());
        transaction.setOperator(operationDTO.getOperator());
        transaction.setCreatedAt(LocalDateTime.now());
        
        transactionMapper.insert(transaction);
    }

    /**
     * 发送库存变动事件
     */
    private void publishInventoryEvent(InventoryOperationDTO operationDTO, 
                                     InventoryTransaction.TransactionType transactionType) {
        Map<String, Object> event = new HashMap<>();
        event.put("sku", operationDTO.getSku());
        event.put("storeId", operationDTO.getStoreId());
        event.put("quantity", operationDTO.getQuantity());
        event.put("transactionType", transactionType.name());
        event.put("referenceId", operationDTO.getReferenceId());
        event.put("referenceType", operationDTO.getReferenceType());
        event.put("timestamp", LocalDateTime.now());
        
        kafkaTemplate.send("inventory-change", event);
    }

    /**
     * 获取分布式锁
     */
    private boolean acquireLock(String lockKey) {
        return Boolean.TRUE.equals(redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "locked", 30, TimeUnit.SECONDS));
    }

    /**
     * 释放分布式锁
     */
    private void releaseLock(String lockKey) {
        redisTemplate.delete(lockKey);
    }

    /**
     * 清除库存缓存
     */
    private void clearInventoryCache(String sku, Long storeId) {
        String cacheKey = INVENTORY_CACHE_PREFIX + sku + ":" + storeId;
        redisTemplate.delete(cacheKey);
    }

    /**
     * 转换为DTO
     */
    private InventoryDTO convertToDTO(Inventory inventory) {
        InventoryDTO dto = new InventoryDTO();
        BeanUtils.copyProperties(inventory, dto);
        dto.setNeedsAlert(inventory.needsAlert());
        return dto;
    }

    /**
     * 库存操作函数式接口
     */
    @FunctionalInterface
    private interface InventoryOperationFunction {
        int execute(Inventory inventory, Integer quantity, Integer version);
    }
}