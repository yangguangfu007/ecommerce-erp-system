package com.erp.logistics.controller;

import com.erp.common.result.Result;
import com.erp.logistics.dto.LogisticsStatusResponse;
import com.erp.logistics.service.LogisticsTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Map;

/**
 * 物流跟踪控制器
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/logistics/tracking")
@RequiredArgsConstructor
public class LogisticsTrackingController {

    private final LogisticsTrackingService logisticsTrackingService;

    /**
     * 查询物流状态
     */
    @GetMapping("/status/{trackingNumber}")
    public Result<LogisticsStatusResponse> queryStatus(@PathVariable @NotBlank String trackingNumber) {
        log.info("接收到查询物流状态请求，运单号: {}", trackingNumber);

        try {
            LogisticsStatusResponse response = logisticsTrackingService.queryStatus(trackingNumber);

            if (response.isSuccess()) {
                return Result.success(response);
            } else {
                return Result.error(500, response.getErrorMessage());
            }
        } catch (Exception e) {
            log.error("查询物流状态异常，运单号: {}", trackingNumber, e);
            return Result.error(500, "查询物流状态异常: " + e.getMessage());
        }
    }

    /**
     * 批量查询物流状态
     */
    @PostMapping("/status/batch")
    public Result<Map<String, LogisticsStatusResponse>> batchQueryStatus(
            @RequestBody @NotEmpty List<String> trackingNumbers) {
        log.info("接收到批量查询物流状态请求，数量: {}", trackingNumbers.size());

        try {
            Map<String, LogisticsStatusResponse> results = logisticsTrackingService.batchQueryStatus(trackingNumbers);
            return Result.success(results);
        } catch (Exception e) {
            log.error("批量查询物流状态异常", e);
            return Result.error(500, "批量查询物流状态异常: " + e.getMessage());
        }
    }

    /**
     * 同步物流状态到订单服务
     */
    @PostMapping("/sync/{trackingNumber}")
    public Result<Boolean> syncStatusToOrder(@PathVariable @NotBlank String trackingNumber) {
        log.info("接收到同步物流状态请求，运单号: {}", trackingNumber);

        try {
            boolean success = logisticsTrackingService.syncStatusToOrder(trackingNumber);

            if (success) {
                return Result.success(true);
            } else {
                return Result.error(500, "同步物流状态失败");
            }
        } catch (Exception e) {
            log.error("同步物流状态异常，运单号: {}", trackingNumber, e);
            return Result.error(500, "同步物流状态异常: " + e.getMessage());
        }
    }

    /**
     * 批量同步物流状态
     */
    @PostMapping("/sync/batch")
    public Result<Map<String, Boolean>> batchSyncStatus(
            @RequestBody @NotEmpty List<String> trackingNumbers) {
        log.info("接收到批量同步物流状态请求，数量: {}", trackingNumbers.size());

        try {
            Map<String, Boolean> results = logisticsTrackingService.batchSyncStatus(trackingNumbers);
            return Result.success(results);
        } catch (Exception e) {
            log.error("批量同步物流状态异常", e);
            return Result.error(500, "批量同步物流状态异常: " + e.getMessage());
        }
    }

    /**
     * 检测物流异常
     */
    @GetMapping("/abnormal/detect/{trackingNumber}")
    public Result<Boolean> detectAbnormal(@PathVariable @NotBlank String trackingNumber) {
        log.info("接收到检测物流异常请求，运单号: {}", trackingNumber);

        try {
            boolean isAbnormal = logisticsTrackingService.detectAbnormal(trackingNumber);
            return Result.success(isAbnormal);
        } catch (Exception e) {
            log.error("检测物流异常失败，运单号: {}", trackingNumber, e);
            return Result.error(500, "检测物流异常失败: " + e.getMessage());
        }
    }

    /**
     * 获取异常物流列表
     */
    @GetMapping("/abnormal/list")
    public Result<List<String>> getAbnormalTrackings() {
        log.info("接收到获取异常物流列表请求");

        try {
            List<String> abnormalTrackings = logisticsTrackingService.getAbnormalTrackings();
            return Result.success(abnormalTrackings);
        } catch (Exception e) {
            log.error("获取异常物流列表失败", e);
            return Result.error(500, "获取异常物流列表失败: " + e.getMessage());
        }
    }

    /**
     * 处理物流异常
     */
    @PostMapping("/abnormal/handle/{trackingNumber}")
    public Result<Boolean> handleAbnormal(
            @PathVariable @NotBlank String trackingNumber,
            @RequestParam @NotBlank String action) {
        log.info("接收到处理物流异常请求，运单号: {}, 动作: {}", trackingNumber, action);

        try {
            boolean success = logisticsTrackingService.handleAbnormal(trackingNumber, action);

            if (success) {
                return Result.success(true);
            } else {
                return Result.error(500, "处理物流异常失败");
            }
        } catch (Exception e) {
            log.error("处理物流异常失败，运单号: {}, 动作: {}", trackingNumber, action, e);
            return Result.error(500, "处理物流异常失败: " + e.getMessage());
        }
    }

    /**
     * 启动定时同步任务
     */
    @PostMapping("/sync/start")
    public Result<String> startScheduledSync() {
        log.info("接收到启动定时同步任务请求");

        try {
            logisticsTrackingService.startScheduledSync();
            return Result.success("定时同步任务已启动");
        } catch (Exception e) {
            log.error("启动定时同步任务失败", e);
            return Result.error(500, "启动定时同步任务失败: " + e.getMessage());
        }
    }

    /**
     * 停止定时同步任务
     */
    @PostMapping("/sync/stop")
    public Result<String> stopScheduledSync() {
        log.info("接收到停止定时同步任务请求");

        try {
            logisticsTrackingService.stopScheduledSync();
            return Result.success("定时同步任务已停止");
        } catch (Exception e) {
            log.error("停止定时同步任务失败", e);
            return Result.error(500, "停止定时同步任务失败: " + e.getMessage());
        }
    }
}