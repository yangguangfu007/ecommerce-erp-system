package com.erp.order.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.order.dto.OrderDTO;
import com.erp.order.dto.OrderQueryDTO;
import com.erp.order.entity.Order;

import java.util.List;

/**
 * 订单服务接口
 *
 * @author ERP System
 */
public interface OrderService {

    /**
     * 创建订单
     *
     * @param orderDTO 订单信息
     * @return 订单ID
     */
    Long createOrder(OrderDTO orderDTO);

    /**
     * 更新订单
     *
     * @param orderDTO 订单信息
     * @return 是否成功
     */
    boolean updateOrder(OrderDTO orderDTO);

    /**
     * 根据ID查询订单
     *
     * @param orderId 订单ID
     * @return 订单信息
     */
    OrderDTO getOrderById(Long orderId);

    /**
     * 根据订单编号查询订单
     *
     * @param orderNo 订单编号
     * @return 订单信息
     */
    OrderDTO getOrderByOrderNo(String orderNo);

    /**
     * 分页查询订单
     *
     * @param query 查询条件
     * @return 订单分页结果
     */
    IPage<OrderDTO> getOrderPage(OrderQueryDTO query);

    /**
     * 查询订单列表
     *
     * @param query 查询条件
     * @return 订单列表
     */
    List<OrderDTO> getOrderList(OrderQueryDTO query);

    /**
     * 更新订单状态
     *
     * @param orderId 订单ID
     * @param status 新状态
     * @param reason 变更原因
     * @param operator 操作人
     * @return 是否成功
     */
    boolean updateOrderStatus(Long orderId, Order.OrderStatus status, String reason, String operator);

    /**
     * 批量更新订单状态
     *
     * @param orderIds 订单ID列表
     * @param status 新状态
     * @param reason 变更原因
     * @param operator 操作人
     * @return 更新数量
     */
    int batchUpdateOrderStatus(List<Long> orderIds, Order.OrderStatus status, String reason, String operator);

    /**
     * 确认订单
     *
     * @param orderId 订单ID
     * @param operator 操作人
     * @return 是否成功
     */
    boolean confirmOrder(Long orderId, String operator);

    /**
     * 发货订单
     *
     * @param orderId 订单ID
     * @param trackingNumber 物流单号
     * @param shippingMethod 配送方式
     * @param operator 操作人
     * @return 是否成功
     */
    boolean shipOrder(Long orderId, String trackingNumber, String shippingMethod, String operator);

    /**
     * 取消订单
     *
     * @param orderId 订单ID
     * @param reason 取消原因
     * @param operator 操作人
     * @return 是否成功
     */
    boolean cancelOrder(Long orderId, String reason, String operator);

    /**
     * 删除订单
     *
     * @param orderId 订单ID
     * @return 是否成功
     */
    boolean deleteOrder(Long orderId);

    /**
     * 同步平台订单
     *
     * @param storeId 店铺ID
     * @return 同步数量
     */
    int syncPlatformOrders(Long storeId);

    /**
     * 统计订单数量按状态分组
     *
     * @param storeIds 店铺ID列表
     * @return 统计结果
     */
    List<OrderService.OrderStatusCount> countOrdersByStatus(List<Long> storeIds);

    /**
     * 自动取消超时订单
     *
     * @return 取消数量
     */
    int autoCancelTimeoutOrders();

    /**
     * 订单状态统计
     */
    class OrderStatusCount {
        private String status;
        private Long count;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Long getCount() {
            return count;
        }

        public void setCount(Long count) {
            this.count = count;
        }
    }
}