package com.erp.inventory.entity;

import com.erp.common.entity.BaseEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 库存盘点实体类
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("inventory_check")
public class InventoryCheck extends BaseEntity {

    /**
     * 盘点单号
     */
    @TableField("check_id")
    private String checkId;

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
     * 系统库存数量
     */
    @TableField("system_quantity")
    private Integer systemQuantity;

    /**
     * 实际盘点数量
     */
    @TableField("actual_quantity")
    private Integer actualQuantity;

    /**
     * 差异数量
     */
    @TableField("difference_quantity")
    private Integer differenceQuantity;

    /**
     * 盘点状态
     */
    @TableField("check_status")
    private CheckStatus checkStatus;

    /**
     * 盘点原因
     */
    @TableField("check_reason")
    private String checkReason;

    /**
     * 盘点人
     */
    @TableField("checker")
    private String checker;

    /**
     * 审批人
     */
    @TableField("approver")
    private String approver;

    /**
     * 盘点时间
     */
    @TableField("check_time")
    private LocalDateTime checkTime;

    /**
     * 审批时间
     */
    @TableField("approve_time")
    private LocalDateTime approveTime;

    /**
     * 盘点状态枚举
     */
    public enum CheckStatus {
        /**
         * 待审批
         */
        PENDING,
        /**
         * 已审批
         */
        APPROVED,
        /**
         * 已拒绝
         */
        REJECTED
    }

    /**
     * 计算差异数量
     */
    public void calculateDifference() {
        if (this.systemQuantity != null && this.actualQuantity != null) {
            this.differenceQuantity = this.actualQuantity - this.systemQuantity;
        }
    }

    /**
     * 是否有差异
     *
     * @return 是否有差异
     */
    public boolean hasDifference() {
        return this.differenceQuantity != null && this.differenceQuantity != 0;
    }
}