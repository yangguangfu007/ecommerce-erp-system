package com.erp.order.dto;

import lombok.Data;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * 订单明细DTO
 *
 * @author ERP System
 */
@Data
public class OrderItemDTO {

    /**
     * 明细ID
     */
    private Long id;

    /**
     * 订单ID
     */
    private Long orderId;

    /**
     * SKU编码
     */
    @NotBlank(message = "SKU编码不能为空")
    @Size(max = 100, message = "SKU编码长度不能超过100个字符")
    private String sku;

    /**
     * 商品标题
     */
    @Size(max = 500, message = "商品标题长度不能超过500个字符")
    private String productTitle;

    /**
     * 商品图片
     */
    @Size(max = 500, message = "商品图片URL长度不能超过500个字符")
    private String productImage;

    /**
     * 数量
     */
    @NotNull(message = "数量不能为空")
    @Min(value = 1, message = "数量必须大于0")
    private Integer quantity;

    /**
     * 单价
     */
    @NotNull(message = "单价不能为空")
    @DecimalMin(value = "0.01", message = "单价必须大于0")
    private BigDecimal unitPrice;

    /**
     * 小计
     */
    @NotNull(message = "小计不能为空")
    @DecimalMin(value = "0.01", message = "小计必须大于0")
    private BigDecimal totalPrice;

    /**
     * 折扣金额
     */
    @DecimalMin(value = "0.00", message = "折扣金额不能为负数")
    private BigDecimal discountAmount;

    /**
     * 税费
     */
    @DecimalMin(value = "0.00", message = "税费不能为负数")
    private BigDecimal taxAmount;

    /**
     * 平台商品ID
     */
    @Size(max = 100, message = "平台商品ID长度不能超过100个字符")
    private String platformItemId;

    /**
     * 商品属性
     */
    private String attributes;
}