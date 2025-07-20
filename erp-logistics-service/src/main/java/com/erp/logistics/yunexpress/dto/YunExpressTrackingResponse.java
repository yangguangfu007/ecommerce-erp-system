package com.erp.logistics.yunexpress.dto;

import com.erp.logistics.dto.LogisticsStatusResponse;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 云途物流跟踪响应DTO
 *
 * @author ERP System
 */
@Data
public class YunExpressTrackingResponse {

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 运单号
     */
    private String trackingNumber;

    /**
     * 当前状态
     */
    private String currentStatus;

    /**
     * 状态描述
     */
    private String statusDescription;

    /**
     * 最后更新时间
     */
    private LocalDateTime lastUpdateTime;

    /**
     * 物流轨迹
     */
    private List<LogisticsStatusResponse.TrackingEvent> trackingEvents;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 错误代码
     */
    private String errorCode;

    /**
     * 响应时间
     */
    private LocalDateTime responseTime;
}