package com.erp.inventory.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.inventory.dto.InventoryDTO;
import com.erp.inventory.entity.InventoryAlertConfig;
import com.erp.inventory.mapper.InventoryAlertConfigMapper;
import com.erp.inventory.service.InventoryAlertService;
import com.erp.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 库存预警服务实现类
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryAlertServiceImpl implements InventoryAlertService {

    private final InventoryAlertConfigMapper alertConfigMapper;
    private final InventoryService inventoryService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Scheduled(fixedDelayString = "${inventory.alert.check-interval:300000}")
    public void checkInventoryAlerts() {
        log.info("开始检查库存预警");
        
        try {
            // 获取所有需要预警的库存
            List<InventoryDTO> lowStockInventories = inventoryService.getLowStockInventories();
            
            for (InventoryDTO inventory : lowStockInventories) {
                checkSingleInventoryAlert(inventory.getSku(), inventory.getStoreId());
            }
            
            log.info("库存预警检查完成，共检查{}个库存", lowStockInventories.size());
        } catch (Exception e) {
            log.error("库存预警检查失败", e);
        }
    }

    @Override
    @Async
    public void checkSingleInventoryAlert(String sku, Long storeId) {
        try {
            InventoryDTO inventory = inventoryService.getInventory(sku, storeId);
            if (inventory == null) {
                return;
            }

            // 获取预警配置
            List<InventoryAlertConfig> configs = getAlertConfigs(sku, storeId);
            
            for (InventoryAlertConfig config : configs) {
                if (!config.getIsEnabled()) {
                    continue;
                }

                boolean shouldAlert = false;
                
                switch (config.getAlertType()) {
                    case LOW_STOCK:
                        shouldAlert = inventory.getAvailableQuantity() <= config.getThresholdValue();
                        break;
                    case OUT_OF_STOCK:
                        shouldAlert = inventory.getAvailableQuantity() <= 0;
                        break;
                    case OVERSTOCK:
                        shouldAlert = inventory.getAvailableQuantity() >= config.getThresholdValue();
                        break;
                }

                if (shouldAlert) {
                    sendAlertNotification(inventory, config);
                    
                    // 如果是低库存，执行自动处理
                    if (config.getAlertType() == InventoryAlertConfig.AlertType.LOW_STOCK) {
                        handleLowStockAutoProcess(inventory);
                    }
                }
            }
        } catch (Exception e) {
            log.error("检查库存预警失败，SKU: {}, StoreId: {}", sku, storeId, e);
        }
    }

    @Override
    public InventoryAlertConfig createAlertConfig(InventoryAlertConfig config) {
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        alertConfigMapper.insert(config);
        return config;
    }

    @Override
    public InventoryAlertConfig updateAlertConfig(InventoryAlertConfig config) {
        config.setUpdatedAt(LocalDateTime.now());
        alertConfigMapper.updateById(config);
        return config;
    }

    @Override
    public boolean deleteAlertConfig(Long id) {
        return alertConfigMapper.deleteById(id) > 0;
    }

    @Override
    public List<InventoryAlertConfig> getAlertConfigs(String sku, Long storeId) {
        LambdaQueryWrapper<InventoryAlertConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.eq(InventoryAlertConfig::getSku, sku)
                         .or()
                         .eq(InventoryAlertConfig::getSku, "DEFAULT"));
        wrapper.and(w -> w.eq(InventoryAlertConfig::getStoreId, storeId)
                         .or()
                         .isNull(InventoryAlertConfig::getStoreId));
        wrapper.eq(InventoryAlertConfig::getIsEnabled, true);
        wrapper.orderByAsc(InventoryAlertConfig::getSku, InventoryAlertConfig::getStoreId);
        
        return alertConfigMapper.selectList(wrapper);
    }

    @Override
    @Async
    public void sendAlertNotification(InventoryDTO inventory, InventoryAlertConfig alertConfig) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "INVENTORY_ALERT");
            notification.put("alertType", alertConfig.getAlertType().name());
            notification.put("sku", inventory.getSku());
            notification.put("storeId", inventory.getStoreId());
            notification.put("storeName", inventory.getStoreName());
            notification.put("availableQuantity", inventory.getAvailableQuantity());
            notification.put("safetyStock", inventory.getSafetyStock());
            notification.put("thresholdValue", alertConfig.getThresholdValue());
            notification.put("notificationEmails", alertConfig.getNotificationEmails());
            notification.put("timestamp", LocalDateTime.now());
            
            // 构建预警消息
            String message = buildAlertMessage(inventory, alertConfig);
            notification.put("message", message);
            
            // 发送到通知服务
            kafkaTemplate.send("inventory-alert", notification);
            
            log.info("发送库存预警通知: SKU={}, StoreId={}, AlertType={}", 
                    inventory.getSku(), inventory.getStoreId(), alertConfig.getAlertType());
        } catch (Exception e) {
            log.error("发送库存预警通知失败", e);
        }
    }

    @Override
    @Async
    public void handleLowStockAutoProcess(InventoryDTO inventory) {
        try {
            // 发送自动补货建议
            Map<String, Object> autoProcess = new HashMap<>();
            autoProcess.put("type", "AUTO_REPLENISHMENT_SUGGESTION");
            autoProcess.put("sku", inventory.getSku());
            autoProcess.put("storeId", inventory.getStoreId());
            autoProcess.put("currentQuantity", inventory.getAvailableQuantity());
            autoProcess.put("safetyStock", inventory.getSafetyStock());
            autoProcess.put("suggestedQuantity", calculateSuggestedReplenishment(inventory));
            autoProcess.put("timestamp", LocalDateTime.now());
            
            kafkaTemplate.send("inventory-auto-process", autoProcess);
            
            log.info("发送自动补货建议: SKU={}, StoreId={}, SuggestedQuantity={}", 
                    inventory.getSku(), inventory.getStoreId(), 
                    calculateSuggestedReplenishment(inventory));
        } catch (Exception e) {
            log.error("处理库存不足自动处理失败", e);
        }
    }

    /**
     * 构建预警消息
     */
    private String buildAlertMessage(InventoryDTO inventory, InventoryAlertConfig alertConfig) {
        StringBuilder message = new StringBuilder();
        
        switch (alertConfig.getAlertType()) {
            case LOW_STOCK:
                message.append("【低库存预警】");
                message.append("SKU: ").append(inventory.getSku());
                message.append("，当前库存: ").append(inventory.getAvailableQuantity());
                message.append("，安全库存: ").append(inventory.getSafetyStock());
                message.append("，请及时补货！");
                break;
            case OUT_OF_STOCK:
                message.append("【缺货预警】");
                message.append("SKU: ").append(inventory.getSku());
                message.append(" 已缺货，请立即补货！");
                break;
            case OVERSTOCK:
                message.append("【库存过多预警】");
                message.append("SKU: ").append(inventory.getSku());
                message.append("，当前库存: ").append(inventory.getAvailableQuantity());
                message.append("，超过预警阈值: ").append(alertConfig.getThresholdValue());
                break;
        }
        
        if (inventory.getStoreName() != null) {
            message.append("，店铺: ").append(inventory.getStoreName());
        }
        
        return message.toString();
    }

    /**
     * 计算建议补货数量
     */
    private Integer calculateSuggestedReplenishment(InventoryDTO inventory) {
        // 简单的补货算法：补充到安全库存的2倍
        int safetyStock = inventory.getSafetyStock() != null ? inventory.getSafetyStock() : 10;
        int currentQuantity = inventory.getAvailableQuantity() != null ? inventory.getAvailableQuantity() : 0;
        int targetQuantity = safetyStock * 2;
        
        return Math.max(0, targetQuantity - currentQuantity);
    }
}