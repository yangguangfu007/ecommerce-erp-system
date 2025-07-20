package com.erp.notification.service;

import java.time.LocalDate;
import java.util.Map;

/**
 * 通知统计服务接口
 *
 * @author ERP System
 */
public interface NotificationStatisticsService {

    /**
     * 获取通知发送统计
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 统计数据
     */
    Map<String, Object> getNotificationStatistics(LocalDate startDate, LocalDate endDate);

    /**
     * 获取通知类型统计
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 统计数据
     */
    Map<String, Long> getNotificationTypeStatistics(LocalDate startDate, LocalDate endDate);

    /**
     * 获取通知状态统计
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 统计数据
     */
    Map<String, Long> getNotificationStatusStatistics(LocalDate startDate, LocalDate endDate);

    /**
     * 获取业务类型通知统计
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 统计数据
     */
    Map<String, Long> getBusinessTypeStatistics(LocalDate startDate, LocalDate endDate);

    /**
     * 获取通知成功率
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 成功率（百分比）
     */
    Double getNotificationSuccessRate(LocalDate startDate, LocalDate endDate);

    /**
     * 获取每日通知发送趋势
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 每日统计数据
     */
    Map<String, Map<String, Long>> getDailyNotificationTrend(LocalDate startDate, LocalDate endDate);

    /**
     * 获取失败通知统计
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 失败统计数据
     */
    Map<String, Object> getFailedNotificationStatistics(LocalDate startDate, LocalDate endDate);

    /**
     * 获取模板使用统计
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 模板使用统计
     */
    Map<String, Long> getTemplateUsageStatistics(LocalDate startDate, LocalDate endDate);

    /**
     * 记录通知发送性能指标
     *
     * @param notificationType 通知类型
     * @param sendDuration 发送耗时（毫秒）
     * @param success 是否成功
     */
    void recordPerformanceMetrics(String notificationType, long sendDuration, boolean success);

    /**
     * 获取通知发送性能统计
     *
     * @param notificationType 通知类型
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 性能统计数据
     */
    Map<String, Object> getPerformanceStatistics(String notificationType, LocalDate startDate, LocalDate endDate);
}