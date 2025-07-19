package com.erp.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.order.entity.OrderStatusHistory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 订单状态变更记录Mapper接口
 *
 * @author ERP System
 */
@Mapper
public interface OrderStatusHistoryMapper extends BaseMapper<OrderStatusHistory> {
}