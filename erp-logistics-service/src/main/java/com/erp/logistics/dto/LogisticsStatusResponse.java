package com.erp.logistics.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 物流状态响应DTO
 *
 * @author ERP System
 */
@Data
public class LogisticsStatusResponse {

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
    private List<TrackingEvent> trackingEvents;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 错误代码
     */
    private String errorCode;

    @Data
    public static class TrackingEvent {
        /**
         * 事件时间
         */
        private LocalDateTime eventTime;

        /**
         * 事件状态
         */
        private String status;

        /**
         * 事件描述
         */
        private String description;

        /**
         * 事件地点
         */
        private String location;

        /**
         * 操作员
         */
        private String operator;
    }

    /**
     * 创建成功的响应
     */
    public static LogisticsStatusResponse success(String trackingNumber, String currentStatus) {
        LogisticsStatusResponse response = new LogisticsStatusResponse();
        response.setSuccess(true);
        response.setTrackingNumber(trackingNumber);
        response.setCurrentStatus(currentStatus);
        response.setLastUpdateTime(LocalDateTime.now());
        return response;
    }

    /**
     * 创建失败的响应
     */
    public static LogisticsStatusResponse failure(String errorCode, String errorMessage) {
        LogisticsStatusResponse response = new LogisticsStatusResponse();
        response.setSuccess(false);
        response.setErrorCode(errorCode);
        response.setErrorMessage(errorMessage);
        return response;
    }
}