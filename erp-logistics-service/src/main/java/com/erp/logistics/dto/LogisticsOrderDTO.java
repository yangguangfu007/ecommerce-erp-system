package com.erp.logistics.dto;

import com.erp.logistics.enums.LogisticsStatus;
import com.erp.logistics.enums.LogisticsType;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 物流订单数据传输对象
 *
 * @author ERP System
 */
@Data
public class LogisticsOrderDTO {

    /**
     * 物流订单号（系统生成）
     */
    private String logisticsOrderNo;

    /**
     * 关联的业务订单ID
     */
    @NotNull(message = "业务订单ID不能为空")
    private Long businessOrderId;

    /**
     * 关联的业务订单号
     */
    @NotBlank(message = "业务订单号不能为空")
    private String businessOrderNo;

    /**
     * 物流类型
     */
    @NotNull(message = "物流类型不能为空")
    private LogisticsType logisticsType;

    /**
     * 物流状态
     */
    private LogisticsStatus status;

    /**
     * 物流服务商名称
     */
    @NotBlank(message = "物流服务商名称不能为空")
    private String providerName;

    /**
     * 物流服务商代码
     */
    @NotBlank(message = "物流服务商代码不能为空")
    private String providerCode;

    /**
     * 运单号
     */
    private String trackingNumber;

    /**
     * 发件人信息（JSON格式存储）
     */
    private Map<String, Object> senderInfo;

    /**
     * 收件人信息（JSON格式存储）
     */
    private Map<String, Object> recipientInfo;

    /**
     * 包裹信息（JSON格式存储）
     */
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
    private Map<String, Object> extendInfo;
}