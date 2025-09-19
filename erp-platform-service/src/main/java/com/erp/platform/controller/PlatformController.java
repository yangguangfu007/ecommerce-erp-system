package com.erp.platform.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.result.Result;
import com.erp.platform.dto.PlatformDTO;
import com.erp.platform.dto.PlatformQueryDTO;
import com.erp.platform.entity.Platform;
import com.erp.platform.service.PlatformService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 平台管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/platforms")
@RequiredArgsConstructor
@Tag(name = "平台管理", description = "平台管理相关接口")
public class PlatformController {

    private final PlatformService platformService;

    @GetMapping
    @Operation(summary = "分页查询平台列表")
    public Result<IPage<Platform>> getPlatformPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            PlatformQueryDTO queryDTO) {
        
        log.info("分页查询平台列表，页码：{}，大小：{}", page, size);
        
        Page<Platform> pageParam = new Page<>(page, size);
        IPage<Platform> result = platformService.getPlatformPage(pageParam, queryDTO);
        
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取平台详情")
    public Result<Platform> getPlatformById(@PathVariable Long id) {
        log.info("获取平台详情，ID：{}", id);
        
        Platform platform = platformService.getPlatformById(id);
        if (platform == null) {
            return Result.error("平台不存在");
        }
        
        return Result.success(platform);
    }

    @PostMapping
    @Operation(summary = "创建平台")
    public Result<Platform> createPlatform(@RequestBody PlatformDTO platformDTO) {
        log.info("创建平台，平台名称：{}", platformDTO.getPlatformName());
        
        Platform platform = platformService.createPlatform(platformDTO);
        return Result.success(platform);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新平台")
    public Result<Platform> updatePlatform(@PathVariable Long id, @RequestBody PlatformDTO platformDTO) {
        log.info("更新平台，ID：{}，平台名称：{}", id, platformDTO.getPlatformName());
        
        Platform platform = platformService.updatePlatform(id, platformDTO);
        return Result.success(platform);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除平台")
    public Result<Void> deletePlatform(@PathVariable Long id) {
        log.info("删除平台，ID：{}", id);
        
        boolean result = platformService.deletePlatform(id);
        return result ? Result.success() : Result.error("删除失败");
    }

    @PostMapping("/{id}/sync")
    @Operation(summary = "同步平台数据")
    public Result<Void> syncPlatform(@PathVariable Long id) {
        log.info("同步平台数据，ID：{}", id);
        
        boolean result = platformService.syncPlatform(id);
        return result ? Result.success() : Result.error("同步失败");
    }

    @GetMapping("/status")
    @Operation(summary = "获取平台状态监控")
    public Result<Object> getPlatformStatus() {
        log.info("获取平台状态监控信息");
        
        Object status = platformService.getPlatformStatus();
        return Result.success(status);
    }
}