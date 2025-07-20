package com.erp.logistics.yunexpress.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 云途物流订单请求DTO
 *
 * @author ERP System
 */
@Data
public class YunExpressOrderRequest {

    /**
     * 订单号
     */
    private String orderNumber;

    /**
     * 收件人信息
     */
    private RecipientInfo recipient;

    /**
     * 发件人信息
     */
    private SenderInfo sender;

    /**
     * 包裹信息
     */
    private PackageInfo packageInfo;

    /**
     * 服务类型
     */
    private String serviceType;

    /**
     * 备注
     */
    private String remark;

    @Data
    public static class RecipientInfo {
        private String name;
        private String phone;
        private String email;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private String countryCode;
    }

    @Data
    public static class SenderInfo {
        private String name;
        private String phone;
        private String email;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private String countryCode;
    }

    @Data
    public static class PackageInfo {
        private BigDecimal weight;
        private BigDecimal length;
        private BigDecimal width;
        private BigDecimal height;
        private String description;
        private BigDecimal declaredValue;
        private String currency;
    }
}