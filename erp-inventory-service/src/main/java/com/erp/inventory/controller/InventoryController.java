package com.erp.inventory.controller;

import com.erp.common.response.Result;
import com.erp.inventory.dto.InventoryDTO;
import com.erp.inventory.dto.InventoryOperationDTO;
import com.erp.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/**
 * 库存管理控制器
 *
 * @author ERP System
 */
@Tag(name = "库存管理", description = "库存管理相关接口")
@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Validated
public class InventoryController {

    private final InventoryService inventoryService;

    @Operation(summary = "查询库存信息", description = "根据SKU和店铺ID查询库存信息")
    @GetMapping("/{sku}/{storeId}")
    public Result<InventoryDTO> getInventory(
            @Parameter(description = "SKU编码") @PathVariable @NotBlank String sku,
            @Parameter(description = "店铺ID") @PathVariable @NotNull Long storeId) {
        InventoryDTO inventory = inventoryService.getInventory(sku, storeId);
        return Result.success(inventory);
    }

    @Operation(summary = "根据SKU查询库存", description = "查询指定SKU在所有店铺的库存信息")
    @GetMapping("/sku/{sku}")
    public Result<List<InventoryDTO>> getInventoryBySku(
            @Parameter(description = "SKU编码") @PathVariable @NotBlank String sku) {
        List<InventoryDTO> inventories = inventoryService.getInventoryBySku(sku);
        return Result.success(inventories);
    }

    @Operation(summary = "分页查询库存列表", description = "根据条件分页查询库存列表")
    @GetMapping
    public Result<List<InventoryDTO>> getInventoryList(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "页大小") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "SKU编码") @RequestParam(required = false) String sku,
            @Parameter(description = "店铺ID") @RequestParam(required = false) Long storeId,
            @Parameter(description = "是否只显示低库存") @RequestParam(required = false) Boolean lowStock) {
        
        // 如果指定了店铺ID，返回该店铺的库存
        if (storeId != null) {
            List<InventoryDTO> inventories = inventoryService.getInventoryByStore(storeId);
            return Result.success(inventories);
        }
        
        // 如果指定了SKU，返回该SKU的库存
        if (sku != null) {
            List<InventoryDTO> inventories = inventoryService.getInventoryBySku(sku);
            return Result.success(inventories);
        }
        
        // 如果只显示低库存
        if (lowStock != null && lowStock) {
            List<InventoryDTO> inventories = inventoryService.getLowStockInventories();
            return Result.success(inventories);
        }
        
        // 默认返回所有库存
        List<InventoryDTO> inventories = inventoryService.getAllInventories();
        return Result.success(inventories);
    }

    @Operation(summary = "根据店铺查询库存", description = "查询指定店铺的所有库存信息")
    @GetMapping("/store/{storeId}")
    public Result<List<InventoryDTO>> getInventoryByStore(
            @Parameter(description = "店铺ID") @PathVariable @NotNull Long storeId) {
        List<InventoryDTO> inventories = inventoryService.getInventoryByStore(storeId);
        return Result.success(inventories);
    }

    @Operation(summary = "创建或更新库存", description = "创建新的库存记录或更新现有库存")
    @PostMapping
    public Result<InventoryDTO> saveOrUpdateInventory(@Valid @RequestBody InventoryDTO inventoryDTO) {
        InventoryDTO result = inventoryService.saveOrUpdateInventory(inventoryDTO);
        return Result.success(result);
    }

    @Operation(summary = "扣减库存", description = "扣减指定SKU的可用库存")
    @PostMapping("/deduct")
    public Result<Boolean> deductInventory(@Valid @RequestBody InventoryOperationDTO operationDTO) {
        boolean success = inventoryService.deductInventory(operationDTO);
        return Result.success(success);
    }

    @Operation(summary = "释放库存", description = "释放指定SKU的库存")
    @PostMapping("/release")
    public Result<Boolean> releaseInventory(@Valid @RequestBody InventoryOperationDTO operationDTO) {
        boolean success = inventoryService.releaseInventory(operationDTO);
        return Result.success(success);
    }

    @Operation(summary = "预留库存", description = "预留指定SKU的库存")
    @PostMapping("/reserve")
    public Result<Boolean> reserveInventory(@Valid @RequestBody InventoryOperationDTO operationDTO) {
        boolean success = inventoryService.reserveInventory(operationDTO);
        return Result.success(success);
    }

    @Operation(summary = "释放预留库存", description = "释放指定SKU的预留库存")
    @PostMapping("/release-reserved")
    public Result<Boolean> releaseReservedInventory(@Valid @RequestBody InventoryOperationDTO operationDTO) {
        boolean success = inventoryService.releaseReservedInventory(operationDTO);
        return Result.success(success);
    }

    @Operation(summary = "调整库存", description = "直接调整指定SKU的库存数量")
    @PostMapping("/adjust")
    public Result<Boolean> adjustInventory(@Valid @RequestBody InventoryOperationDTO operationDTO) {
        boolean success = inventoryService.adjustInventory(operationDTO);
        return Result.success(success);
    }

    @Operation(summary = "批量扣减库存", description = "批量扣减多个SKU的库存")
    @PostMapping("/batch-deduct")
    public Result<Boolean> batchDeductInventory(@Valid @RequestBody List<InventoryOperationDTO> operations) {
        boolean success = inventoryService.batchDeductInventory(operations);
        return Result.success(success);
    }

    @Operation(summary = "批量释放库存", description = "批量释放多个SKU的库存")
    @PostMapping("/batch-release")
    public Result<Boolean> batchReleaseInventory(@Valid @RequestBody List<InventoryOperationDTO> operations) {
        boolean success = inventoryService.batchReleaseInventory(operations);
        return Result.success(success);
    }

    @Operation(summary = "库存分配", description = "将指定SKU的库存分配到多个店铺")
    @PostMapping("/allocate/{sku}")
    public Result<Boolean> allocateInventory(
            @Parameter(description = "SKU编码") @PathVariable @NotBlank String sku,
            @RequestBody Map<Long, Integer> storeAllocations) {
        boolean success = inventoryService.allocateInventory(sku, storeAllocations);
        return Result.success(success);
    }

    @Operation(summary = "检查库存可用性", description = "检查指定SKU的库存是否充足")
    @GetMapping("/check/{sku}/{storeId}/{quantity}")
    public Result<Boolean> checkInventoryAvailable(
            @Parameter(description = "SKU编码") @PathVariable @NotBlank String sku,
            @Parameter(description = "店铺ID") @PathVariable @NotNull Long storeId,
            @Parameter(description = "需要数量") @PathVariable @NotNull Integer quantity) {
        boolean available = inventoryService.checkInventoryAvailable(sku, storeId, quantity);
        return Result.success(available);
    }

    @Operation(summary = "获取低库存预警", description = "获取需要预警的低库存商品列表")
    @GetMapping("/alerts")
    public Result<List<InventoryDTO>> getLowStockInventories() {
        List<InventoryDTO> inventories = inventoryService.getLowStockInventories();
        return Result.success(inventories);
    }

    @Operation(summary = "同步库存", description = "同步指定SKU的库存数据")
    @PostMapping("/sync/{sku}/{storeId}")
    public Result<Boolean> syncInventory(
            @Parameter(description = "SKU编码") @PathVariable @NotBlank String sku,
            @Parameter(description = "店铺ID") @PathVariable @NotNull Long storeId) {
        boolean success = inventoryService.syncInventory(sku, storeId);
        return Result.success(success);
    }
}