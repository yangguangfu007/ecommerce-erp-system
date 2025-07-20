package com.erp.logistics.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 面单响应DTO
 *
 * @author ERP System
 */
@Data
public class ShippingLabelResponse {

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 运单号
     */
    private String trackingNumber;

    /**
     * 面单PDF的Base64编码
     */
    private String labelPdfBase64;

    /**
     * 面单PDF的URL
     */
    private String labelPdfUrl;

    /**
     * 面单格式
     */
    private String labelFormat;

    /**
     * 面单尺寸
     */
    private String labelSize;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 错误代码
     */
    private String errorCode;

    /**
     * 生成时间
     */
    private LocalDateTime generatedTime;

    /**
     * 创建成功的响应
     */
    public static ShippingLabelResponse success(String trackingNumber, String labelPdfBase64) {
        ShippingLabelResponse response = new ShippingLabelResponse();
        response.setSuccess(true);
        response.setTrackingNumber(trackingNumber);
        response.setLabelPdfBase64(labelPdfBase64);
        response.setLabelFormat("PDF");
        response.setGeneratedTime(LocalDateTime.now());
        return response;
    }

    /**
     * 创建失败的响应
     */
    public static ShippingLabelResponse failure(String errorCode, String errorMessage) {
        ShippingLabelResponse response = new ShippingLabelResponse();
        response.setSuccess(false);
        response.setErrorCode(errorCode);
        response.setErrorMessage(errorMessage);
        response.setGeneratedTime(LocalDateTime.now());
        return response;
    }
}