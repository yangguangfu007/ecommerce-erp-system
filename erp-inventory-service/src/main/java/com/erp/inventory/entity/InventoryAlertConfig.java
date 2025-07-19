package com.erp.inventory.entity;

import com.erp.common.entity.BaseEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存预警配置实体类
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("inventory_alert_config")
public class InventoryAlertConfig extends BaseEntity {

    /**
     * SKU编码
     */
    @TableField("sku")
    private String sku;

    /**
     * 店铺ID，NULL表示全局配置
     */
    @TableField("store_id")
    private Long storeId;

    /**
     * 预警类型
     */
    @TableField("alert_type")
    private AlertType alertType;

    /**
     * 阈值
     */
    @TableField("threshold_value")
    private Integer thresholdValue;

    /**
     * 是否启用
     */
    @TableField("is_enabled")
    private Boolean isEnabled;

    /**
     * 通知邮箱列表
     */
    @TableField("notification_emails")
    private String notificationEmails;

    /**
     * 预警类型枚举
     */
    public enum AlertType {
        /**
         * 低库存预警
         */
        LOW_STOCK,
        /**
         * 缺货预警
         */
        OUT_OF_STOCK,
        /**
         * 库存过多预警
         */
        OVERSTOCK
    }
}