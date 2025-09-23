package com.erp.logistics.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.logistics.dto.*;
import com.erp.logistics.entity.LogisticsOrder;
import com.erp.logistics.enums.LogisticsStatus;
import com.erp.logistics.service.LogisticsService;
// Swagger annotations removed for now
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * 物流管理控制器
 * 使用公共模块的Result进行响应封装
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/logistics")
// @Tag(name = "物流管理", description = "物流订单管理相关接口")
@Validated
public class LogisticsController {

    @Autowired
    private LogisticsService logisticsService;

    /**
     * 分页查询物流订单
     */
    @GetMapping("/orders")
    public Result<PageResult<LogisticsOrder>> getLogisticsOrderPage(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            LogisticsOrderQueryDTO queryDTO) {
        
        try {
            log.debug("分页查询物流订单，页码：{}，大小：{}", page, size);
            PageResult<LogisticsOrder> result = logisticsService.getLogisticsOrderPage(page, size, queryDTO);
            return Result.success(result);
        } catch (Exception e) {
            log.error("分页查询物流订单失败", e);
            return Result.error("查询物流订单失败：" + e.getMessage());
        }
    }

    /**
     * 根据ID查询物流订单
     */
    @GetMapping("/orders/{id}")
    public Result<LogisticsOrder> getLogisticsOrderById(
            @PathVariable @NotNull Long id) {
        
        try {
            log.debug("根据ID查询物流订单，ID：{}", id);
            LogisticsOrder order = logisticsService.getById(id);
            if (order == null) {
                return Result.error("物流订单不存在");
            }
            return Result.success(order);
        } catch (Exception e) {
            log.error("根据ID查询物流订单失败，ID：{}", id, e);
            return Result.error("查询物流订单失败：" + e.getMessage());
        }
    }

    /**
     * 根据业务订单ID查询物流订单
     */
    @GetMapping("/orders/business/{businessOrderId}")
    public Result<LogisticsOrder> getLogisticsOrderByBusinessOrderId(
            @PathVariable @NotNull Long businessOrderId) {
        
        try {
            log.debug("根据业务订单ID查询物流订单，业务订单ID：{}", businessOrderId);
            LogisticsOrder order = logisticsService.getLogisticsOrderByBusinessOrderId(businessOrderId);
            if (order == null) {
                return Result.error("未找到关联的物流订单");
            }
            return Result.success(order);
        } catch (Exception e) {
            log.error("根据业务订单ID查询物流订单失败，业务订单ID：{}", businessOrderId, e);
            return Result.error("查询物流订单失败：" + e.getMessage());
        }
    }

    /**
     * 根据运单号查询物流订单
     */
    @GetMapping("/orders/tracking/{trackingNumber}")
    public Result<LogisticsOrder> getLogisticsOrderByTrackingNumber(
            @PathVariable String trackingNumber) {
        
        try {
            log.debug("根据运单号查询物流订单，运单号：{}", trackingNumber);
            LogisticsOrder order = logisticsService.getLogisticsOrderByTrackingNumber(trackingNumber);
            if (order == null) {
                return Result.error("未找到对应的物流订单");
            }
            return Result.success(order);
        } catch (Exception e) {
            log.error("根据运单号查询物流订单失败，运单号：{}", trackingNumber, e);
            return Result.error("查询物流订单失败：" + e.getMessage());
        }
    }

    /**
     * 创建物流订单
     */
    @PostMapping("/orders")
    public Result<LogisticsOrder> createLogisticsOrder(
            @RequestBody @Valid LogisticsOrderDTO logisticsOrderDTO) {
        
        try {
            log.info("创建物流订单，业务订单ID：{}", logisticsOrderDTO.getBusinessOrderId());
            LogisticsOrder order = logisticsService.createLogisticsOrder(logisticsOrderDTO);
            return Result.success(order);
        } catch (Exception e) {
            log.error("创建物流订单失败", e);
            return Result.error("创建物流订单失败：" + e.getMessage());
        }
    }

    /**
     * 更新物流订单
     */
    @PutMapping("/orders/{id}")
    public Result<LogisticsOrder> updateLogisticsOrder(
            @PathVariable @NotNull Long id,
            @RequestBody @Valid LogisticsOrderDTO logisticsOrderDTO) {
        
        try {
            log.info("更新物流订单，ID：{}", id);
            LogisticsOrder order = logisticsService.updateLogisticsOrder(id, logisticsOrderDTO);
            return Result.success(order);
        } catch (Exception e) {
            log.error("更新物流订单失败，ID：{}", id, e);
            return Result.error("更新物流订单失败：" + e.getMessage());
        }
    }

    /**
     * 删除物流订单
     */
    @DeleteMapping("/orders/{id}")
    public Result<Void> deleteLogisticsOrder(
            @PathVariable @NotNull Long id) {
        
        try {
            log.info("删除物流订单，ID：{}", id);
            boolean success = logisticsService.removeById(id);
            if (success) {
                return Result.success();
            } else {
                return Result.error("删除物流订单失败");
            }
        } catch (Exception e) {
            log.error("删除物流订单失败，ID：{}", id, e);
            return Result.error("删除物流订单失败：" + e.getMessage());
        }
    }

    /**
     * 批量更新物流状态
     */
    @PutMapping("/orders/status/batch")
    public Result<Integer> batchUpdateStatus(
            @RequestParam List<String> trackingNumbers,
            @RequestParam LogisticsStatus status) {
        
        try {
            log.info("批量更新物流状态，运单数量：{}，新状态：{}", trackingNumbers.size(), status);
            int updateCount = logisticsService.batchUpdateStatus(trackingNumbers, status);
            return Result.success(updateCount);
        } catch (Exception e) {
            log.error("批量更新物流状态失败", e);
            return Result.error("批量更新物流状态失败：" + e.getMessage());
        }
    }

    /**
     * 获取物流状态统计
     */
    @GetMapping("/orders/statistics/status")
    public Result<java.util.Map<LogisticsStatus, Long>> getStatusStatistics() {
        
        try {
            log.debug("获取物流状态统计");
            java.util.Map<LogisticsStatus, Long> statistics = new java.util.HashMap<>();
            
            // 统计各种状态的订单数量
            for (LogisticsStatus status : LogisticsStatus.values()) {
                long count = logisticsService.countByField("status", status.getCode());
                statistics.put(status, count);
            }
            
            return Result.success(statistics);
        } catch (Exception e) {
            log.error("获取物流状态统计失败", e);
            return Result.error("获取统计信息失败：" + e.getMessage());
        }
    }

    /**
     * 获取物流服务商统计
     */
    @GetMapping("/orders/statistics/provider")
    public Result<java.util.Map<String, Long>> getProviderStatistics() {
        
        try {
            log.debug("获取物流服务商统计");
            
            // 这里简化处理，实际应该从数据库查询
            java.util.Map<String, Long> statistics = new java.util.HashMap<>();
            statistics.put("SF", logisticsService.countByField("provider_code", "SF"));
            statistics.put("ZTO", logisticsService.countByField("provider_code", "ZTO"));
            statistics.put("YTO", logisticsService.countByField("provider_code", "YTO"));
            statistics.put("STO", logisticsService.countByField("provider_code", "STO"));
            statistics.put("YD", logisticsService.countByField("provider_code", "YD"));
            
            return Result.success(statistics);
        } catch (Exception e) {
            log.error("获取物流服务商统计失败", e);
            return Result.error("获取统计信息失败：" + e.getMessage());
        }
    }

    /**
     * 批量生成面单
     * 使用BaseServicePlus的insertBatch()批量保存
     */
    @PostMapping("/labels")
    public Result<List<com.erp.logistics.entity.ShippingLabel>> batchGenerateLabels(
            @RequestBody @Valid List<com.erp.logistics.dto.ShippingLabelDTO> shippingLabelDTOs) {
        
        try {
            log.info("批量生成面单，数量：{}", shippingLabelDTOs.size());
            List<com.erp.logistics.entity.ShippingLabel> labels = logisticsService.batchGenerateLabels(shippingLabelDTOs);
            return Result.success(labels);
        } catch (Exception e) {
            log.error("批量生成面单失败", e);
            return Result.error("生成面单失败：" + e.getMessage());
        }
    }

    /**
     * 获取物流跟踪信息
     */
    @GetMapping("/tracking/{trackingNumber}")
    public Result<java.util.Map<String, Object>> getTrackingInfo(
            @PathVariable String trackingNumber) {
        
        try {
            log.debug("获取物流跟踪信息，运单号：{}", trackingNumber);
            java.util.Map<String, Object> trackingInfo = logisticsService.getTrackingInfo(trackingNumber);
            return Result.success(trackingInfo);
        } catch (Exception e) {
            log.error("获取物流跟踪信息失败，运单号：{}", trackingNumber, e);
            return Result.error("获取跟踪信息失败：" + e.getMessage());
        }
    }

    /**
     * 分页查询物流异常
     */
    @GetMapping("/exceptions")
    public Result<PageResult<com.erp.logistics.entity.LogisticsException>> getLogisticsExceptionPage(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            com.erp.logistics.dto.LogisticsExceptionQueryDTO queryDTO) {
        
        try {
            log.debug("分页查询物流异常，页码：{}，大小：{}", page, size);
            PageResult<com.erp.logistics.entity.LogisticsException> result = 
                logisticsService.getLogisticsExceptionPage(page, size, queryDTO);
            return Result.success(result);
        } catch (Exception e) {
            log.error("分页查询物流异常失败", e);
            return Result.error("查询物流异常失败：" + e.getMessage());
        }
    }

    /**
     * 创建物流异常
     */
    @PostMapping("/exceptions")
    public Result<com.erp.logistics.entity.LogisticsException> createLogisticsException(
            @RequestBody @Valid com.erp.logistics.dto.LogisticsExceptionDTO exceptionDTO) {
        
        try {
            log.info("创建物流异常，运单号：{}", exceptionDTO.getTrackingNumber());
            com.erp.logistics.entity.LogisticsException exception = 
                logisticsService.createLogisticsException(exceptionDTO);
            return Result.success(exception);
        } catch (Exception e) {
            log.error("创建物流异常失败", e);
            return Result.error("创建物流异常失败：" + e.getMessage());
        }
    }

    /**
     * 处理物流异常
     */
    @PutMapping("/exceptions/{exceptionId}/handle")
    public Result<com.erp.logistics.entity.LogisticsException> handleLogisticsException(
            @PathVariable @NotNull Long exceptionId,
            @RequestParam String solution,
            @RequestParam String handler) {
        
        try {
            log.info("处理物流异常，异常ID：{}，处理人：{}", exceptionId, handler);
            com.erp.logistics.entity.LogisticsException exception = 
                logisticsService.handleLogisticsException(exceptionId, solution, handler);
            return Result.success(exception);
        } catch (Exception e) {
            log.error("处理物流异常失败，异常ID：{}", exceptionId, e);
            return Result.error("处理物流异常失败：" + e.getMessage());
        }
    }
}