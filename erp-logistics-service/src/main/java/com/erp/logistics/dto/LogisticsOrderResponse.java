package com.erp.logistics.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 物流订单响应DTO
 *
 * @author ERP System
 */
@Data
public class LogisticsOrderResponse {

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 运单号
     */
    private String trackingNumber;

    /**
     * 物流商订单号
     */
    private String providerOrderId;

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
     * 创建时间
     */
    private LocalDateTime createdTime;

    /**
     * 创建成功的响应
     */
    public static LogisticsOrderResponse success(String trackingNumber, String providerOrderId) {
        LogisticsOrderResponse response = new LogisticsOrderResponse();
        response.setSuccess(true);
        response.setTrackingNumber(trackingNumber);
        response.setProviderOrderId(providerOrderId);
        response.setCreatedTime(LocalDateTime.now());
        return response;
    }

    /**
     * 创建失败的响应
     */
    public static LogisticsOrderResponse failure(String errorCode, String errorMessage) {
        LogisticsOrderResponse response = new LogisticsOrderResponse();
        response.setSuccess(false);
        response.setErrorCode(errorCode);
        response.setErrorMessage(errorMessage);
        response.setCreatedTime(LocalDateTime.now());
        return response;
    }
}