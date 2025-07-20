package com.erp.logistics.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

/**
 * 物流订单请求DTO
 *
 * @author ERP System
 */
@Data
public class LogisticsOrderRequest {

    /**
     * 订单号
     */
    @NotBlank(message = "订单号不能为空")
    private String orderNumber;

    /**
     * 收件人信息
     */
    @NotNull(message = "收件人信息不能为空")
    private RecipientInfo recipient;

    /**
     * 发件人信息
     */
    @NotNull(message = "发件人信息不能为空")
    private SenderInfo sender;

    /**
     * 包裹信息
     */
    @NotNull(message = "包裹信息不能为空")
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
        @NotBlank(message = "收件人姓名不能为空")
        private String name;
        
        @NotBlank(message = "收件人电话不能为空")
        private String phone;
        
        private String email;
        
        @NotBlank(message = "收件人地址不能为空")
        private String address;
        
        @NotBlank(message = "城市不能为空")
        private String city;
        
        @NotBlank(message = "州/省不能为空")
        private String state;
        
        @NotBlank(message = "邮编不能为空")
        private String zipCode;
        
        @NotBlank(message = "国家代码不能为空")
        private String countryCode;
    }

    @Data
    public static class SenderInfo {
        @NotBlank(message = "发件人姓名不能为空")
        private String name;
        
        @NotBlank(message = "发件人电话不能为空")
        private String phone;
        
        private String email;
        
        @NotBlank(message = "发件人地址不能为空")
        private String address;
        
        @NotBlank(message = "城市不能为空")
        private String city;
        
        @NotBlank(message = "州/省不能为空")
        private String state;
        
        @NotBlank(message = "邮编不能为空")
        private String zipCode;
        
        @NotBlank(message = "国家代码不能为空")
        private String countryCode;
    }

    @Data
    public static class PackageInfo {
        @Positive(message = "重量必须大于0")
        private BigDecimal weight;
        
        @Positive(message = "长度必须大于0")
        private BigDecimal length;
        
        @Positive(message = "宽度必须大于0")
        private BigDecimal width;
        
        @Positive(message = "高度必须大于0")
        private BigDecimal height;
        
        @NotBlank(message = "包裹描述不能为空")
        private String description;
        
        @Positive(message = "申报价值必须大于0")
        private BigDecimal declaredValue;
        
        private String currency = "USD";
    }
}