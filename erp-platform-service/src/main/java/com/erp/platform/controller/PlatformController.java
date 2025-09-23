package com.erp.platform.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.platform.dto.PlatformDTO;
import com.erp.platform.dto.PlatformQueryDTO;
import com.erp.platform.entity.Platform;
import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import com.erp.platform.service.PlatformService;
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
import java.util.Map;

/**
 * 平台管理控制器
 * 实现REST API接口，使用BaseServicePlus的增强方法
 * 统一使用Result和PageResult响应格式
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/platforms")
@RequiredArgsConstructor
@Validated
@Tag(name = "平台管理", description = "平台管理相关接口")
public class PlatformController {

    private final PlatformService platformService;

    /**
     * 分页查询平台列表
     * 使用PageResult统一分页响应格式
     */
    @GetMapping
    @Operation(summary = "分页查询平台列表", description = "支持按平台类型、状态、启用状态等条件筛选")
    public Result<PageResult<Platform>> getPlatformPage(
            @Parameter(description = "页码，从1开始") @RequestParam(defaultValue = "1") Long page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Long size,
            @Parameter(description = "查询条件") PlatformQueryDTO queryDTO) {
        
        log.info("分页查询平台列表，页码：{}，每页大小：{}", page, size);
        
        try {
            PageResult<Platform> result = platformService.getPlatformPage(page, size, queryDTO);
            return Result.success(result);
        } catch (Exception e) {
            log.error("分页查询平台列表失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 根据ID获取平台详情
     * 使用BaseServicePlus的getById方法
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取平台详情")
    public Result<Platform> getPlatformById(
            @Parameter(description = "平台ID") @PathVariable @NotNull Long id) {
        
        log.info("获取平台详情，ID：{}", id);
        
        try {
            Platform platform = platformService.getById(id);
            if (platform == null) {
                return Result.error("平台不存在");
            }
            return Result.success(platform);
        } catch (Exception e) {
            log.error("获取平台详情失败，ID：{}", id, e);
            return Result.error("获取失败：" + e.getMessage());
        }
    }

    /**
     * 创建平台
     * 使用BaseServicePlus的save方法，自动处理审计字段
     */
    @PostMapping
    @Operation(summary = "创建平台", description = "创建新的电商平台配置")
    public Result<Platform> createPlatform(
            @Parameter(description = "平台信息") @RequestBody @Valid PlatformDTO platformDTO) {
        
        log.info("创建平台，平台名称：{}", platformDTO.getPlatformName());
        
        try {
            Platform platform = platformService.createPlatform(platformDTO);
            return Result.success(platform);
        } catch (Exception e) {
            log.error("创建平台失败，平台名称：{}", platformDTO.getPlatformName(), e);
            return Result.error("创建失败：" + e.getMessage());
        }
    }

    /**
     * 更新平台
     * 使用BaseServicePlus的updateById方法，自动处理版本号
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新平台", description = "更新平台配置信息")
    public Result<Platform> updatePlatform(
            @Parameter(description = "平台ID") @PathVariable @NotNull Long id,
            @Parameter(description = "平台信息") @RequestBody @Valid PlatformDTO platformDTO) {
        
        log.info("更新平台，ID：{}，平台名称：{}", id, platformDTO.getPlatformName());
        
        try {
            Platform platform = platformService.updatePlatform(id, platformDTO);
            return Result.success(platform);
        } catch (Exception e) {
            log.error("更新平台失败，ID：{}", id, e);
            return Result.error("更新失败：" + e.getMessage());
        }
    }

    /**
     * 删除平台
     * 使用BaseServicePlus的removeById方法（逻辑删除）
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除平台", description = "逻辑删除平台（软删除）")
    public Result<Void> deletePlatform(
            @Parameter(description = "平台ID") @PathVariable @NotNull Long id) {
        
        log.info("删除平台，ID：{}", id);
        
        try {
            boolean result = platformService.removeById(id);
            return result ? Result.success() : Result.error("删除失败");
        } catch (Exception e) {
            log.error("删除平台失败，ID：{}", id, e);
            return Result.error("删除失败：" + e.getMessage());
        }
    }

    /**
     * 同步平台数据
     * 更新平台的最后同步时间
     */
    @PostMapping("/{id}/sync")
    @Operation(summary = "同步平台数据", description = "同步单个平台的数据")
    public Result<Void> syncPlatform(
            @Parameter(description = "平台ID") @PathVariable @NotNull Long id) {
        
        log.info("同步平台数据，ID：{}", id);
        
        try {
            boolean result = platformService.syncPlatform(id);
            return result ? Result.success() : Result.error("同步失败");
        } catch (Exception e) {
            log.error("同步平台数据失败，ID：{}", id, e);
            return Result.error("同步失败：" + e.getMessage());
        }
    }

    /**
     * 批量同步平台数据
     * 批量更新多个平台的同步状态
     */
    @PostMapping("/batch-sync")
    @Operation(summary = "批量同步平台数据", description = "批量同步多个平台的数据")
    public Result<Integer> batchSyncPlatforms(
            @Parameter(description = "平台ID列表") @RequestBody @Valid List<Long> platformIds) {
        
        log.info("批量同步平台数据，平台数量：{}", platformIds.size());
        
        try {
            int syncCount = platformService.batchSyncPlatforms(platformIds);
            return Result.success(syncCount);
        } catch (Exception e) {
            log.error("批量同步平台数据失败", e);
            return Result.error("批量同步失败：" + e.getMessage());
        }
    }

    /**
     * 获取平台状态统计
     * 使用BaseServicePlus的统计方法
     */
    @GetMapping("/status")
    @Operation(summary = "获取平台状态统计", description = "获取平台状态监控和统计信息")
    public Result<Map<String, Object>> getPlatformStatusStats() {
        log.info("获取平台状态统计信息");
        
        try {
            Map<String, Object> stats = platformService.getPlatformStatusStats();
            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取平台状态统计失败", e);
            return Result.error("获取统计信息失败：" + e.getMessage());
        }
    }

    /**
     * 根据平台类型获取平台列表
     */
    @GetMapping("/type/{type}")
    @Operation(summary = "根据类型获取平台列表", description = "获取指定类型的平台列表")
    public Result<List<Platform>> getPlatformsByType(
            @Parameter(description = "平台类型") @PathVariable PlatformType type) {
        
        log.info("根据类型获取平台列表，类型：{}", type);
        
        try {
            List<Platform> platforms = platformService.getPlatformsByType(type);
            return Result.success(platforms);
        } catch (Exception e) {
            log.error("根据类型获取平台列表失败，类型：{}", type, e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 根据状态获取平台列表
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "根据状态获取平台列表", description = "获取指定状态的平台列表")
    public Result<List<Platform>> getPlatformsByStatus(
            @Parameter(description = "平台状态") @PathVariable PlatformStatus status) {
        
        log.info("根据状态获取平台列表，状态：{}", status);
        
        try {
            List<Platform> platforms = platformService.getPlatformsByStatus(status);
            return Result.success(platforms);
        } catch (Exception e) {
            log.error("根据状态获取平台列表失败，状态：{}", status, e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 获取启用的平台列表
     */
    @GetMapping("/enabled")
    @Operation(summary = "获取启用的平台列表", description = "获取所有启用状态的平台")
    public Result<List<Platform>> getEnabledPlatforms() {
        log.info("获取启用的平台列表");
        
        try {
            List<Platform> platforms = platformService.getEnabledPlatforms();
            return Result.success(platforms);
        } catch (Exception e) {
            log.error("获取启用的平台列表失败", e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 批量更新平台状态
     */
    @PutMapping("/batch-status")
    @Operation(summary = "批量更新平台状态", description = "批量更新多个平台的状态")
    public Result<Integer> batchUpdateStatus(
            @Parameter(description = "平台ID列表") @RequestParam List<Long> platformIds,
            @Parameter(description = "目标状态") @RequestParam PlatformStatus status) {
        
        log.info("批量更新平台状态，平台数量：{}，目标状态：{}", platformIds.size(), status);
        
        try {
            int updateCount = platformService.batchUpdateStatus(platformIds, status);
            return Result.success(updateCount);
        } catch (Exception e) {
            log.error("批量更新平台状态失败", e);
            return Result.error("批量更新失败：" + e.getMessage());
        }
    }

    /**
     * 根据平台代码获取平台信息
     */
    @GetMapping("/code/{code}")
    @Operation(summary = "根据代码获取平台信息", description = "根据平台代码获取平台详细信息")
    public Result<Platform> getPlatformByCode(
            @Parameter(description = "平台代码") @PathVariable String code) {
        
        log.info("根据代码获取平台信息，代码：{}", code);
        
        try {
            Platform platform = platformService.getPlatformByCode(code);
            if (platform == null) {
                return Result.error("平台不存在");
            }
            return Result.success(platform);
        } catch (Exception e) {
            log.error("根据代码获取平台信息失败，代码：{}", code, e);
            return Result.error("查询失败：" + e.getMessage());
        }
    }

    /**
     * 检查平台代码是否存在
     */
    @GetMapping("/check-code")
    @Operation(summary = "检查平台代码是否存在", description = "检查平台代码的唯一性")
    public Result<Boolean> checkPlatformCode(
            @Parameter(description = "平台代码") @RequestParam String code,
            @Parameter(description = "排除的平台ID") @RequestParam(required = false) Long excludeId) {
        
        log.info("检查平台代码是否存在，代码：{}，排除ID：{}", code, excludeId);
        
        try {
            boolean exists = platformService.isPlatformCodeExists(code, excludeId);
            return Result.success(exists);
        } catch (Exception e) {
            log.error("检查平台代码失败，代码：{}", code, e);
            return Result.error("检查失败：" + e.getMessage());
        }
    }
}