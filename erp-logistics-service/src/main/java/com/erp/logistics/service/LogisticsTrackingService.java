package com.erp.logistics.service;

import com.erp.logistics.dto.LogisticsStatusResponse;

import java.util.List;
import java.util.Map;

/**
 * 物流跟踪服务接口
 *
 * @author ERP System
 */
public interface LogisticsTrackingService {

    /**
     * 查询物流状态
     *
     * @param trackingNumber 运单号
     * @return 物流状态响应
     */
    LogisticsStatusResponse queryStatus(String trackingNumber);

    /**
     * 批量查询物流状态
     *
     * @param trackingNumbers 运单号列表
     * @return 物流状态映射
     */
    Map<String, LogisticsStatusResponse> batchQueryStatus(List<String> trackingNumbers);

    /**
     * 同步物流状态到订单服务
     *
     * @param trackingNumber 运单号
     * @return 是否成功
     */
    boolean syncStatusToOrder(String trackingNumber);

    /**
     * 批量同步物流状态
     *
     * @param trackingNumbers 运单号列表
     * @return 同步结果
     */
    Map<String, Boolean> batchSyncStatus(List<String> trackingNumbers);

    /**
     * 检测物流异常
     *
     * @param trackingNumber 运单号
     * @return 是否有异常
     */
    boolean detectAbnormal(String trackingNumber);

    /**
     * 获取异常物流列表
     *
     * @return 异常运单号列表
     */
    List<String> getAbnormalTrackings();

    /**
     * 处理物流异常
     *
     * @param trackingNumber 运单号
     * @param action 处理动作
     * @return 是否成功
     */
    boolean handleAbnormal(String trackingNumber, String action);

    /**
     * 启动定时同步任务
     */
    void startScheduledSync();

    /**
     * 停止定时同步任务
     */
    void stopScheduledSync();
}