package com.erp.user.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.user.dto.SystemConfigQueryDTO;
import com.erp.user.entity.SystemConfig;
import com.erp.user.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * 系统配置控制器
 * 实现核心的系统配置管理接口
 * 
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/system/config")
@Tag(name = "系统配置管理", description = "系统配置相关接口")
@Validated
public class SystemConfigController {
    
    @Autowired
    private SystemConfigService systemConfigService;
    
    @GetMapping
    @Operation(summary = "系统配置查询接口", description = "支持分类筛选的系统配置查询")
    public Result<PageResult<SystemConfig>> getConfigPage(
            @Parameter(description = "页码，默认1") @RequestParam(defaultValue = "1") Long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") Long size,
            @Parameter(description = "查询条件") SystemConfigQueryDTO queryDTO) {
        
        log.info("查询系统配置，页码：{}，大小：{}，查询条件：{}", page, size, queryDTO);
        
        try {
            PageResult<SystemConfig> result = systemConfigService.getConfigPage(page, size, queryDTO);
            return Result.success(result);
            
        } catch (Exception e) {
            log.error("查询系统配置失败", e);
            return Result.error("查询系统配置失败：" + e.getMessage());
        }
    }
    
    @PutMapping
    @Operation(summary = "系统配置更新接口", description = "使用BaseServicePlus的saveOrUpdateEnhanced()方法更新配置")
    public Result<SystemConfig> updateConfig(
            @Parameter(description = "配置信息") @RequestBody @Valid SystemConfig config) {
        
        log.info("更新系统配置，键名：{}", config.getConfigKey());
        
        try {
            SystemConfig updatedConfig = systemConfigService.updateConfig(config);
            return Result.success("配置更新成功", updatedConfig);
            
        } catch (Exception e) {
            log.error("更新系统配置失败", e);
            return Result.error("更新系统配置失败：" + e.getMessage());
        }
    }
}