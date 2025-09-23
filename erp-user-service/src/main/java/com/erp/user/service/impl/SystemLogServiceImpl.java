package com.erp.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.exception.BusinessException;
import com.erp.common.response.PageResult;
import com.erp.common.service.BaseServicePlus;
import com.erp.common.service.impl.BaseServicePlusImpl;
import com.erp.common.util.PageUtils;
import com.erp.common.util.QueryWrapperUtils;
import com.erp.user.dto.SystemLogQueryDTO;
import com.erp.user.entity.SystemLog;
import com.erp.user.enums.LogLevel;
import com.erp.user.mapper.SystemLogMapper;
import com.erp.user.service.SystemLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 系统日志服务实现类
 * 继承ServiceImpl<SystemLogMapper, SystemLog>并实现BaseServicePlus接口
 * 
 * @author ERP System
 */
@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class SystemLogServiceImpl extends BaseServicePlusImpl<SystemLogMapper, SystemLog> 
    implements SystemLogService {
    
    @Override
    public PageResult<SystemLog> getLogPage(Long page, Long size, SystemLogQueryDTO queryDTO) {
        log.info("分页查询系统日志，页码：{}，大小：{}，查询条件：{}", page, size, queryDTO);
        
        // 创建分页对象
        Page<SystemLog> pageObj = PageUtils.createPage(page, size);
        
        // 构建查询条件
        LambdaQueryWrapper<SystemLog> wrapper = QueryWrapperUtils.lambdaQuery(SystemLog.class);
        QueryWrapperUtils.eqIfPresent(wrapper, SystemLog::getLogLevel, queryDTO.getLogLevel());
        QueryWrapperUtils.likeIfPresent(wrapper, SystemLog::getMessage, queryDTO.getMessage());
        QueryWrapperUtils.eqIfPresent(wrapper, SystemLog::getModuleName, queryDTO.getModuleName());
        QueryWrapperUtils.eqIfPresent(wrapper, SystemLog::getUserId, queryDTO.getUserId());
        QueryWrapperUtils.likeIfPresent(wrapper, SystemLog::getUsername, queryDTO.getUsername());
        QueryWrapperUtils.eqIfPresent(wrapper, SystemLog::getClientIp, queryDTO.getClientIp());
        QueryWrapperUtils.likeIfPresent(wrapper, SystemLog::getRequestUri, queryDTO.getRequestUri());
        QueryWrapperUtils.eqIfPresent(wrapper, SystemLog::getRequestMethod, queryDTO.getRequestMethod());
        QueryWrapperUtils.eqIfPresent(wrapper, SystemLog::getResponseStatus, queryDTO.getResponseStatus());
        
        // 时间范围查询
        QueryWrapperUtils.betweenTime(wrapper, SystemLog::getCreateTime, queryDTO.getStartTime(), queryDTO.getEndTime());
        
        // 执行时间范围查询
        QueryWrapperUtils.geIfPresent(wrapper, SystemLog::getExecutionTime, queryDTO.getMinExecutionTime());
        QueryWrapperUtils.leIfPresent(wrapper, SystemLog::getExecutionTime, queryDTO.getMaxExecutionTime());
        
        // 是否包含异常信息
        if (queryDTO.getHasException() != null && queryDTO.getHasException()) {
            wrapper.isNotNull(SystemLog::getExceptionMessage);
        }
        
        // 排序：按创建时间降序
        QueryWrapperUtils.orderByDesc(wrapper, SystemLog::getCreateTime);
        
        // 执行分页查询
        IPage<SystemLog> result = baseMapper.selectLogPage(pageObj, wrapper);
        
        log.info("查询完成，总记录数：{}，当前页记录数：{}", result.getTotal(), result.getRecords().size());
        return PageUtils.toPageResult(result);
    }
    
    @Override
    public List<SystemLog> getLogsByLevel(LogLevel logLevel, Integer limit) {
        log.info("根据日志级别查询日志列表：{}，限制数量：{}", logLevel, limit);
        
        if (logLevel == null) {
            throw new BusinessException("日志级别不能为空");
        }
        
        if (limit == null || limit <= 0) {
            limit = 100; // 默认限制100条
        }
        
        List<SystemLog> logs = baseMapper.selectByLogLevel(logLevel, limit);
        log.info("查询完成，级别 {} 的日志数量：{}", logLevel.getDescription(), logs.size());
        
        return logs;
    }
    
    @Override
    public List<SystemLog> getLogsByModule(String moduleName, Integer limit) {
        log.info("根据模块名称查询日志列表：{}，限制数量：{}", moduleName, limit);
        
        if (moduleName == null || moduleName.trim().isEmpty()) {
            throw new BusinessException("模块名称不能为空");
        }
        
        if (limit == null || limit <= 0) {
            limit = 100; // 默认限制100条
        }
        
        List<SystemLog> logs = baseMapper.selectByModuleName(moduleName, limit);
        log.info("查询完成，模块 {} 的日志数量：{}", moduleName, logs.size());
        
        return logs;
    }
    
    @Override
    public List<SystemLog> getLogsByUser(Long userId, Integer limit) {
        log.info("根据用户ID查询日志列表：{}，限制数量：{}", userId, limit);
        
        if (userId == null) {
            throw new BusinessException("用户ID不能为空");
        }
        
        if (limit == null || limit <= 0) {
            limit = 100; // 默认限制100条
        }
        
        List<SystemLog> logs = baseMapper.selectByUserId(userId, limit);
        log.info("查询完成，用户 {} 的日志数量：{}", userId, logs.size());
        
        return logs;
    }
    
    @Override
    public Long countLogsByTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        log.info("统计时间范围内的日志数量：{} - {}", startTime, endTime);
        
        if (startTime == null || endTime == null) {
            throw new BusinessException("开始时间和结束时间不能为空");
        }
        
        if (startTime.isAfter(endTime)) {
            throw new BusinessException("开始时间不能晚于结束时间");
        }
        
        Long count = baseMapper.countByTimeRange(startTime, endTime);
        log.info("时间范围内的日志数量：{}", count);
        
        return count;
    }
    
    @Override
    public Long countLogsByLevel(LogLevel logLevel) {
        log.info("根据日志级别统计数量：{}", logLevel);
        
        if (logLevel == null) {
            throw new BusinessException("日志级别不能为空");
        }
        
        Long count = baseMapper.countByLogLevel(logLevel);
        log.info("级别 {} 的日志数量：{}", logLevel.getDescription(), count);
        
        return count;
    }
    
    @Override
    public List<Map<String, Object>> getLogLevelStats() {
        log.info("获取日志级别统计");
        
        List<Map<String, Object>> stats = baseMapper.selectLogLevelStats();
        
        log.info("级别统计查询完成，共 {} 个级别", stats.size());
        return stats;
    }
    
    @Override
    public List<Map<String, Object>> getModuleStats() {
        log.info("获取模块统计");
        
        List<Map<String, Object>> stats = baseMapper.selectModuleStats();
        
        log.info("模块统计查询完成，共 {} 个模块", stats.size());
        return stats;
    }
    
    @Override
    public List<SystemLog> getRecentErrors(Integer limit) {
        log.info("获取最近的错误日志，限制数量：{}", limit);
        
        if (limit == null || limit <= 0) {
            limit = 50; // 默认限制50条
        }
        
        List<SystemLog> errors = baseMapper.selectRecentErrors(limit);
        log.info("查询完成，最近错误日志数量：{}", errors.size());
        
        return errors;
    }
    
    @Override
    public Long countExceptionsByTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        log.info("统计时间范围内的异常日志数量：{} - {}", startTime, endTime);
        
        if (startTime == null || endTime == null) {
            throw new BusinessException("开始时间和结束时间不能为空");
        }
        
        if (startTime.isAfter(endTime)) {
            throw new BusinessException("开始时间不能晚于结束时间");
        }
        
        Long count = baseMapper.countExceptionsByTimeRange(startTime, endTime);
        log.info("时间范围内的异常日志数量：{}", count);
        
        return count;
    }
    
    @Override
    public List<SystemLog> getSlowLogs(Long executionTimeThreshold, Integer limit) {
        log.info("查询慢查询日志，执行时间阈值：{}ms，限制数量：{}", executionTimeThreshold, limit);
        
        if (executionTimeThreshold == null || executionTimeThreshold <= 0) {
            executionTimeThreshold = 1000L; // 默认1秒
        }
        
        if (limit == null || limit <= 0) {
            limit = 100; // 默认限制100条
        }
        
        List<SystemLog> slowLogs = baseMapper.selectSlowLogs(executionTimeThreshold, limit);
        log.info("查询完成，慢查询日志数量：{}", slowLogs.size());
        
        return slowLogs;
    }
    
    @Override
    public int cleanupLogsBefore(LocalDateTime beforeTime) {
        log.info("清理指定时间之前的日志：{}", beforeTime);
        
        if (beforeTime == null) {
            throw new BusinessException("清理时间不能为空");
        }
        
        // 不允许清理最近7天的日志
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        if (beforeTime.isAfter(sevenDaysAgo)) {
            throw new BusinessException("不允许清理最近7天的日志");
        }
        
        int deleteCount = baseMapper.deleteLogsBefore(beforeTime);
        log.info("日志清理完成，删除记录数：{}", deleteCount);
        
        return deleteCount;
    }
    
    @Override
    public SystemLog recordLog(LogLevel logLevel, String message, String moduleName, 
                              Long userId, String username, String clientIp, 
                              String requestUri, String requestMethod, Map<String, Object> requestParams,
                              Integer responseStatus, Long executionTime, String exceptionMessage) {
        
        log.debug("记录系统日志：级别={}，消息={}，模块={}", logLevel, message, moduleName);
        
        try {
            SystemLog systemLog = new SystemLog();
            systemLog.setLogLevel(logLevel);
            systemLog.setMessage(message);
            systemLog.setModuleName(moduleName);
            systemLog.setUserId(userId);
            systemLog.setUsername(username);
            systemLog.setClientIp(clientIp);
            systemLog.setRequestUri(requestUri);
            systemLog.setRequestMethod(requestMethod);
            systemLog.setRequestParams(requestParams);
            systemLog.setResponseStatus(responseStatus);
            systemLog.setExecutionTime(executionTime);
            systemLog.setExceptionMessage(exceptionMessage);
            
            // 保存日志
            boolean success = save(systemLog);
            if (success) {
                log.debug("系统日志记录成功，ID：{}", systemLog.getId());
                return systemLog;
            } else {
                log.error("系统日志记录失败");
                return null;
            }
            
        } catch (Exception e) {
            log.error("记录系统日志时发生异常", e);
            return null;
        }
    }
    

}