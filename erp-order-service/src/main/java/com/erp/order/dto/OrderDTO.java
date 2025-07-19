package com.erp.order.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单DTO
 *
 * @author ERP System
 */
@Data
public class OrderDTO {

    /**
     * 订单ID
     */
    private Long id;

    /**
     * 订单编号
     */
    private String orderId;

    /**
     * 平台订单ID
     */
    private String platformOrderId;

    /**
     * 店铺ID
     */
    @NotNull(message = "店铺ID不能为空")
    private Long storeId;

    /**
     * 客户姓名
     */
    @NotBlank(message = "客户姓名不能为空")
    @Size(max = 100, message = "客户姓名长度不能超过100个字符")
    private String customerName;

    /**
     * 客户邮箱
     */
    @Email(message = "邮箱格式不正确")
    @Size(max = 100, message = "邮箱长度不能超过100个字符")
    private String customerEmail;

    /**
     * 客户电话
     */
    @Size(max = 50, message = "电话长度不能超过50个字符")
    private String customerPhone;

    /**
     * 收货地址
     */
    @Valid
    private AddressDTO shippingAddress;

    /**
     * 账单地址
     */
    @Valid
    private AddressDTO billingAddress;

    /**
     * 订单总金额
     */
    @NotNull(message = "订单总金额不能为空")
    @DecimalMin(value = "0.01", message = "订单总金额必须大于0")
    private BigDecimal totalAmount;

    /**
     * 货币类型
     */
    @NotBlank(message = "货币类型不能为空")
    @Size(max = 10, message = "货币类型长度不能超过10个字符")
    private String currency;

    /**
     * 订单状态
     */
    private String status;

    /**
     * 平台状态
     */
    private String platformStatus;

    /**
     * 下单时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime orderDate;

    /**
     * 确认时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime confirmDate;

    /**
     * 发货时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime shipDate;

    /**
     * 送达时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deliveryDate;

    /**
     * 物流单号
     */
    private String trackingNumber;

    /**
     * 配送方式
     */
    private String shippingMethod;

    /**
     * 支付方式
     */
    private String paymentMethod;

    /**
     * 支付状态
     */
    private String paymentStatus;

    /**
     * 订单备注
     */
    @Size(max = 1000, message = "订单备注长度不能超过1000个字符")
    private String notes;

    /**
     * 订单明细
     */
    @Valid
    @NotEmpty(message = "订单明细不能为空")
    private List<OrderItemDTO> orderItems;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 创建人
     */
    private String createdBy;

    /**
     * 更新人
     */
    private String updatedBy;
}