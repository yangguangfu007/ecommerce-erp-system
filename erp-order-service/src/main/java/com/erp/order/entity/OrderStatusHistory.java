package com.erp.order.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.erp.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 订单状态变更记录实体类
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_status_history")
public class OrderStatusHistory extends BaseEntity {

    /**
     * 记录ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 订单ID
     */
    @TableField("order_id")
    private Long orderId;

    /**
     * 原状态
     */
    @TableField("from_status")
    private String fromStatus;

    /**
     * 新状态
     */
    @TableField("to_status")
    private String toStatus;

    /**
     * 变更原因
     */
    @TableField("reason")
    private String reason;

    /**
     * 操作人
     */
    @TableField("operator")
    private String operator;
}