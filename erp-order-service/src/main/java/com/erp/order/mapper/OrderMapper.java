package com.erp.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.order.dto.OrderQueryDTO;
import com.erp.order.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 订单Mapper接口
 *
 * @author ERP System
 */
@Mapper
public interface OrderMapper extends BaseMapper<Order> {

    /**
     * 分页查询订单
     *
     * @param page 分页参数
     * @param query 查询条件
     * @return 订单分页结果
     */
    IPage<Order> selectOrderPage(Page<Order> page, @Param("query") OrderQueryDTO query);

    /**
     * 根据条件查询订单列表
     *
     * @param query 查询条件
     * @return 订单列表
     */
    List<Order> selectOrderList(@Param("query") OrderQueryDTO query);

    /**
     * 根据订单ID查询订单详情（包含订单明细）
     *
     * @param orderId 订单ID
     * @return 订单详情
     */
    Order selectOrderWithItems(@Param("orderId") Long orderId);

    /**
     * 根据平台订单ID查询订单
     *
     * @param platformOrderId 平台订单ID
     * @param storeId 店铺ID
     * @return 订单信息
     */
    Order selectByPlatformOrderId(@Param("platformOrderId") String platformOrderId, 
                                  @Param("storeId") Long storeId);

    /**
     * 批量更新订单状态
     *
     * @param orderIds 订单ID列表
     * @param status 新状态
     * @param updatedBy 更新人
     * @return 更新数量
     */
    int batchUpdateStatus(@Param("orderIds") List<Long> orderIds, 
                         @Param("status") String status, 
                         @Param("updatedBy") String updatedBy);

    /**
     * 统计订单数量按状态分组
     *
     * @param storeIds 店铺ID列表
     * @return 统计结果
     */
    List<OrderStatusCount> countOrdersByStatus(@Param("storeIds") List<Long> storeIds);

    /**
     * 查询需要自动取消的订单
     *
     * @param hours 小时数
     * @return 订单列表
     */
    List<Order> selectOrdersForAutoCancel(@Param("hours") int hours);

    /**
     * 订单状态统计内部类
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