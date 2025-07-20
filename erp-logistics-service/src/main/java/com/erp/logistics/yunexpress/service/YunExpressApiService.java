package com.erp.logistics.yunexpress.service;

import com.erp.logistics.yunexpress.dto.YunExpressOrderRequest;
import com.erp.logistics.yunexpress.dto.YunExpressOrderResponse;
import com.erp.logistics.yunexpress.dto.YunExpressTrackingResponse;

/**
 * 云途物流API服务接口
 *
 * @author ERP System
 */
public interface YunExpressApiService {

    /**
     * 创建订单
     *
     * @param request 订单请求
     * @return 订单响应
     */
    YunExpressOrderResponse createOrder(YunExpressOrderRequest request);

    /**
     * 生成面单
     *
     * @param trackingNumber 运单号
     * @return 面单PDF的Base64编码
     */
    String generateLabel(String trackingNumber);

    /**
     * 查询跟踪信息
     *
     * @param trackingNumber 运单号
     * @return 跟踪响应
     */
    YunExpressTrackingResponse queryTracking(String trackingNumber);

    /**
     * 取消订单
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
}