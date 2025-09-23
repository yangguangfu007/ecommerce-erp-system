package com.erp.user.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.user.dto.SystemStatusQueryDTO;
import com.erp.user.entity.SystemStatus;
import com.erp.user.service.SystemStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 系统状态控制器
 * 实现核心的系统状态监控接口
 * 
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/system/status")
@Tag(name = "系统状态管理", description = "系统状态相关接口")
@Validated
public class SystemStatusController {
    
    @Autowired
    private SystemStatusService systemStatusService;
    
    @GetMapping
    @Operation(summary = "系统状态监控接口", description = "使用BaseServicePlus的统计查询方法")
    public Result<PageResult<SystemStatus>> getStatusPage(
            @Parameter(description = "页码，默认1") @RequestParam(defaultValue = "1") Long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") Long size,
            @Parameter(description = "查询条件") SystemStatusQueryDTO queryDTO) {
        
        log.info("查询系统状态，页码：{}，大小：{}，查询条件：{}", queryDTO);
        
        try {
            PageResult<SystemStatus> result = systemStatusService.getStatusPage(page, size, queryDTO);
            return Result.success(result);
            
        } catch (Exception e) {
            log.error("查询系统状态失败", e);
            return Result.error("查询系统状态失败：" + e.getMessage());
        }
    }
}