package com.erp.user.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.user.dto.SystemLogQueryDTO;
import com.erp.user.entity.SystemLog;
import com.erp.user.service.SystemLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 系统日志控制器
 * 实现核心的系统日志查询接口
 * 
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/system/logs")
@Tag(name = "系统日志管理", description = "系统日志相关接口")
@Validated
public class SystemLogController {
    
    @Autowired
    private SystemLogService systemLogService;
    
    @GetMapping
    @Operation(summary = "系统日志查询接口", description = "返回PageResult<SystemLog>分页格式和时间范围筛选")
    public Result<PageResult<SystemLog>> getLogPage(
            @Parameter(description = "页码，默认1") @RequestParam(defaultValue = "1") Long page,
            @Parameter(description = "每页大小，默认10") @RequestParam(defaultValue = "10") Long size,
            @Parameter(description = "查询条件") SystemLogQueryDTO queryDTO) {
        
        log.info("查询系统日志，页码：{}，大小：{}，查询条件：{}", page, size, queryDTO);
        
        try {
            PageResult<SystemLog> result = systemLogService.getLogPage(page, size, queryDTO);
            return Result.success(result);
            
        } catch (Exception e) {
            log.error("查询系统日志失败", e);
            return Result.error("查询系统日志失败：" + e.getMessage());
        }
    }
}