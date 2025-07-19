package com.erp.platform.walmart.scheduler;

import com.erp.platform.entity.PlatformStore;
import com.erp.platform.repository.PlatformStoreRepository;
import com.erp.platform.walmart.dto.WalmartOrder;
import com.erp.platform.walmart.service.WalmartOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 沃尔玛订单定时任务
 *
 * @author ERP System
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WalmartOrderScheduler {
    
    private final WalmartOrderService walmartOrderService;
    private final PlatformStoreRepository platformStoreRepository;
    
    /**
     * 定时拉取沃尔玛订单 - 每10分钟执行一次
     */
    @Scheduled(fixedRate = 600000) // 10分钟
    public void fetchWalmartOrders() {
        log.debug("开始定时拉取沃尔玛订单");
        
        try {
            // 获取所有激活的沃尔玛店铺
            List<PlatformStore> walmartStores = platformStoreRepository
                    .findByPlatformTypeAndStatus("WALMART", PlatformStore.StoreStatus.ACTIVE);
            
            for (PlatformStore store : walmartStores) {
                try {
                    fetchOrdersForStore(store);
                } catch (Exception e) {
                    log.error("拉取店铺订单失败，店铺ID: {}", store.getId(), e);
                }
            }
            
        } catch (Exception e) {
            log.error("定时拉取沃尔玛订单任务执行失败", e);
        }
        
        log.debug("完成定时拉取沃尔玛订单");
    }
    
    /**
     * 为单个店铺拉取订单
     */
    private void fetchOrdersForStore(PlatformStore store) {
        log.debug("开始拉取店铺订单，店铺ID: {}, 店铺名称: {}", store.getId(), store.getStoreName());
        
        try {
            // 计算拉取时间范围
            LocalDateTime toDate = LocalDateTime.now();
            LocalDateTime fromDate = getLastSyncTime(store);
            
            // 拉取订单
            List<WalmartOrder> orders = walmartOrderService.fetchOrders(
                    store.getId().toString(), fromDate, toDate);
            
            if (!orders.isEmpty()) {
                log.info("店铺 {} 拉取到 {} 个新订单", store.getStoreName(), orders.size());
                
                // 处理订单数据
                processOrders(store, orders);
                
                // 更新最后同步时间
                store.setLastSyncTime(toDate);
                platformStoreRepository.save(store);
            }
            
        } catch (Exception e) {
            log.error("拉取店铺订单异常，店铺ID: {}", store.getId(), e);
        }
    }
    
    /**
     * 获取最后同步时间
     */
    private LocalDateTime getLastSyncTime(PlatformStore store) {
        if (store.getLastSyncTime() != null) {
            return store.getLastSyncTime();
        }
        // 如果没有同步记录，默认拉取最近24小时的订单
        return LocalDateTime.now().minusHours(24);
    }
    
    /**
     * 处理订单数据
     */
    private void processOrders(PlatformStore store, List<WalmartOrder> orders) {
        for (WalmartOrder order : orders) {
            try {
                // 转换为标准格式
                var standardOrder = walmartOrderService.convertToStandardOrder(order);
                
                // 这里应该调用订单服务保存订单数据
                // orderService.saveOrder(standardOrder);
                
                log.debug("处理订单: {}", order.getPurchaseOrderId());
                
            } catch (Exception e) {
                log.error("处理订单失败，订单ID: {}", order.getPurchaseOrderId(), e);
            }
        }
    }
    
    /**
     * 定时同步订单状态 - 每30分钟执行一次
     */
    @Scheduled(fixedRate = 1800000) // 30分钟
    public void syncOrderStatus() {
        log.debug("开始定时同步沃尔玛订单状态");
        
        try {
            // 获取所有激活的沃尔玛店铺
            List<PlatformStore> walmartStores = platformStoreRepository
                    .findByPlatformTypeAndStatus("WALMART", PlatformStore.StoreStatus.ACTIVE);
            
            for (PlatformStore store : walmartStores) {
                try {
                    syncOrderStatusForStore(store);
                } catch (Exception e) {
                    log.error("同步店铺订单状态失败，店铺ID: {}", store.getId(), e);
                }
            }
            
        } catch (Exception e) {
            log.error("定时同步沃尔玛订单状态任务执行失败", e);
        }
        
        log.debug("完成定时同步沃尔玛订单状态");
    }
    
    /**
     * 为单个店铺同步订单状态
     */
    private void syncOrderStatusForStore(PlatformStore store) {
        log.debug("开始同步店铺订单状态，店铺ID: {}", store.getId());
        
        try {
            // 这里应该获取需要同步状态的订单列表
            // List<String> orderIds = orderService.getPendingOrderIds(store.getId());
            
            // 示例：同步特定订单状态
            // for (String orderId : orderIds) {
            //     walmartOrderService.syncOrderStatus(store.getId().toString(), orderId);
            // }
            
        } catch (Exception e) {
            log.error("同步店铺订单状态异常，店铺ID: {}", store.getId(), e);
        }
    }
}