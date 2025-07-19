package com.erp.order.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.erp.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 订单明细实体类
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_items")
public class OrderItem extends BaseEntity {

    /**
     * 明细ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 订单ID
     */
    @TableField("order_id")
    private Long orderId;

    /**
     * SKU编码
     */
    @TableField("sku")
    private String sku;

    /**
     * 商品标题
     */
    @TableField("product_title")
    private String productTitle;

    /**
     * 商品图片
     */
    @TableField("product_image")
    private String productImage;

    /**
     * 数量
     */
    @TableField("quantity")
    private Integer quantity;

    /**
     * 单价
     */
    @TableField("unit_price")
    private BigDecimal unitPrice;

    /**
     * 小计
     */
    @TableField("total_price")
    private BigDecimal totalPrice;

    /**
     * 折扣金额
     */
    @TableField("discount_amount")
    private BigDecimal discountAmount;

    /**
     * 税费
     */
    @TableField("tax_amount")
    private BigDecimal taxAmount;

    /**
     * 平台商品ID
     */
    @TableField("platform_item_id")
    private String platformItemId;

    /**
     * 商品属性（JSON格式）
     */
    @TableField("attributes")
    private String attributes;
}