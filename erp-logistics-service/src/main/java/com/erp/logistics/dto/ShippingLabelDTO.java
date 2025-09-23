package com.erp.logistics.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

/**
 * 面单数据传输对象
 *
 * @author ERP System
 */
@Data
public class ShippingLabelDTO {

    /**
     * 关联的物流订单ID
     */
    @NotNull(message = "物流订单ID不能为空")
    private Long logisticsOrderId;

    /**
     * 面单模板ID
     */
    private String templateId;

    /**
     * 面单类型
     */
    @NotBlank(message = "面单类型不能为空")
    private String labelType;

    /**
     * 面单格式（PDF、PNG等）
     */
    private String labelFormat;

    /**
     * 面单尺寸
     */
    private String labelSize;

    /**
     * 打印份数
     */
    private Integer copies;

    /**
     * 是否需要回单
     */
    private Boolean needReceipt;

    /**
     * 特殊要求
     */
    private String specialRequirements;

    /**
     * 扩展参数
     */
    private Map<String, Object> extendParams;
}