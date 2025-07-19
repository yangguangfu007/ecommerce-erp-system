package com.erp.order.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.erp.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 订单库存锁定记录实体类
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_inventory_locks")
public class OrderInventoryLock extends BaseEntity {

    /**
     * 锁定ID
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
     * 锁定数量
     */
    @TableField("quantity")
    private Integer quantity;

    /**
     * 锁定状态
     */
    @TableField("lock_status")
    private LockStatus lockStatus;

    /**
     * 锁定时间
     */
    @TableField("lock_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lockTime;

    /**
     * 释放时间
     */
    @TableField("release_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime releaseTime;

    /**
     * 过期时间
     */
    @TableField("expire_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expireTime;

    /**
     * 锁定状态枚举
     */
    public enum LockStatus {
        LOCKED,   // 已锁定
        RELEASED, // 已释放
        CONSUMED  // 已消费
    }
}