package com.erp.logistics.entity;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.common.handler.JsonTypeHandler;
import com.erp.logistics.enums.LogisticsStatus;
import com.erp.logistics.enums.LogisticsType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 物流订单实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("logistics_orders")
public class LogisticsOrder extends BaseEntity {

    /**
     * 物流订单号（系统生成）
     */
    private String logisticsOrderNo;

    /**
     * 关联的业务订单ID
     */
    private Long businessOrderId;

    /**
     * 关联的业务订单号
     */
    private String businessOrderNo;

    /**
     * 物流类型
     */
    @EnumValue
    private LogisticsType logisticsType;

    /**
     * 物流状态
     */
    @EnumValue
    private LogisticsStatus status;

    /**
     * 物流服务商名称
     */
    private String providerName;

    /**
     * 物流服务商代码
     */
    private String providerCode;

    /**
     * 运单号
     */
    private String trackingNumber;

    /**
     * 发件人信息（JSON格式存储）
     */
    @TableField(typeHandler = JsonTypeHandler.class)
    private Map<String, Object> senderInfo;

    /**
     * 收件人信息（JSON格式存储）
     */
    @TableField(typeHandler = JsonTypeHandler.class)
    private Map<String, Object> recipientInfo;

    /**
     * 包裹信息（JSON格式存储）
     */
    @TableField(typeHandler = JsonTypeHandler.class)
    private Map<String, Object> packageInfo;

    /**
     * 物流费用
     */
    private BigDecimal shippingCost;

    /**
     * 币种
     */
    private String currency;

    /**
     * 预计发货时间
     */
    private LocalDateTime estimatedShipTime;

    /**
     * 实际发货时间
     */
    private LocalDateTime actualShipTime;

    /**
     * 预计送达时间
     */
    private LocalDateTime estimatedDeliveryTime;

    /**
     * 实际送达时间
     */
    private LocalDateTime actualDeliveryTime;

    /**
     * 物流服务等级
     */
    private String serviceLevel;

    /**
     * 是否需要签收
     */
    private Boolean requireSignature;

    /**
     * 是否保价
     */
    private Boolean insured;

    /**
     * 保价金额
     */
    private BigDecimal insuredValue;

    /**
     * 备注信息
     */
    private String remarks;

    /**
     * 扩展信息（JSON格式存储）
     */
    @TableField(typeHandler = JsonTypeHandler.class)
    private Map<String, Object> extendInfo;

    @Override
    public String getEntityDescription() {
        return "物流订单(订单号=" + logisticsOrderNo + ", 运单号=" + trackingNumber + ")";
    }
}