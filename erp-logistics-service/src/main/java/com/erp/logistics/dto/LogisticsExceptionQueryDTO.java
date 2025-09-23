package com.erp.logistics.dto;

import com.erp.logistics.enums.ExceptionStatus;
import com.erp.logistics.enums.ExceptionType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 物流异常查询条件DTO
 *
 * @author ERP System
 */
@Data
public class LogisticsExceptionQueryDTO {

    /**
     * 物流订单ID
     */
    private Long logisticsOrderId;

    /**
     * 运单号
     */
    private String trackingNumber;

    /**
     * 异常类型
     */
    private ExceptionType exceptionType;

    /**
     * 异常状态
     */
    private ExceptionStatus status;

    /**
     * 发生时间开始
     */
    private LocalDateTime occurredTimeStart;

    /**
     * 发生时间结束
     */
    private LocalDateTime occurredTimeEnd;

    /**
     * 处理时间开始
     */
    private LocalDateTime handledTimeStart;

    /**
     * 处理时间结束
     */
    private LocalDateTime handledTimeEnd;

    /**
     * 责任方
     */
    private String responsibleParty;

    /**
     * 处理人员
     */
    private String handler;

    /**
     * 关键词搜索
     */
    private String keyword;
}