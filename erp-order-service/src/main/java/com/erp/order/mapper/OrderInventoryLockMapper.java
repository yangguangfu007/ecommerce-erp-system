package com.erp.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.order.entity.OrderInventoryLock;
import org.apache.ibatis.annotations.Mapper;

/**
 * 订单库存锁定记录Mapper接口
 *
 * @author ERP System
 */
@Mapper
public interface OrderInventoryLockMapper extends BaseMapper<OrderInventoryLock> {
}