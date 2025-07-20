package com.erp.logistics.yunexpress.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 云途物流订单响应DTO
 *
 * @author ERP System
 */
@Data
public class YunExpressOrderResponse {

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 运单号
     */
    private String trackingNumber;

    /**
     * 云途订单ID
     */
    private String orderId;

    /**
     * 服务类型
     */
    private String serviceType;

    /**
     * 预计送达时间
     */
    private LocalDateTime estimatedDeliveryTime;

    /**
     * 运费
     */
    private String shippingCost;

    /**
     * 货币
     */
    private String currency;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 错误代码
     */
    private String errorCode;

    /**
     * 响应时间
     */
    private LocalDateTime responseTime;
}