package com.erp.platform.controller;

import com.erp.common.response.Result;
import com.erp.platform.dto.PlatformStoreDTO;
import com.erp.platform.dto.StorePermissionDTO;
import com.erp.platform.service.PlatformService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
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
    
    @GetMapping("/stores/user/{userId}")
    @Operation(summary = "根据用户权限获取店铺列表")
    public Result<List<PlatformStoreDTO>> getStoresByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) String platformType,
            @RequestParam(required = false) String status) {
        List<PlatformStoreDTO> result = platformService.getStoresByUser(userId, platformType, status);
        return Result.success(result);
    }
    
    @PostMapping("/stores/{storeId}/validate-credentials")
    @Operation(summary = "验证店铺API凭证")
    public Result<Map<String, Object>> validateCredentials(@PathVariable Long storeId) {
        Map<String, Object> result = platformService.validateStoreCredentials(storeId);
        return Result.success(result);
    }
    
    // 店铺权限管理接口
    
    @PostMapping("/store-permissions")
    @Operation(summary = "分配店铺权限")
    public Result<StorePermissionDTO> assignStorePermission(@Valid @RequestBody StorePermissionDTO permissionDTO) {
        StorePermissionDTO result = platformService.assignStorePermission(permissionDTO);
        return Result.success(result);
    }
    
    @PutMapping("/store-permissions/{permissionId}")
    @Operation(summary = "更新店铺权限")
    public Result<StorePermissionDTO> updateStorePermission(@PathVariable Long permissionId,
                                                           @Valid @RequestBody StorePermissionDTO permissionDTO) {
        StorePermissionDTO result = platformService.updateStorePermission(permissionId, permissionDTO);
        return Result.success(result);
    }
    
    @DeleteMapping("/store-permissions/{permissionId}")
    @Operation(summary = "删除店铺权限")
    public Result<Void> removeStorePermission(@PathVariable Long permissionId) {
        platformService.removeStorePermission(permissionId);
        return Result.success();
    }
    
    @GetMapping("/users/{userId}/store-permissions")
    @Operation(summary = "获取用户的店铺权限列表")
    public Result<List<StorePermissionDTO>> getUserStorePermissions(@PathVariable Long userId) {
        List<StorePermissionDTO> result = platformService.getUserStorePermissions(userId);
        return Result.success(result);
    }
    
    @GetMapping("/stores/{storeId}/permissions")
    @Operation(summary = "获取店铺的权限列表")
    public Result<List<StorePermissionDTO>> getStorePermissions(@PathVariable Long storeId) {
        List<StorePermissionDTO> result = platformService.getStorePermissions(storeId);
        return Result.success(result);
    }
    
    @GetMapping("/users/{userId}/stores/{storeId}/permission/{permissionType}")
    @Operation(summary = "检查用户是否有店铺权限")
    public Result<Boolean> hasStorePermission(@PathVariable Long userId,
                                             @PathVariable Long storeId,
                                             @PathVariable String permissionType) {
        boolean result = platformService.hasStorePermission(userId, storeId, permissionType);
        return Result.success(result);
    }
    
    // 数据隔离管理接口
    
    @PostMapping("/stores/{storeId}/data-isolation")
    @Operation(summary = "配置店铺数据隔离")
    public Result<Void> configureDataIsolation(@PathVariable Long storeId,
                                              @RequestParam String dataType,
                                              @RequestParam String isolationLevel,
                                              @RequestBody(required = false) Map<String, Object> configParams) {
        platformService.configureDataIsolation(storeId, dataType, isolationLevel, configParams);
        return Result.success();
    }
    
    @GetMapping("/stores/{storeId}/data-isolation")
    @Operation(summary = "获取店铺数据隔离配置")
    public Result<Map<String, Object>> getDataIsolationConfig(@PathVariable Long storeId) {
        Map<String, Object> result = platformService.getDataIsolationConfig(storeId);
        return Result.success(result);
    }
    
    @GetMapping("/users/{userId}/stores/{storeId}/data-access")
    @Operation(summary = "检查数据访问权限")
    public Result<Boolean> checkDataAccess(@PathVariable Long userId,
                                          @PathVariable Long storeId,
                                          @RequestParam String dataType,
                                          @RequestParam String operation) {
        boolean result = platformService.checkDataAccess(userId, storeId, dataType, operation);
        return Result.success(result);
    }
    
    // 多店铺数据统一管理接口
    
    @PostMapping("/users/{userId}/cross-store-query")
    @Operation(summary = "跨店铺数据查询")
    public Result<Map<String, Object>> crossStoreDataQuery(@PathVariable Long userId,
                                                          @RequestParam String dataType,
                                                          @RequestBody(required = false) Map<String, Object> queryParams) {
        if (queryParams == null) {
            queryParams = new HashMap<>();
        }
        Map<String, Object> result = platformService.crossStoreDataQuery(userId, dataType, queryParams);
        return Result.success(result);
    }
    
    @PostMapping("/users/{userId}/store-operational-stats")
    @Operation(summary = "获取店铺运营数据统计")
    public Result<Map<String, Object>> getStoreOperationalStats(@PathVariable Long userId,
                                                               @RequestBody List<Long> storeIds,
                                                               @RequestParam(defaultValue = "LAST_30_DAYS") String dateRange) {
        Map<String, Object> result = platformService.getStoreOperationalStats(userId, storeIds, dateRange);
        return Result.success(result);
    }
    
    @PostMapping("/users/{userId}/multi-store-sync-check")
    @Operation(summary = "检查多店铺数据同步状态")
    public Result<Map<String, Object>> checkMultiStoreDataSync(@PathVariable Long userId,
                                                              @RequestBody List<Long> storeIds) {
        Map<String, Object> result = platformService.checkMultiStoreDataSync(userId, storeIds);
        return Result.success(result);
    }
    
    @PostMapping("/users/{userId}/store-data-consistency")
    @Operation(summary = "检查店铺数据一致性")
    public Result<Map<String, Object>> checkStoreDataConsistency(@PathVariable Long userId,
                                                                @RequestBody List<Long> storeIds,
                                                                @RequestParam String dataType) {
        Map<String, Object> result = platformService.checkStoreDataConsistency(userId, storeIds, dataType);
        return Result.success(result);
    }
    
    // 店铺批量操作接口
    
    @PostMapping("/users/{userId}/batch-product-management")
    @Operation(summary = "批量商品管理")
    public Result<Map<String, Object>> batchProductManagement(@PathVariable Long userId,
                                                             @RequestParam List<Long> storeIds,
                                                             @RequestParam String operation,
                                                             @RequestBody List<Map<String, Object>> productData) {
        Map<String, Object> result = platformService.batchProductManagement(userId, storeIds, operation, productData);
        return Result.success(result);
    }
    
    @PostMapping("/users/{userId}/batch-order-processing")
    @Operation(summary = "批量订单处理")
    public Result<Map<String, Object>> batchOrderProcessing(@PathVariable Long userId,
                                                           @RequestParam List<Long> storeIds,
                                                           @RequestParam String operation,
                                                           @RequestBody Map<String, Object> orderCriteria) {
        Map<String, Object> result = platformService.batchOrderProcessing(userId, storeIds, operation, orderCriteria);
        return Result.success(result);
    }
    
    @PostMapping("/users/{userId}/batch-store-config-update")
    @Operation(summary = "批量店铺配置更新")
    public Result<Map<String, Object>> batchStoreConfigUpdate(@PathVariable Long userId,
                                                             @RequestParam List<Long> storeIds,
                                                             @RequestBody Map<String, Object> configUpdates) {
        Map<String, Object> result = platformService.batchStoreConfigUpdate(userId, storeIds, configUpdates);
        return Result.success(result);
    }
    
    @PostMapping("/users/{userId}/batch-inventory-sync")
    @Operation(summary = "批量库存同步")
    public Result<Map<String, Object>> batchInventorySync(@PathVariable Long userId,
                                                         @RequestParam List<Long> storeIds,
                                                         @RequestBody List<Map<String, Object>> inventoryData) {
        Map<String, Object> result = platformService.batchInventorySync(userId, storeIds, inventoryData);
        return Result.success(result);
    }
}