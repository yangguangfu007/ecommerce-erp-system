package com.erp.platform.controller;

import com.erp.common.response.Result;
import com.erp.platform.dto.PlatformStoreDTO;
import com.erp.platform.service.PlatformService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 平台对接控制器
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/platform")
@RequiredArgsConstructor
@Tag(name = "平台对接管理", description = "平台对接相关接口")
public class PlatformController {
    
    private final PlatformService platformService;
    
    @PostMapping("/stores")
    @Operation(summary = "创建平台店铺")
    public Result<PlatformStoreDTO> createStore(@Valid @RequestBody PlatformStoreDTO storeDTO) {
        PlatformStoreDTO result = platformService.createStore(storeDTO);
        return Result.success(result);
    }
    
    @PutMapping("/stores/{storeId}")
    @Operation(summary = "更新平台店铺")
    public Result<PlatformStoreDTO> updateStore(@PathVariable Long storeId, 
                                               @Valid @RequestBody PlatformStoreDTO storeDTO) {
        PlatformStoreDTO result = platformService.updateStore(storeId, storeDTO);
        return Result.success(result);
    }
    
    @DeleteMapping("/stores/{storeId}")
    @Operation(summary = "删除平台店铺")
    public Result<Void> deleteStore(@PathVariable Long storeId) {
        platformService.deleteStore(storeId);
        return Result.success();
    }
    
    @GetMapping("/stores/{storeId}")
    @Operation(summary = "获取店铺详情")
    public Result<PlatformStoreDTO> getStore(@PathVariable Long storeId) {
        PlatformStoreDTO result = platformService.getStore(storeId);
        return Result.success(result);
    }
    
    @GetMapping("/stores")
    @Operation(summary = "获取店铺列表")
    public Result<List<PlatformStoreDTO>> getStores(
            @RequestParam(required = false) String platformType,
            @RequestParam(required = false) String status) {
        List<PlatformStoreDTO> result = platformService.getStores(platformType, status);
        return Result.success(result);
    }
    
    @PostMapping("/stores/{storeId}/test-connection")
    @Operation(summary = "测试店铺连接")
    public Result<Boolean> testConnection(@PathVariable Long storeId) {
        boolean result = platformService.testStoreConnection(storeId);
        return Result.success(result);
    }
    
    @GetMapping("/stores/{storeId}/status")
    @Operation(summary = "获取店铺状态")
    public Result<Map<String, Object>> getStoreStatus(@PathVariable Long storeId) {
        Map<String, Object> result = platformService.getStoreStatus(storeId);
        return Result.success(result);
    }
    
    @PostMapping("/stores/{storeId}/orders/fetch")
    @Operation(summary = "拉取订单")
    public Result<List<Map<String, Object>>> fetchOrders(
            @PathVariable Long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        List<Map<String, Object>> result = platformService.fetchOrders(storeId, fromDate, toDate);
        return Result.success(result);
    }
    
    @PostMapping("/stores/{storeId}/products/upload")
    @Operation(summary = "上传商品")
    public Result<Boolean> uploadProduct(@PathVariable Long storeId, 
                                        @RequestBody Map<String, Object> productData) {
        boolean result = platformService.uploadProduct(storeId, productData);
        return Result.success(result);
    }
    
    @PostMapping("/stores/{storeId}/products/batch-upload")
    @Operation(summary = "批量上传商品")
    public Result<Map<String, Object>> batchUploadProducts(
            @PathVariable Long storeId, 
            @RequestBody List<Map<String, Object>> productsData) {
        Map<String, Object> result = platformService.batchUploadProducts(storeId, productsData);
        return Result.success(result);
    }
    
    @PostMapping("/stores/{storeId}/inventory/sync")
    @Operation(summary = "同步库存")
    public Result<Boolean> syncInventory(@PathVariable Long storeId,
                                        @RequestParam String sku,
                                        @RequestParam Integer quantity) {
        boolean result = platformService.syncInventory(storeId, sku, quantity);
        return Result.success(result);
    }
    
    @PostMapping("/stores/{storeId}/orders/{orderId}/status")
    @Operation(summary = "更新订单状态")
    public Result<Boolean> updateOrderStatus(@PathVariable Long storeId,
                                            @PathVariable String orderId,
                                            @RequestParam String status,
                                            @RequestParam(required = false) String trackingNumber) {
        boolean result = platformService.updateOrderStatus(storeId, orderId, status, trackingNumber);
        return Result.success(result);
    }
}