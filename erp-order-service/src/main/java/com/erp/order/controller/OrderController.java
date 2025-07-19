package com.erp.order.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.response.Result;
import com.erp.order.dto.OrderDTO;
import com.erp.order.dto.OrderQueryDTO;
import com.erp.order.entity.Order;
import com.erp.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * 订单控制器
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Validated
@Tag(name = "订单管理", description = "订单相关接口")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "创建订单", description = "创建新的订单")
    public Result<Long> createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        log.info("创建订单请求: {}", orderDTO.getOrderId());
        Long orderId = orderService.createOrder(orderDTO);
        return Result.success(orderId);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新订单", description = "更新订单信息")
    public Result<Boolean> updateOrder(
            @Parameter(description = "订单ID") @PathVariable Long id,
            @Valid @RequestBody OrderDTO orderDTO) {
        log.info("更新订单请求: {}", id);
        orderDTO.setId(id);
        boolean result = orderService.updateOrder(orderDTO);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "查询订单详情", description = "根据订单ID查询订单详情")
    public Result<OrderDTO> getOrderById(
            @Parameter(description = "订单ID") @PathVariable Long id) {
        log.info("查询订单详情: {}", id);
        OrderDTO order = orderService.getOrderById(id);
        return Result.success(order);
    }

    @GetMapping("/order-no/{orderNo}")
    @Operation(summary = "根据订单编号查询", description = "根据订单编号查询订单详情")
    public Result<OrderDTO> getOrderByOrderNo(
            @Parameter(description = "订单编号") @PathVariable String orderNo) {
        log.info("根据订单编号查询: {}", orderNo);
        OrderDTO order = orderService.getOrderByOrderNo(orderNo);
        return Result.success(order);
    }

    @PostMapping("/page")
    @Operation(summary = "分页查询订单", description = "根据条件分页查询订单列表")
    public Result<IPage<OrderDTO>> getOrderPage(@Valid @RequestBody OrderQueryDTO query) {
        log.info("分页查询订单，页码: {}, 页大小: {}", query.getPageNum(), query.getPageSize());
        IPage<OrderDTO> page = orderService.getOrderPage(query);
        return Result.success(page);
    }

    @PostMapping("/list")
    @Operation(summary = "查询订单列表", description = "根据条件查询订单列表")
    public Result<List<OrderDTO>> getOrderList(@Valid @RequestBody OrderQueryDTO query) {
        log.info("查询订单列表");
        List<OrderDTO> orders = orderService.getOrderList(query);
        return Result.success(orders);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "更新订单状态", description = "更新订单状态")
    public Result<Boolean> updateOrderStatus(
            @Parameter(description = "订单ID") @PathVariable Long id,
            @Parameter(description = "新状态") @RequestParam String status,
            @Parameter(description = "变更原因") @RequestParam(required = false) String reason,
            @Parameter(description = "操作人") @RequestParam(required = false) String operator) {
        log.info("更新订单状态: {}, 新状态: {}", id, status);
        
        Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
        boolean result = orderService.updateOrderStatus(id, orderStatus, reason, operator);
        return Result.success(result);
    }

    @PutMapping("/batch/status")
    @Operation(summary = "批量更新订单状态", description = "批量更新订单状态")
    public Result<Integer> batchUpdateOrderStatus(
            @Parameter(description = "订单ID列表") @RequestParam List<Long> orderIds,
            @Parameter(description = "新状态") @RequestParam String status,
            @Parameter(description = "变更原因") @RequestParam(required = false) String reason,
            @Parameter(description = "操作人") @RequestParam(required = false) String operator) {
        log.info("批量更新订单状态，订单数量: {}, 新状态: {}", orderIds.size(), status);
        
        Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
        int result = orderService.batchUpdateOrderStatus(orderIds, orderStatus, reason, operator);
        return Result.success(result);
    }

    @PutMapping("/{id}/confirm")
    @Operation(summary = "确认订单", description = "确认订单")
    public Result<Boolean> confirmOrder(
            @Parameter(description = "订单ID") @PathVariable Long id,
            @Parameter(description = "操作人") @RequestParam(required = false) String operator) {
        log.info("确认订单: {}", id);
        boolean result = orderService.confirmOrder(id, operator);
        return Result.success(result);
    }

    @PutMapping("/{id}/ship")
    @Operation(summary = "订单发货", description = "订单发货")
    public Result<Boolean> shipOrder(
            @Parameter(description = "订单ID") @PathVariable Long id,
            @Parameter(description = "物流单号") @RequestParam String trackingNumber,
            @Parameter(description = "配送方式") @RequestParam(required = false) String shippingMethod,
            @Parameter(description = "操作人") @RequestParam(required = false) String operator) {
        log.info("订单发货: {}, 物流单号: {}", id, trackingNumber);
        boolean result = orderService.shipOrder(id, trackingNumber, shippingMethod, operator);
        return Result.success(result);
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "取消订单", description = "取消订单")
    public Result<Boolean> cancelOrder(
            @Parameter(description = "订单ID") @PathVariable Long id,
            @Parameter(description = "取消原因") @RequestParam(required = false) String reason,
            @Parameter(description = "操作人") @RequestParam(required = false) String operator) {
        log.info("取消订单: {}, 原因: {}", id, reason);
        boolean result = orderService.cancelOrder(id, reason, operator);
        return Result.success(result);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除订单", description = "删除订单")
    public Result<Boolean> deleteOrder(
            @Parameter(description = "订单ID") @PathVariable Long id) {
        log.info("删除订单: {}", id);
        boolean result = orderService.deleteOrder(id);
        return Result.success(result);
    }

    @PostMapping("/sync")
    @Operation(summary = "同步平台订单", description = "同步指定店铺的平台订单")
    public Result<Integer> syncPlatformOrders(
            @Parameter(description = "店铺ID") @RequestParam @NotNull Long storeId) {
        log.info("同步平台订单，店铺ID: {}", storeId);
        int result = orderService.syncPlatformOrders(storeId);
        return Result.success(result);
    }

    @GetMapping("/statistics/status")
    @Operation(summary = "订单状态统计", description = "统计订单数量按状态分组")
    public Result<List<OrderService.OrderStatusCount>> countOrdersByStatus(
            @Parameter(description = "店铺ID列表") @RequestParam(required = false) List<Long> storeIds) {
        log.info("订单状态统计，店铺数量: {}", storeIds != null ? storeIds.size() : 0);
        List<OrderService.OrderStatusCount> result = orderService.countOrdersByStatus(storeIds);
        return Result.success(result);
    }

    @PostMapping("/auto-cancel")
    @Operation(summary = "自动取消超时订单", description = "自动取消超时未确认的订单")
    public Result<Integer> autoCancelTimeoutOrders() {
        log.info("自动取消超时订单");
        int result = orderService.autoCancelTimeoutOrders();
        return Result.success(result);
    }
}