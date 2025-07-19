package com.erp.inventory.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 库存变动记录实体类
 *
 * @author ERP System
 */
@Data
@TableName("inventory_transaction")
public class InventoryTransaction {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 事务ID
     */
    @TableField("transaction_id")
    private String transactionId;

    /**
     * SKU编码
     */
    @TableField("sku")
    private String sku;

    /**
     * 店铺ID
     */
    @TableField("store_id")
    private Long storeId;

    /**
     * 变动类型
     */
    @TableField("transaction_type")
    private TransactionType transactionType;

    /**
     * 变动数量
     */
    @TableField("quantity")
    private Integer quantity;

    /**
     * 变动前数量
     */
    @TableField("before_quantity")
    private Integer beforeQuantity;

    /**
     * 变动后数量
     */
    @TableField("after_quantity")
    private Integer afterQuantity;

    /**
     * 关联业务ID
     */
    @TableField("reference_id")
    private String referenceId;

    /**
     * 关联业务类型
     */
    @TableField("reference_type")
    private String referenceType;

    /**
     * 变动原因
     */
    @TableField("reason")
    private String reason;

    /**
     * 操作人
     */
    @TableField("operator")
    private String operator;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 库存变动类型枚举
     */
    public enum TransactionType {
        /**
         * 入库
         */
        INBOUND,
        /**
         * 出库
         */
        OUTBOUND,
        /**
         * 预留
         */
        RESERVE,
        /**
         * 释放
         */
        RELEASE,
        /**
         * 调整
         */
        ADJUST
    }
}