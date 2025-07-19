package com.erp.inventory.service.impl;

import com.erp.inventory.dto.InventoryDTO;
import com.erp.inventory.entity.InventoryTransaction;
import com.erp.inventory.mapper.InventoryMapper;
import com.erp.inventory.mapper.InventoryTransactionMapper;
import com.erp.inventory.service.InventoryService;
import com.erp.inventory.service.InventorySyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 库存同步服务实现类
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventorySyncServiceImpl implements InventorySyncService {

    private final InventoryService inventoryService;
    private final InventoryMapper inventoryMapper;
    private final InventoryTransactionMapper transactionMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Scheduled(fixedDelayString = "${inventory.sync.interval:1800000}") // 默认30分钟
    public void scheduledSyncInventory() {
        log.info("开始定时同步库存数据");
        
        try {
            // 获取所有需要同步的库存
            batchSyncInventory();
            
            // 验证数据一致性
            validateInventoryConsistency();
            
            log.info("定时库存同步完成");
        } catch (Exception e) {
            log.error("定时库存同步失败", e);
        }
    }

    @Override
    public void validateInventoryConsistency() {
        log.info("开始验证库存数据一致性");
        
        try {
            // 查询所有库存记录
            List<com.erp.inventory.entity.Inventory> inventories = inventoryMapper.selectList(null);
            
            for (com.erp.inventory.entity.Inventory inventory : inventories) {
                // 验证总库存 = 可用库存 + 预留库存
                int calculatedTotal = (inventory.getAvailableQuantity() != null ? inventory.getAvailableQuantity() : 0) +
                                    (inventory.getReservedQuantity() != null ? inventory.getReservedQuantity() : 0);
                
                if (inventory.getTotalQuantity() == null || !inventory.getTotalQuantity().equals(calculatedTotal)) {
                    log.warn("发现库存数据不一致: SKU={}, StoreId={}, Total={}, Calculated={}", 
                            inventory.getSku(), inventory.getStoreId(), 
                            inventory.getTotalQuantity(), calculatedTotal);
                    
                    // 尝试修复
                    repairInventoryInconsistency(inventory.getSku(), inventory.getStoreId());
                }
                
                // 验证库存不能为负数
                if ((inventory.getAvailableQuantity() != null && inventory.getAvailableQuantity() < 0) ||
                    (inventory.getReservedQuantity() != null && inventory.getReservedQuantity() < 0)) {
                    log.error("发现负库存: SKU={}, StoreId={}, Available={}, Reserved={}", 
                            inventory.getSku(), inventory.getStoreId(), 
                            inventory.getAvailableQuantity(), inventory.getReservedQuantity());
                    
                    // 发送告警
                    publishInventoryAlert(inventory, "NEGATIVE_INVENTORY");
                }
            }
            
            log.info("库存数据一致性验证完成");
        } catch (Exception e) {
            log.error("库存数据一致性验证失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean repairInventoryInconsistency(String sku, Long storeId) {
        try {
            log.info("开始修复库存数据不一致: SKU={}, StoreId={}", sku, storeId);
            
            com.erp.inventory.entity.Inventory inventory = inventoryMapper.selectBySkuAndStore(sku, storeId);
            if (inventory == null) {
                return false;
            }
            
            // 重新计算总库存
            inventory.updateTotalQuantity();
            
            // 更新数据库
            inventoryMapper.updateById(inventory);
            
            // 记录修复操作
            InventoryTransaction transaction = new InventoryTransaction();
            transaction.setTransactionId(java.util.UUID.randomUUID().toString());
            transaction.setSku(sku);
            transaction.setStoreId(storeId);
            transaction.setTransactionType(InventoryTransaction.TransactionType.ADJUST);
            transaction.setQuantity(0);
            transaction.setBeforeQuantity(inventory.getTotalQuantity());
            transaction.setAfterQuantity(inventory.getTotalQuantity());
            transaction.setReason("系统自动修复库存数据不一致");
            transaction.setOperator("SYSTEM");
            transaction.setCreatedAt(LocalDateTime.now());
            
            transactionMapper.insert(transaction);
            
            log.info("库存数据不一致修复完成: SKU={}, StoreId={}", sku, storeId);
            return true;
            
        } catch (Exception e) {
            log.error("修复库存数据不一致失败: SKU={}, StoreId={}", sku, storeId, e);
            return false;
        }
    }

    @Override
    public boolean syncExternalPlatformInventory(String sku, Long storeId) {
        try {
            log.info("开始同步外部平台库存: SKU={}, StoreId={}", sku, storeId);
            
            // 获取当前库存
            InventoryDTO inventory = inventoryService.getInventory(sku, storeId);
            if (inventory == null) {
                return false;
            }
            
            // 发送库存同步事件到平台服务
            Map<String, Object> syncEvent = new HashMap<>();
            syncEvent.put("sku", sku);
            syncEvent.put("storeId", storeId);
            syncEvent.put("availableQuantity", inventory.getAvailableQuantity());
            syncEvent.put("totalQuantity", inventory.getTotalQuantity());
            syncEvent.put("timestamp", LocalDateTime.now());
            
            kafkaTemplate.send("platform-inventory-sync", syncEvent);
            
            log.info("外部平台库存同步请求已发送: SKU={}, StoreId={}", sku, storeId);
            return true;
            
        } catch (Exception e) {
            log.error("同步外部平台库存失败: SKU={}, StoreId={}", sku, storeId, e);
            return false;
        }
    }

    @Override
    public void batchSyncInventory() {
        try {
            log.info("开始批量同步库存");
            
            // 获取所有库存记录
            List<com.erp.inventory.entity.Inventory> inventories = inventoryMapper.selectList(null);
            
            int syncCount = 0;
            for (com.erp.inventory.entity.Inventory inventory : inventories) {
                try {
                    // 同步到外部平台
                    syncExternalPlatformInventory(inventory.getSku(), inventory.getStoreId());
                    syncCount++;
                    
                    // 避免过于频繁的调用
                    if (syncCount % 10 == 0) {
                        Thread.sleep(100);
                    }
                } catch (Exception e) {
                    log.error("同步库存失败: SKU={}, StoreId={}", 
                            inventory.getSku(), inventory.getStoreId(), e);
                }
            }
            
            log.info("批量库存同步完成，共同步{}条记录", syncCount);
            
        } catch (Exception e) {
            log.error("批量库存同步失败", e);
        }
    }

    /**
     * 发送库存告警事件
     */
    private void publishInventoryAlert(com.erp.inventory.entity.Inventory inventory, String alertType) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("type", "INVENTORY_SYSTEM_ALERT");
        alert.put("alertType", alertType);
        alert.put("sku", inventory.getSku());
        alert.put("storeId", inventory.getStoreId());
        alert.put("availableQuantity", inventory.getAvailableQuantity());
        alert.put("reservedQuantity", inventory.getReservedQuantity());
        alert.put("totalQuantity", inventory.getTotalQuantity());
        alert.put("timestamp", LocalDateTime.now());
        
        kafkaTemplate.send("inventory-system-alert", alert);
    }
}