package com.erp.order.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.erp.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单实体类
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("orders")
public class Order extends BaseEntity {

    /**
     * 订单ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 订单编号
     */
    @TableField("order_id")
    private String orderId;

    /**
     * 平台订单ID
     */
    @TableField("platform_order_id")
    private String platformOrderId;

    /**
     * 店铺ID
     */
    @TableField("store_id")
    private Long storeId;

    /**
     * 客户姓名
     */
    @TableField("customer_name")
    private String customerName;

    /**
     * 客户邮箱
     */
    @TableField("customer_email")
    private String customerEmail;

    /**
     * 客户电话
     */
    @TableField("customer_phone")
    private String customerPhone;

    /**
     * 收货地址（JSON格式）
     */
    @TableField("shipping_address")
    private String shippingAddress;

    /**
     * 账单地址（JSON格式）
     */
    @TableField("billing_address")
    private String billingAddress;

    /**
     * 订单总金额
     */
    @TableField("total_amount")
    private BigDecimal totalAmount;

    /**
     * 货币类型
     */
    @TableField("currency")
    private String currency;

    /**
     * 订单状态
     */
    @TableField("status")
    private OrderStatus status;

    /**
     * 平台状态
     */
    @TableField("platform_status")
    private String platformStatus;

    /**
     * 下单时间
     */
    @TableField("order_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime orderDate;

    /**
     * 确认时间
     */
    @TableField("confirm_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime confirmDate;

    /**
     * 发货时间
     */
    @TableField("ship_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime shipDate;

    /**
     * 送达时间
     */
    @TableField("delivery_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deliveryDate;

    /**
     * 物流单号
     */
    @TableField("tracking_number")
    private String trackingNumber;

    /**
     * 配送方式
     */
    @TableField("shipping_method")
    private String shippingMethod;

    /**
     * 支付方式
     */
    @TableField("payment_method")
    private String paymentMethod;

    /**
     * 支付状态
     */
    @TableField("payment_status")
    private PaymentStatus paymentStatus;

    /**
     * 订单备注
     */
    @TableField("notes")
    private String notes;

    /**
     * 订单明细（不存储在数据库中）
     */
    @TableField(exist = false)
    private List<OrderItem> orderItems;

    /**
     * 订单状态枚举
     */
    public enum OrderStatus {
        PENDING,     // 待处理
        CONFIRMED,   // 已确认
        PROCESSING,  // 处理中
        SHIPPED,     // 已发货
        DELIVERED,   // 已送达
        CANCELLED,   // 已取消
        REFUNDED     // 已退款
    }

    /**
     * 支付状态枚举
     */
    public enum PaymentStatus {
        PENDING,  // 待支付
        PAID,     // 已支付
        FAILED,   // 支付失败
        REFUNDED  // 已退款
    }
}