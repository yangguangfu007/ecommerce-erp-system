package com.erp.logistics.dto;

import com.erp.logistics.enums.ExceptionStatus;
import com.erp.logistics.enums.ExceptionType;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 物流异常数据传输对象
 *
 * @author ERP System
 */
@Data
public class LogisticsExceptionDTO {

    /**
     * 关联的物流订单ID
     */
    @NotNull(message = "物流订单ID不能为空")
    private Long logisticsOrderId;

    /**
     * 运单号
     */
    @NotBlank(message = "运单号不能为空")
    private String trackingNumber;

    /**
     * 异常类型
     */
    @NotNull(message = "异常类型不能为空")
    private ExceptionType exceptionType;

    /**
     * 异常状态
     */
    private ExceptionStatus status;

    /**
     * 异常标题
     */
    @NotBlank(message = "异常标题不能为空")
    private String title;

    /**
     * 异常描述
     */
    @NotBlank(message = "异常描述不能为空")
    private String description;

    /**
     * 发生时间
     */
    private LocalDateTime occurredTime;

    /**
     * 发生地点
     */
    private String location;

    /**
     * 责任方
     */
    private String responsibleParty;

    /**
     * 处理方案
     */
    private String solution;

    /**
     * 处理人员
     */
    private String handler;

    /**
     * 处理时间
     */
    private LocalDateTime handledTime;

    /**
     * 处理结果
     */
    private String result;

    /**
     * 备注信息
     */
    private String remarks;

    /**
     * 扩展信息
     */
    private Map<String, Object> extendInfo;
}