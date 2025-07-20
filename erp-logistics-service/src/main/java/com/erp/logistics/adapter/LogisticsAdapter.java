package com.erp.logistics.adapter;

import com.erp.logistics.dto.LogisticsOrderRequest;
import com.erp.logistics.dto.LogisticsOrderResponse;
import com.erp.logistics.dto.LogisticsStatusResponse;
import com.erp.logistics.dto.ShippingLabelResponse;

/**
 * 物流适配器接口
 * 定义物流服务商的标准化接口
 *
 * @author ERP System
 */
public interface LogisticsAdapter {

    /**
     * 创建物流订单
     *
     * @param request 物流订单请求
     * @return 物流订单响应
     */
    LogisticsOrderResponse createShippingOrder(LogisticsOrderRequest request);

    /**
     * 生成面单
     *
     * @param trackingNumber 运单号
     * @return 面单响应
     */
    ShippingLabelResponse generateLabel(String trackingNumber);

    /**
     * 查询物流状态
     *
     * @param trackingNumber 运单号
     * @return 物流状态响应
     */
    LogisticsStatusResponse queryStatus(String trackingNumber);

    /**
     * 取消物流订单
     *
     * @param trackingNumber 运单号
     * @return 是否成功
     */
    boolean cancelOrder(String trackingNumber);

    /**
     * 测试连接
     *
     * @return 是否连接成功
     */
    boolean testConnection();

    /**
     * 获取物流商名称
     *
     * @return 物流商名称
     */
    String getProviderName();
}