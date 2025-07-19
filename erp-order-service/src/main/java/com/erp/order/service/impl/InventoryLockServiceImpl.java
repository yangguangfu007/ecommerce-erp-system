package com.erp.order.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.exception.BusinessException;
import com.erp.order.entity.OrderInventoryLock;
import com.erp.order.entity.OrderItem;
import com.erp.order.mapper.OrderInventoryLockMapper;
import com.erp.order.service.InventoryLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 库存锁定服务实现类
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryLockServiceImpl extends ServiceImpl<OrderInventoryLockMapper, OrderInventoryLock> 
    implements InventoryLockService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${order.inventory-lock-expire-minutes:30}")
    private int lockExpireMinutes;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean lockInventoryForOrder(Long orderId, List<OrderItem> orderItems) {
        log.info("开始为订单锁定库存，订单ID: {}", orderId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expireTime = now.plusMinutes(lockExpireMinutes);

        for (OrderItem item : orderItems) {
            // 1. 发送库存锁定请求到库存服务
            InventoryLockRequest lockRequest = new InventoryLockRequest();
            lockRequest.setOrderId(orderId);
            lockRequest.setSku(item.getSku());
            lockRequest.setQuantity(item.getQuantity());
            lockRequest.setExpireTime(expireTime);

            try {
                kafkaTemplate.send("inventory-lock-request", lockRequest);
                log.debug("发送库存锁定请求: SKU={}, 数量={}", item.getSku(), item.getQuantity());
            } catch (Exception e) {
                log.error("发送库存锁定请求失败: SKU={}", item.getSku(), e);
                throw new BusinessException("库存锁定请求失败: " + item.getSku());
            }

            // 2. 记录库存锁定
            OrderInventoryLock lock = new OrderInventoryLock();
            lock.setOrderId(orderId);
            lock.setSku(item.getSku());
            lock.setQuantity(item.getQuantity());
            lock.setLockStatus(OrderInventoryLock.LockStatus.LOCKED);
            lock.setLockTime(now);
            lock.setExpireTime(expireTime);

            if (!save(lock)) {
                log.error("保存库存锁定记录失败: SKU={}", item.getSku());
                throw new BusinessException("保存库存锁定记录失败: " + item.getSku());
            }
        }

        log.info("订单库存锁定完成，订单ID: {}", orderId);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean releaseInventoryLock(Long orderId) {
        log.info("开始释放订单库存锁定，订单ID: {}", orderId);

        // 1. 查询锁定记录
        LambdaQueryWrapper<OrderInventoryLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderInventoryLock::getOrderId, orderId)
               .eq(OrderInventoryLock::getLockStatus, OrderInventoryLock.LockStatus.LOCKED);
        List<OrderInventoryLock> locks = list(wrapper);

        if (locks.isEmpty()) {
            log.warn("未找到需要释放的库存锁定记录，订单ID: {}", orderId);
            return true;
        }

        // 2. 发送库存释放请求
        for (OrderInventoryLock lock : locks) {
            InventoryReleaseRequest releaseRequest = new InventoryReleaseRequest();
            releaseRequest.setOrderId(orderId);
            releaseRequest.setSku(lock.getSku());
            releaseRequest.setQuantity(lock.getQuantity());

            try {
                kafkaTemplate.send("inventory-release-request", releaseRequest);
                log.debug("发送库存释放请求: SKU={}, 数量={}", lock.getSku(), lock.getQuantity());
            } catch (Exception e) {
                log.error("发送库存释放请求失败: SKU={}", lock.getSku(), e);
            }
        }

        // 3. 更新锁定状态
        LambdaUpdateWrapper<OrderInventoryLock> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(OrderInventoryLock::getOrderId, orderId)
                    .eq(OrderInventoryLock::getLockStatus, OrderInventoryLock.LockStatus.LOCKED)
                    .set(OrderInventoryLock::getLockStatus, OrderInventoryLock.LockStatus.RELEASED)
                    .set(OrderInventoryLock::getReleaseTime, LocalDateTime.now());

        boolean result = update(updateWrapper);
        if (result) {
            log.info("订单库存锁定释放成功，订单ID: {}", orderId);
        } else {
            log.error("订单库存锁定释放失败，订单ID: {}", orderId);
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean consumeInventoryLock(Long orderId) {
        log.info("开始消费订单库存锁定，订单ID: {}", orderId);

        // 1. 查询锁定记录
        LambdaQueryWrapper<OrderInventoryLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderInventoryLock::getOrderId, orderId)
               .eq(OrderInventoryLock::getLockStatus, OrderInventoryLock.LockStatus.LOCKED);
        List<OrderInventoryLock> locks = list(wrapper);

        if (locks.isEmpty()) {
            log.warn("未找到需要消费的库存锁定记录，订单ID: {}", orderId);
            return true;
        }

        // 2. 发送库存扣减请求
        for (OrderInventoryLock lock : locks) {
            InventoryDeductRequest deductRequest = new InventoryDeductRequest();
            deductRequest.setOrderId(orderId);
            deductRequest.setSku(lock.getSku());
            deductRequest.setQuantity(lock.getQuantity());

            try {
                kafkaTemplate.send("inventory-deduct-request", deductRequest);
                log.debug("发送库存扣减请求: SKU={}, 数量={}", lock.getSku(), lock.getQuantity());
            } catch (Exception e) {
                log.error("发送库存扣减请求失败: SKU={}", lock.getSku(), e);
                throw new BusinessException("库存扣减请求失败: " + lock.getSku());
            }
        }

        // 3. 更新锁定状态
        LambdaUpdateWrapper<OrderInventoryLock> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(OrderInventoryLock::getOrderId, orderId)
                    .eq(OrderInventoryLock::getLockStatus, OrderInventoryLock.LockStatus.LOCKED)
                    .set(OrderInventoryLock::getLockStatus, OrderInventoryLock.LockStatus.CONSUMED)
                    .set(OrderInventoryLock::getReleaseTime, LocalDateTime.now());

        boolean result = update(updateWrapper);
        if (result) {
            log.info("订单库存锁定消费成功，订单ID: {}", orderId);
        } else {
            log.error("订单库存锁定消费失败，订单ID: {}", orderId);
        }

        return result;
    }

    @Override
    public List<OrderInventoryLock> getOrderInventoryLocks(Long orderId) {
        LambdaQueryWrapper<OrderInventoryLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderInventoryLock::getOrderId, orderId)
               .orderByDesc(OrderInventoryLock::getCreateTime);
        return list(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int releaseExpiredLocks() {
        log.info("开始释放过期的库存锁定");

        // 1. 查询过期的锁定记录
        LambdaQueryWrapper<OrderInventoryLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderInventoryLock::getLockStatus, OrderInventoryLock.LockStatus.LOCKED)
               .lt(OrderInventoryLock::getExpireTime, LocalDateTime.now());
        List<OrderInventoryLock> expiredLocks = list(wrapper);

        if (expiredLocks.isEmpty()) {
            log.info("未找到过期的库存锁定记录");
            return 0;
        }

        // 2. 按订单分组释放
        expiredLocks.stream()
            .collect(Collectors.groupingBy(OrderInventoryLock::getOrderId))
            .forEach((orderId, locks) -> {
                try {
                    releaseInventoryLock(orderId);
                    log.info("释放过期库存锁定成功，订单ID: {}", orderId);
                } catch (Exception e) {
                    log.error("释放过期库存锁定失败，订单ID: {}", orderId, e);
                }
            });

        log.info("释放过期库存锁定完成，处理数量: {}", expiredLocks.size());
        return expiredLocks.size();
    }

    /**
     * 库存锁定请求
     */
    public static class InventoryLockRequest {
        private Long orderId;
        private String sku;
        private Integer quantity;
        private LocalDateTime expireTime;

        // Getters and Setters
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public LocalDateTime getExpireTime() { return expireTime; }
        public void setExpireTime(LocalDateTime expireTime) { this.expireTime = expireTime; }
    }

    /**
     * 库存释放请求
     */
    public static class InventoryReleaseRequest {
        private Long orderId;
        private String sku;
        private Integer quantity;

        // Getters and Setters
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    /**
     * 库存扣减请求
     */
    public static class InventoryDeductRequest {
        private Long orderId;
        private String sku;
        private Integer quantity;

        // Getters and Setters
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}