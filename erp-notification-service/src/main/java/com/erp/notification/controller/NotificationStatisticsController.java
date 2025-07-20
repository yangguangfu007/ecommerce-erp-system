package com.erp.notification.controller;

import com.erp.notification.service.NotificationStatisticsService;
import com.erp.common.response.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * 通知统计控制器
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/notification-statistics")
@RequiredArgsConstructor
public class NotificationStatisticsController {

    private final NotificationStatisticsService statisticsService;

    /**
     * 获取通知发送统计
     */
    @GetMapping("/overview")
    public Result<Map<String, Object>> getNotificationStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> statistics = statisticsService.getNotificationStatistics(startDate, endDate);
        return Result.success(statistics);
    }

    /**
     * 获取通知类型统计
     */
    @GetMapping("/by-type")
    public Result<Map<String, Long>> getNotificationTypeStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Long> statistics = statisticsService.getNotificationTypeStatistics(startDate, endDate);
        return Result.success(statistics);
    }

    /**
     * 获取通知状态统计
     */
    @GetMapping("/by-status")
    public Result<Map<String, Long>> getNotificationStatusStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Long> statistics = statisticsService.getNotificationStatusStatistics(startDate, endDate);
        return Result.success(statistics);
    }

    /**
     * 获取业务类型统计
     */
    @GetMapping("/by-business")
    public Result<Map<String, Long>> getBusinessTypeStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Long> statistics = statisticsService.getBusinessTypeStatistics(startDate, endDate);
        return Result.success(statistics);
    }

    /**
     * 获取通知成功率
     */
    @GetMapping("/success-rate")
    public Result<Double> getNotificationSuccessRate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Double successRate = statisticsService.getNotificationSuccessRate(startDate, endDate);
        return Result.success(successRate);
    }

    /**
     * 获取每日通知发送趋势
     */
    @GetMapping("/daily-trend")
    public Result<Map<String, Map<String, Long>>> getDailyNotificationTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Map<String, Long>> trend = statisticsService.getDailyNotificationTrend(startDate, endDate);
        return Result.success(trend);
    }

    /**
     * 获取失败通知统计
     */
    @GetMapping("/failed")
    public Result<Map<String, Object>> getFailedNotificationStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> statistics = statisticsService.getFailedNotificationStatistics(startDate, endDate);
        return Result.success(statistics);
    }

    /**
     * 获取模板使用统计
     */
    @GetMapping("/template-usage")
    public Result<Map<String, Long>> getTemplateUsageStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Long> statistics = statisticsService.getTemplateUsageStatistics(startDate, endDate);
        return Result.success(statistics);
    }

    /**
     * 获取通知发送性能统计
     */
    @GetMapping("/performance")
    public Result<Map<String, Object>> getPerformanceStatistics(
            @RequestParam String notificationType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> statistics = statisticsService.getPerformanceStatistics(notificationType, startDate, endDate);
        return Result.success(statistics);
    }
}