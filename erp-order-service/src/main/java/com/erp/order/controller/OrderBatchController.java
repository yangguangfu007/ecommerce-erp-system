package com.erp.order.controller;

import com.erp.common.response.Result;
import com.erp.order.dto.OrderQueryDTO;
import com.erp.order.entity.Order;
import com.erp.order.service.OrderBatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/**
 * 订单批量处理控制器
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/orders/batch")
@RequiredArgsConstructor
@Validated
@Tag(name = "订单批量处理", description = "订单批量操作相关接口")
public class OrderBatchController {

    private final OrderBatchService orderBatchService;

    @PostMapping("/confirm")
    @Operation(summary = "批量确认订单", description = "批量确认多个订单")
    public Result<OrderBatchService.BatchProcessResult> batchConfirmOrders(
            @Parameter(description = "订单ID列表") @RequestBody @NotEmpty List<Long> orderIds,
            @Parameter(description = "操作人") @RequestParam(required = false) String operator) {
        log.info("批量确认订单请求，数量: {}", orderIds.size());
        OrderBatchService.BatchProcessResult result = orderBatchService.batchConfirmOrders(orderIds, operator);
        return Result.success(result);
    }

    @PostMapping("/ship")
    @Operation(summary = "批量发货订单", description = "批量发货多个订单")
    public Result<OrderBatchService.BatchProcessResult> batchShipOrders(
            @Parameter(description = "订单发货信息映射") @RequestBody @NotNull Map<Long, OrderBatchService.ShippingInfo> orderShippingMap,
            @Parameter(description = "操作人") @RequestParam(required = false) String operator) {
        log.info("批量发货订单请求，数量: {}", orderShippingMap.size());
        OrderBatchService.BatchProcessResult result = orderBatchService.batchShipOrders(orderShippingMap, operator);
        return Result.success(result);
    }

    @PostMapping("/cancel")
    @Operation(summary = "批量取消订单", description = "批量取消多个订单")
    public Result<OrderBatchService.BatchProcessResult> batchCancelOrders(
            @Parameter(description = "订单ID列表") @RequestBody @NotEmpty List<Long> orderIds,
            @Parameter(description = "取消原因") @RequestParam(required = false) String reason,
            @Parameter(description = "操作人") @RequestParam(required = false) String operator) {
        log.info("批量取消订单请求，数量: {}", orderIds.size());
        OrderBatchService.BatchProcessResult result = orderBatchService.batchCancelOrders(orderIds, reason, operator);
        return Result.success(result);
    }

    @PostMapping("/update-status")
    @Operation(summary = "批量更新订单状态", description = "批量更新多个订单的状态")
    public Result<OrderBatchService.BatchProcessResult> batchUpdateOrderStatus(
            @Parameter(description = "订单ID列表") @RequestBody @NotEmpty List<Long> orderIds,
            @Parameter(description = "新状态") @RequestParam String status,
            @Parameter(description = "变更原因") @RequestParam(required = false) String reason,
            @Parameter(description = "操作人") @RequestParam(required = false) String operator) {
        log.info("批量更新订单状态请求，数量: {}, 新状态: {}", orderIds.size(), status);
        
        Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
        OrderBatchService.BatchProcessResult result = orderBatchService.batchUpdateOrderStatus(orderIds, orderStatus, reason, operator);
        return Result.success(result);
    }

    @PostMapping("/export")
    @Operation(summary = "批量导出订单", description = "根据查询条件批量导出订单数据")
    public Result<String> batchExportOrders(
            @Parameter(description = "查询条件") @RequestBody @Valid OrderQueryDTO query,
            @Parameter(description = "导出格式") @RequestParam(defaultValue = "EXCEL") OrderBatchService.ExportFormat exportFormat) {
        log.info("批量导出订单请求，格式: {}", exportFormat);
        String taskId = orderBatchService.batchExportOrders(query, exportFormat);
        return Result.success(taskId);
    }

    @PostMapping("/print")
    @Operation(summary = "批量打印订单", description = "批量打印多个订单")
    public Result<String> batchPrintOrders(
            @Parameter(description = "订单ID列表") @RequestBody @NotEmpty List<Long> orderIds,
            @Parameter(description = "打印模板") @RequestParam(defaultValue = "DEFAULT") String printTemplate) {
        log.info("批量打印订单请求，数量: {}", orderIds.size());
        String taskId = orderBatchService.batchPrintOrders(orderIds, printTemplate);
        return Result.success(taskId);
    }

    @GetMapping("/task/{taskId}/status")
    @Operation(summary = "查询批量任务状态", description = "查询批量处理任务的执行状态")
    public Result<OrderBatchService.BatchTaskStatus> getBatchTaskStatus(
            @Parameter(description = "任务ID") @PathVariable String taskId) {
        log.info("查询批量任务状态: {}", taskId);
        OrderBatchService.BatchTaskStatus status = orderBatchService.getBatchTaskStatus(taskId);
        return Result.success(status);
    }

    @DeleteMapping("/task/{taskId}")
    @Operation(summary = "取消批量任务", description = "取消正在执行的批量处理任务")
    public Result<Boolean> cancelBatchTask(
            @Parameter(description = "任务ID") @PathVariable String taskId) {
        log.info("取消批量任务: {}", taskId);
        boolean result = orderBatchService.cancelBatchTask(taskId);
        return Result.success(result);
    }
}