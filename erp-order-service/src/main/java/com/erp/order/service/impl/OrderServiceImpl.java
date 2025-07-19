package com.erp.order.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.exception.BusinessException;

import com.erp.order.dto.OrderDTO;
import com.erp.order.dto.OrderItemDTO;
import com.erp.order.dto.OrderQueryDTO;
import com.erp.order.entity.Order;
import com.erp.order.entity.OrderItem;
import com.erp.order.entity.OrderStatusHistory;
import com.erp.order.mapper.OrderItemMapper;
import com.erp.order.mapper.OrderMapper;
import com.erp.order.service.OrderService;
import com.erp.order.service.OrderStatusHistoryService;
import com.erp.order.service.InventoryLockService;
import com.erp.order.service.OrderNotificationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 订单服务实现类
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final OrderStatusHistoryService orderStatusHistoryService;
    private final InventoryLockService inventoryLockService;
    private final OrderNotificationService orderNotificationService;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(OrderDTO orderDTO) {
        log.info("开始创建订单: {}", orderDTO.getOrderId());

        // 1. 验证订单数据
        validateOrderData(orderDTO);

        // 2. 生成订单编号
        if (!StringUtils.hasText(orderDTO.getOrderId())) {
            orderDTO.setOrderId(generateOrderId());
        }

        // 3. 转换DTO为实体
        Order order = convertToEntity(orderDTO);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());

        // 4. 保存订单主表
        int result = orderMapper.insert(order);
        if (result <= 0) {
            throw new BusinessException("创建订单失败");
        }

        // 5. 保存订单明细
        List<OrderItem> orderItems = convertItemsToEntity(orderDTO.getOrderItems(), order.getId());
        if (!CollectionUtils.isEmpty(orderItems)) {
            orderItemMapper.batchInsert(orderItems);
        }

        // 6. 记录状态变更历史
        orderStatusHistoryService.recordStatusChange(order.getId(), null, 
            Order.OrderStatus.PENDING.name(), "订单创建", "SYSTEM");

        // 7. 锁定库存
        try {
            inventoryLockService.lockInventoryForOrder(order.getId(), orderItems);
        } catch (Exception e) {
            log.error("锁定库存失败，订单ID: {}", order.getId(), e);
            throw new BusinessException("库存不足，订单创建失败");
        }

        // 8. 发送订单创建事件
        publishOrderEvent("ORDER_CREATED", order.getId(), orderDTO);

        // 9. 发送订单创建通知
        orderNotificationService.sendOrderCreatedNotification(order.getId());

        log.info("订单创建成功，订单ID: {}, 订单编号: {}", order.getId(), order.getOrderId());
        return order.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateOrder(OrderDTO orderDTO) {
        log.info("开始更新订单: {}", orderDTO.getId());

        // 1. 查询原订单
        Order existingOrder = orderMapper.selectById(orderDTO.getId());
        if (existingOrder == null) {
            throw new BusinessException("订单不存在");
        }

        // 2. 检查订单状态是否允许修改
        if (!canUpdateOrder(existingOrder.getStatus())) {
            throw new BusinessException("当前订单状态不允许修改");
        }

        // 3. 更新订单主表
        Order order = convertToEntity(orderDTO);
        order.setId(orderDTO.getId());
        order.setUpdateTime(LocalDateTime.now());

        int result = orderMapper.updateById(order);
        if (result <= 0) {
            throw new BusinessException("更新订单失败");
        }

        // 4. 更新订单明细
        if (!CollectionUtils.isEmpty(orderDTO.getOrderItems())) {
            // 删除原明细
            orderItemMapper.deleteByOrderId(order.getId());
            // 插入新明细
            List<OrderItem> orderItems = convertItemsToEntity(orderDTO.getOrderItems(), order.getId());
            orderItemMapper.batchInsert(orderItems);
        }

        // 5. 发送订单更新事件
        publishOrderEvent("ORDER_UPDATED", order.getId(), orderDTO);

        log.info("订单更新成功，订单ID: {}", order.getId());
        return true;
    }

    @Override
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderMapper.selectOrderWithItems(orderId);
        if (order == null) {
            return null;
        }
        return convertToDTO(order);
    }

    @Override
    public OrderDTO getOrderByOrderNo(String orderNo) {
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Order::getOrderId, orderNo);
        Order order = orderMapper.selectOne(wrapper);
        if (order == null) {
            return null;
        }
        
        // 查询订单明细
        List<OrderItem> orderItems = orderItemMapper.selectByOrderId(order.getId());
        order.setOrderItems(orderItems);
        
        return convertToDTO(order);
    }

    @Override
    public IPage<OrderDTO> getOrderPage(OrderQueryDTO query) {
        Page<Order> page = new Page<>(query.getPageNum(), query.getPageSize());
        IPage<Order> orderPage = orderMapper.selectOrderPage(page, query);
        
        // 转换为DTO
        IPage<OrderDTO> dtoPage = new Page<>();
        BeanUtils.copyProperties(orderPage, dtoPage);
        
        List<OrderDTO> orderDTOs = orderPage.getRecords().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        dtoPage.setRecords(orderDTOs);
        
        return dtoPage;
    }

    @Override
    public List<OrderDTO> getOrderList(OrderQueryDTO query) {
        List<Order> orders = orderMapper.selectOrderList(query);
        return orders.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateOrderStatus(Long orderId, Order.OrderStatus status, String reason, String operator) {
        log.info("开始更新订单状态，订单ID: {}, 新状态: {}", orderId, status);

        // 1. 查询原订单
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        Order.OrderStatus oldStatus = order.getStatus();

        // 2. 验证状态流转是否合法
        if (!isValidStatusTransition(oldStatus, status)) {
            throw new BusinessException("订单状态流转不合法: " + oldStatus + " -> " + status);
        }

        // 3. 更新订单状态
        order.setStatus(status);
        order.setUpdateTime(LocalDateTime.now());

        // 根据状态设置相应的时间字段
        switch (status) {
            case CONFIRMED:
                order.setConfirmDate(LocalDateTime.now());
                break;
            case SHIPPED:
                order.setShipDate(LocalDateTime.now());
                break;
            case DELIVERED:
                order.setDeliveryDate(LocalDateTime.now());
                break;
        }

        int result = orderMapper.updateById(order);
        if (result <= 0) {
            throw new BusinessException("更新订单状态失败");
        }

        // 4. 记录状态变更历史
        orderStatusHistoryService.recordStatusChange(orderId, oldStatus.name(), 
            status.name(), reason, operator);

        // 5. 处理库存相关逻辑
        handleInventoryForStatusChange(orderId, oldStatus, status);

        // 6. 发送状态变更事件
        publishOrderStatusChangeEvent(orderId, oldStatus.name(), status.name(), reason, operator);

        log.info("订单状态更新成功，订单ID: {}, 状态: {} -> {}", orderId, oldStatus, status);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int batchUpdateOrderStatus(List<Long> orderIds, Order.OrderStatus status, String reason, String operator) {
        log.info("开始批量更新订单状态，订单数量: {}, 新状态: {}", orderIds.size(), status);

        int successCount = 0;
        for (Long orderId : orderIds) {
            try {
                updateOrderStatus(orderId, status, reason, operator);
                successCount++;
            } catch (Exception e) {
                log.error("更新订单状态失败，订单ID: {}", orderId, e);
            }
        }

        log.info("批量更新订单状态完成，成功数量: {}/{}", successCount, orderIds.size());
        return successCount;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean confirmOrder(Long orderId, String operator) {
        return updateOrderStatus(orderId, Order.OrderStatus.CONFIRMED, "订单确认", operator);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean shipOrder(Long orderId, String trackingNumber, String shippingMethod, String operator) {
        log.info("开始发货订单，订单ID: {}, 物流单号: {}", orderId, trackingNumber);

        // 1. 更新订单信息
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        order.setTrackingNumber(trackingNumber);
        order.setShippingMethod(shippingMethod);
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.updateById(order);

        // 2. 更新订单状态
        boolean result = updateOrderStatus(orderId, Order.OrderStatus.SHIPPED, "订单发货", operator);

        // 3. 发送发货事件
        if (result) {
            publishOrderShippedEvent(orderId, trackingNumber, shippingMethod);
        }

        log.info("订单发货成功，订单ID: {}, 物流单号: {}", orderId, trackingNumber);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancelOrder(Long orderId, String reason, String operator) {
        log.info("开始取消订单，订单ID: {}, 原因: {}", orderId, reason);

        // 1. 更新订单状态
        boolean result = updateOrderStatus(orderId, Order.OrderStatus.CANCELLED, reason, operator);

        // 2. 释放库存锁定
        if (result) {
            inventoryLockService.releaseInventoryLock(orderId);
        }

        log.info("订单取消成功，订单ID: {}", orderId);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteOrder(Long orderId) {
        log.info("开始删除订单，订单ID: {}", orderId);

        // 1. 检查订单状态
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        if (!canDeleteOrder(order.getStatus())) {
            throw new BusinessException("当前订单状态不允许删除");
        }

        // 2. 删除订单明细
        orderItemMapper.deleteByOrderId(orderId);

        // 3. 删除订单主表
        int result = orderMapper.deleteById(orderId);

        // 4. 释放库存锁定
        if (result > 0) {
            inventoryLockService.releaseInventoryLock(orderId);
        }

        log.info("订单删除成功，订单ID: {}", orderId);
        return result > 0;
    }

    @Override
    public int syncPlatformOrders(Long storeId) {
        log.info("开始同步平台订单，店铺ID: {}", storeId);
        
        // 发送同步事件，由平台服务处理
        publishOrderSyncEvent(storeId);
        
        // 这里返回0，实际同步数量由异步处理返回
        return 0;
    }

    @Override
    public List<OrderStatusCount> countOrdersByStatus(List<Long> storeIds) {
        List<OrderMapper.OrderStatusCount> counts = orderMapper.countOrdersByStatus(storeIds);
        return counts.stream()
            .map(count -> {
                OrderStatusCount statusCount = new OrderStatusCount();
                statusCount.setStatus(count.getStatus());
                statusCount.setCount(count.getCount());
                return statusCount;
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int autoCancelTimeoutOrders() {
        log.info("开始自动取消超时订单");

        // 查询需要自动取消的订单（24小时未确认）
        List<Order> timeoutOrders = orderMapper.selectOrdersForAutoCancel(24);
        
        int cancelCount = 0;
        for (Order order : timeoutOrders) {
            try {
                cancelOrder(order.getId(), "订单超时自动取消", "SYSTEM");
                cancelCount++;
            } catch (Exception e) {
                log.error("自动取消订单失败，订单ID: {}", order.getId(), e);
            }
        }

        log.info("自动取消超时订单完成，取消数量: {}", cancelCount);
        return cancelCount;
    }

    /**
     * 验证订单数据
     */
    private void validateOrderData(OrderDTO orderDTO) {
        if (orderDTO.getStoreId() == null) {
            throw new BusinessException("店铺ID不能为空");
        }
        if (!StringUtils.hasText(orderDTO.getCustomerName())) {
            throw new BusinessException("客户姓名不能为空");
        }
        if (orderDTO.getTotalAmount() == null || orderDTO.getTotalAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BusinessException("订单总金额必须大于0");
        }
        if (CollectionUtils.isEmpty(orderDTO.getOrderItems())) {
            throw new BusinessException("订单明细不能为空");
        }
    }

    /**
     * 生成订单编号
     */
    private String generateOrderId() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * 转换DTO为实体
     */
    private Order convertToEntity(OrderDTO orderDTO) {
        Order order = new Order();
        BeanUtils.copyProperties(orderDTO, order);
        
        // 处理地址信息
        if (orderDTO.getShippingAddress() != null) {
            try {
                order.setShippingAddress(objectMapper.writeValueAsString(orderDTO.getShippingAddress()));
            } catch (JsonProcessingException e) {
                log.error("转换收货地址失败", e);
            }
        }
        
        if (orderDTO.getBillingAddress() != null) {
            try {
                order.setBillingAddress(objectMapper.writeValueAsString(orderDTO.getBillingAddress()));
            } catch (JsonProcessingException e) {
                log.error("转换账单地址失败", e);
            }
        }
        
        // 处理状态枚举
        if (StringUtils.hasText(orderDTO.getStatus())) {
            order.setStatus(Order.OrderStatus.valueOf(orderDTO.getStatus()));
        }
        if (StringUtils.hasText(orderDTO.getPaymentStatus())) {
            order.setPaymentStatus(Order.PaymentStatus.valueOf(orderDTO.getPaymentStatus()));
        }
        
        return order;
    }

    /**
     * 转换明细DTO为实体
     */
    private List<OrderItem> convertItemsToEntity(List<OrderItemDTO> itemDTOs, Long orderId) {
        return itemDTOs.stream()
            .map(itemDTO -> {
                OrderItem item = new OrderItem();
                BeanUtils.copyProperties(itemDTO, item);
                item.setOrderId(orderId);
                return item;
            })
            .collect(Collectors.toList());
    }

    /**
     * 转换实体为DTO
     */
    private OrderDTO convertToDTO(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        BeanUtils.copyProperties(order, orderDTO);
        
        // 处理状态枚举
        if (order.getStatus() != null) {
            orderDTO.setStatus(order.getStatus().name());
        }
        if (order.getPaymentStatus() != null) {
            orderDTO.setPaymentStatus(order.getPaymentStatus().name());
        }
        
        // 处理订单明细
        if (!CollectionUtils.isEmpty(order.getOrderItems())) {
            List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    BeanUtils.copyProperties(item, itemDTO);
                    return itemDTO;
                })
                .collect(Collectors.toList());
            orderDTO.setOrderItems(itemDTOs);
        }
        
        return orderDTO;
    }

    /**
     * 检查订单是否可以更新
     */
    private boolean canUpdateOrder(Order.OrderStatus status) {
        return status == Order.OrderStatus.PENDING || status == Order.OrderStatus.CONFIRMED;
    }

    /**
     * 检查订单是否可以删除
     */
    private boolean canDeleteOrder(Order.OrderStatus status) {
        return status == Order.OrderStatus.PENDING || status == Order.OrderStatus.CANCELLED;
    }

    /**
     * 验证状态流转是否合法
     */
    private boolean isValidStatusTransition(Order.OrderStatus from, Order.OrderStatus to) {
        switch (from) {
            case PENDING:
                return to == Order.OrderStatus.CONFIRMED || to == Order.OrderStatus.CANCELLED;
            case CONFIRMED:
                return to == Order.OrderStatus.PROCESSING || to == Order.OrderStatus.CANCELLED;
            case PROCESSING:
                return to == Order.OrderStatus.SHIPPED || to == Order.OrderStatus.CANCELLED;
            case SHIPPED:
                return to == Order.OrderStatus.DELIVERED;
            case DELIVERED:
                return to == Order.OrderStatus.REFUNDED;
            case CANCELLED:
            case REFUNDED:
                return false; // 终态，不能再变更
            default:
                return false;
        }
    }

    /**
     * 处理状态变更时的库存逻辑
     */
    private void handleInventoryForStatusChange(Long orderId, Order.OrderStatus oldStatus, Order.OrderStatus newStatus) {
        switch (newStatus) {
            case CONFIRMED:
                // 确认订单时，库存锁定转为消费
                inventoryLockService.consumeInventoryLock(orderId);
                break;
            case CANCELLED:
                // 取消订单时，释放库存锁定
                inventoryLockService.releaseInventoryLock(orderId);
                break;
        }
    }

    /**
     * 发送订单事件
     */
    private void publishOrderEvent(String eventType, Long orderId, Object data) {
        try {
            kafkaTemplate.send("order-events", eventType, data);
            log.debug("发送订单事件成功: {}, 订单ID: {}", eventType, orderId);
        } catch (Exception e) {
            log.error("发送订单事件失败: {}, 订单ID: {}", eventType, orderId, e);
        }
    }

    /**
     * 发送订单状态变更事件
     */
    private void publishOrderStatusChangeEvent(Long orderId, String oldStatus, String newStatus, String reason, String operator) {
        OrderStatusChangeEvent event = new OrderStatusChangeEvent();
        event.setOrderId(orderId);
        event.setOldStatus(oldStatus);
        event.setNewStatus(newStatus);
        event.setReason(reason);
        event.setOperator(operator);
        event.setChangeTime(LocalDateTime.now());
        
        publishOrderEvent("ORDER_STATUS_CHANGED", orderId, event);
    }

    /**
     * 发送订单发货事件
     */
    private void publishOrderShippedEvent(Long orderId, String trackingNumber, String shippingMethod) {
        OrderShippedEvent event = new OrderShippedEvent();
        event.setOrderId(orderId);
        event.setTrackingNumber(trackingNumber);
        event.setShippingMethod(shippingMethod);
        event.setShipTime(LocalDateTime.now());
        
        publishOrderEvent("ORDER_SHIPPED", orderId, event);
    }

    /**
     * 发送订单同步事件
     */
    private void publishOrderSyncEvent(Long storeId) {
        OrderSyncEvent event = new OrderSyncEvent();
        event.setStoreId(storeId);
        event.setSyncTime(LocalDateTime.now());
        
        publishOrderEvent("ORDER_SYNC_REQUEST", storeId, event);
    }

    /**
     * 订单状态变更事件
     */
    public static class OrderStatusChangeEvent {
        private Long orderId;
        private String oldStatus;
        private String newStatus;
        private String reason;
        private String operator;
        private LocalDateTime changeTime;

        // Getters and Setters
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public String getOldStatus() { return oldStatus; }
        public void setOldStatus(String oldStatus) { this.oldStatus = oldStatus; }
        public String getNewStatus() { return newStatus; }
        public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }
        public LocalDateTime getChangeTime() { return changeTime; }
        public void setChangeTime(LocalDateTime changeTime) { this.changeTime = changeTime; }
    }

    /**
     * 订单发货事件
     */
    public static class OrderShippedEvent {
        private Long orderId;
        private String trackingNumber;
        private String shippingMethod;
        private LocalDateTime shipTime;

        // Getters and Setters
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public String getTrackingNumber() { return trackingNumber; }
        public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
        public String getShippingMethod() { return shippingMethod; }
        public void setShippingMethod(String shippingMethod) { this.shippingMethod = shippingMethod; }
        public LocalDateTime getShipTime() { return shipTime; }
        public void setShipTime(LocalDateTime shipTime) { this.shipTime = shipTime; }
    }

    /**
     * 订单同步事件
     */
    public static class OrderSyncEvent {
        private Long storeId;
        private LocalDateTime syncTime;

        // Getters and Setters
        public Long getStoreId() { return storeId; }
        public void setStoreId(Long storeId) { this.storeId = storeId; }
        public LocalDateTime getSyncTime() { return syncTime; }
        public void setSyncTime(LocalDateTime syncTime) { this.syncTime = syncTime; }
    }
}