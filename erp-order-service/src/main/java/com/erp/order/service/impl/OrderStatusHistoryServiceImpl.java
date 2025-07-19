package com.erp.order.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.order.entity.OrderStatusHistory;
import com.erp.order.mapper.OrderStatusHistoryMapper;
import com.erp.order.service.OrderStatusHistoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单状态变更记录服务实现类
 *
 * @author ERP System
 */
@Slf4j
@Service
public class OrderStatusHistoryServiceImpl extends ServiceImpl<OrderStatusHistoryMapper, OrderStatusHistory> 
    implements OrderStatusHistoryService {

    @Override
    public boolean recordStatusChange(Long orderId, String fromStatus, String toStatus, String reason, String operator) {
        log.info("记录订单状态变更，订单ID: {}, 状态: {} -> {}", orderId, fromStatus, toStatus);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrderId(orderId);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setReason(reason);
        history.setOperator(operator);
        history.setCreateTime(LocalDateTime.now());

        boolean result = save(history);
        if (result) {
            log.info("订单状态变更记录成功，订单ID: {}", orderId);
        } else {
            log.error("订单状态变更记录失败，订单ID: {}", orderId);
        }

        return result;
    }

    @Override
    public List<OrderStatusHistory> getOrderStatusHistory(Long orderId) {
        LambdaQueryWrapper<OrderStatusHistory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderStatusHistory::getOrderId, orderId)
               .orderByDesc(OrderStatusHistory::getCreateTime);
        return list(wrapper);
    }

    @Override
    public OrderStatusHistory getLatestStatusHistory(Long orderId) {
        LambdaQueryWrapper<OrderStatusHistory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderStatusHistory::getOrderId, orderId)
               .orderByDesc(OrderStatusHistory::getCreateTime)
               .last("LIMIT 1");
        return getOne(wrapper);
    }
}