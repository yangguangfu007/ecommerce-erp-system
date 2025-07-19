package com.erp.inventory.event;

import com.erp.inventory.dto.InventoryOperationDTO;
import com.erp.inventory.service.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 库存事件监听器
 *
 * @author ERP System
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventListener {

    private final InventoryService inventoryService;
    private final ObjectMapper objectMapper;

    /**
     * 监听订单事件，处理库存扣减
     */
    @KafkaListener(topics = "order-confirmed", groupId = "inventory-service")
    public void handleOrderConfirmed(@Payload Map<String, Object> orderEvent,
                                   @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                                   @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition,
                                   @Header(KafkaHeaders.OFFSET) long offset,
                                   Acknowledgment acknowledgment) {
        try {
            log.info("接收到订单确认事件: topic={}, partition={}, offset={}", topic, partition, offset);
            
            String orderId = (String) orderEvent.get("orderId");
            Long storeId = ((Number) orderEvent.get("storeId")).longValue();
            
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> orderItems = 
                (java.util.List<Map<String, Object>>) orderEvent.get("orderItems");
            
            // 扣减每个商品的库存
            for (Map<String, Object> item : orderItems) {
                String sku = (String) item.get("sku");
                Integer quantity = ((Number) item.get("quantity")).intValue();
                
                InventoryOperationDTO operation = new InventoryOperationDTO();
                operation.setSku(sku);
                operation.setStoreId(storeId);
                operation.setQuantity(quantity);
                operation.setReferenceId(orderId);
                operation.setReferenceType("ORDER");
                operation.setReason("订单确认扣减库存");
                operation.setOperator("SYSTEM");
                
                boolean success = inventoryService.deductInventory(operation);
                if (!success) {
                    log.error("订单库存扣减失败: orderId={}, sku={}, quantity={}", orderId, sku, quantity);
                    // 这里可以发送失败事件或者进行补偿处理
                    publishInventoryDeductionFailed(orderId, sku, quantity, "库存不足");
                    return;
                }
            }
            
            log.info("订单库存扣减成功: orderId={}", orderId);
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("处理订单确认事件失败", e);
            // 不确认消息，让Kafka重试
        }
    }

    /**
     * 监听订单取消事件，处理库存释放
     */
    @KafkaListener(topics = "order-cancelled", groupId = "inventory-service")
    public void handleOrderCancelled(@Payload Map<String, Object> orderEvent,
                                   Acknowledgment acknowledgment) {
        try {
            log.info("接收到订单取消事件");
            
            String orderId = (String) orderEvent.get("orderId");
            Long storeId = ((Number) orderEvent.get("storeId")).longValue();
            
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> orderItems = 
                (java.util.List<Map<String, Object>>) orderEvent.get("orderItems");
            
            // 释放每个商品的库存
            for (Map<String, Object> item : orderItems) {
                String sku = (String) item.get("sku");
                Integer quantity = ((Number) item.get("quantity")).intValue();
                
                InventoryOperationDTO operation = new InventoryOperationDTO();
                operation.setSku(sku);
                operation.setStoreId(storeId);
                operation.setQuantity(quantity);
                operation.setReferenceId(orderId);
                operation.setReferenceType("ORDER");
                operation.setReason("订单取消释放库存");
                operation.setOperator("SYSTEM");
                
                inventoryService.releaseInventory(operation);
            }
            
            log.info("订单库存释放成功: orderId={}", orderId);
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("处理订单取消事件失败", e);
        }
    }

    /**
     * 监听商品上架事件，初始化库存
     */
    @KafkaListener(topics = "product-listed", groupId = "inventory-service")
    public void handleProductListed(@Payload Map<String, Object> productEvent,
                                  Acknowledgment acknowledgment) {
        try {
            log.info("接收到商品上架事件");
            
            String sku = (String) productEvent.get("sku");
            Long storeId = ((Number) productEvent.get("storeId")).longValue();
            Integer initialQuantity = productEvent.containsKey("initialQuantity") ? 
                ((Number) productEvent.get("initialQuantity")).intValue() : 0;
            
            // 检查是否已存在库存记录
            if (inventoryService.getInventory(sku, storeId) == null) {
                // 创建初始库存记录
                com.erp.inventory.dto.InventoryDTO inventory = new com.erp.inventory.dto.InventoryDTO();
                inventory.setSku(sku);
                inventory.setStoreId(storeId);
                inventory.setAvailableQuantity(initialQuantity);
                inventory.setReservedQuantity(0);
                inventory.setTotalQuantity(initialQuantity);
                inventory.setSafetyStock(10); // 默认安全库存
                
                inventoryService.saveOrUpdateInventory(inventory);
                log.info("初始化商品库存: sku={}, storeId={}, quantity={}", sku, storeId, initialQuantity);
            }
            
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("处理商品上架事件失败", e);
        }
    }

    /**
     * 监听库存同步请求事件
     */
    @KafkaListener(topics = "inventory-sync-request", groupId = "inventory-service")
    public void handleInventorySyncRequest(@Payload Map<String, Object> syncEvent,
                                         Acknowledgment acknowledgment) {
        try {
            log.info("接收到库存同步请求事件");
            
            String sku = (String) syncEvent.get("sku");
            Long storeId = syncEvent.containsKey("storeId") ? 
                ((Number) syncEvent.get("storeId")).longValue() : null;
            
            if (storeId != null) {
                // 同步单个SKU的库存
                inventoryService.syncInventory(sku, storeId);
            } else {
                // 同步SKU在所有店铺的库存
                java.util.List<com.erp.inventory.dto.InventoryDTO> inventories = 
                    inventoryService.getInventoryBySku(sku);
                for (com.erp.inventory.dto.InventoryDTO inventory : inventories) {
                    inventoryService.syncInventory(inventory.getSku(), inventory.getStoreId());
                }
            }
            
            log.info("库存同步完成: sku={}, storeId={}", sku, storeId);
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            log.error("处理库存同步请求失败", e);
        }
    }

    /**
     * 发送库存扣减失败事件
     */
    private void publishInventoryDeductionFailed(String orderId, String sku, Integer quantity, String reason) {
        // 这里可以发送到死信队列或者特定的失败处理topic
        log.error("库存扣减失败: orderId={}, sku={}, quantity={}, reason={}", orderId, sku, quantity, reason);
    }
}