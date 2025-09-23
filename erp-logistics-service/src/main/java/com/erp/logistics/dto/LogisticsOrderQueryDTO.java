package com.erp.logistics.dto;

import com.erp.logistics.enums.LogisticsStatus;
import com.erp.logistics.enums.LogisticsType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 物流订单查询条件DTO
 *
 * @author ERP System
 */
@Data
public class LogisticsOrderQueryDTO {

    /**
     * 物流订单号
     */
    private String logisticsOrderNo;

    /**
     * 业务订单ID
     */
    private Long businessOrderId;

    /**
     * 业务订单号
     */
    private String businessOrderNo;

    /**
     * 物流类型
     */
    private LogisticsType logisticsType;

    /**
     * 物流状态
     */
    private LogisticsStatus status;

    /**
     * 物流服务商代码
     */
    private String providerCode;

    /**
     * 运单号
     */
    private String trackingNumber;

    /**
     * 创建时间开始
     */
    private LocalDateTime createTimeStart;

    /**
     * 创建时间结束
     */
    private LocalDateTime createTimeEnd;

    /**
     * 预计发货时间开始
     */
    private LocalDateTime estimatedShipTimeStart;

    /**
     * 预计发货时间结束
     */
    private LocalDateTime estimatedShipTimeEnd;

    /**
     * 实际发货时间开始
     */
    private LocalDateTime actualShipTimeStart;

    /**
     * 实际发货时间结束
     */
    private LocalDateTime actualShipTimeEnd;

    /**
     * 关键词搜索（订单号、运单号等）
     */
    private String keyword;
}