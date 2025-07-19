package com.erp.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.order.entity.OrderItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 订单明细Mapper接口
 *
 * @author ERP System
 */
@Mapper
public interface OrderItemMapper extends BaseMapper<OrderItem> {

    /**
     * 根据订单ID查询订单明细
     *
     * @param orderId 订单ID
     * @return 订单明细列表
     */
    List<OrderItem> selectByOrderId(@Param("orderId") Long orderId);

    /**
     * 根据订单ID列表查询订单明细
     *
     * @param orderIds 订单ID列表
     * @return 订单明细列表
     */
    List<OrderItem> selectByOrderIds(@Param("orderIds") List<Long> orderIds);

    /**
     * 根据SKU查询订单明细
     *
     * @param sku SKU编码
     * @return 订单明细列表
     */
    List<OrderItem> selectBySku(@Param("sku") String sku);

    /**
     * 批量插入订单明细
     *
     * @param orderItems 订单明细列表
     * @return 插入数量
     */
    int batchInsert(@Param("orderItems") List<OrderItem> orderItems);

    /**
     * 根据订单ID删除订单明细
     *
     * @param orderId 订单ID
     * @return 删除数量
     */
    int deleteByOrderId(@Param("orderId") Long orderId);
}