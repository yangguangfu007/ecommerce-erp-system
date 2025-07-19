package com.erp.platform.walmart.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 沃尔玛订单DTO
 *
 * @author ERP System
 */
@Data
public class WalmartOrder {
    
    /**
     * 采购订单号
     */
    @JsonProperty("purchaseOrderId")
    private String purchaseOrderId;
    
    /**
     * 客户订单号
     */
    @JsonProperty("customerOrderId")
    private String customerOrderId;
    
    /**
     * 客户邮箱
     */
    @JsonProperty("customerEmailId")
    private String customerEmailId;
    
    /**
     * 订单日期
     */
    @JsonProperty("orderDate")
    private LocalDateTime orderDate;
    
    /**
     * 配送地址
     */
    @JsonProperty("shippingInfo")
    private ShippingInfo shippingInfo;
    
    /**
     * 订单行项目
     */
    @JsonProperty("orderLines")
    private OrderLines orderLines;
    
    @Data
    public static class ShippingInfo {
        @JsonProperty("phone")
        private String phone;
        
        @JsonProperty("estimatedDeliveryDate")
        private LocalDateTime estimatedDeliveryDate;
        
        @JsonProperty("estimatedShipDate")
        private LocalDateTime estimatedShipDate;
        
        @JsonProperty("methodCode")
        private String methodCode;
        
        @JsonProperty("postalAddress")
        private PostalAddress postalAddress;
    }
    
    @Data
    public static class PostalAddress {
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("address1")
        private String address1;
        
        @JsonProperty("address2")
        private String address2;
        
        @JsonProperty("city")
        private String city;
        
        @JsonProperty("state")
        private String state;
        
        @JsonProperty("postalCode")
        private String postalCode;
        
        @JsonProperty("country")
        private String country;
        
        @JsonProperty("addressType")
        private String addressType;
    }
    
    @Data
    public static class OrderLines {
        @JsonProperty("orderLine")
        private List<OrderLine> orderLine;
    }
    
    @Data
    public static class OrderLine {
        @JsonProperty("lineNumber")
        private String lineNumber;
        
        @JsonProperty("item")
        private Item item;
        
        @JsonProperty("charges")
        private Charges charges;
        
        @JsonProperty("orderLineQuantity")
        private OrderLineQuantity orderLineQuantity;
        
        @JsonProperty("statusDate")
        private LocalDateTime statusDate;
        
        @JsonProperty("orderLineStatuses")
        private OrderLineStatuses orderLineStatuses;
    }
    
    @Data
    public static class Item {
        @JsonProperty("productName")
        private String productName;
        
        @JsonProperty("sku")
        private String sku;
    }
    
    @Data
    public static class Charges {
        @JsonProperty("charge")
        private List<Charge> charge;
    }
    
    @Data
    public static class Charge {
        @JsonProperty("chargeType")
        private String chargeType;
        
        @JsonProperty("chargeName")
        private String chargeName;
        
        @JsonProperty("chargeAmount")
        private ChargeAmount chargeAmount;
    }
    
    @Data
    public static class ChargeAmount {
        @JsonProperty("currency")
        private String currency;
        
        @JsonProperty("amount")
        private BigDecimal amount;
    }
    
    @Data
    public static class OrderLineQuantity {
        @JsonProperty("unitOfMeasurement")
        private String unitOfMeasurement;
        
        @JsonProperty("amount")
        private Integer amount;
    }
    
    @Data
    public static class OrderLineStatuses {
        @JsonProperty("orderLineStatus")
        private List<OrderLineStatus> orderLineStatus;
    }
    
    @Data
    public static class OrderLineStatus {
        @JsonProperty("status")
        private String status;
        
        @JsonProperty("statusQuantity")
        private StatusQuantity statusQuantity;
    }
    
    @Data
    public static class StatusQuantity {
        @JsonProperty("unitOfMeasurement")
        private String unitOfMeasurement;
        
        @JsonProperty("amount")
        private Integer amount;
    }
}