package com.erp.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.user.entity.AuditLog;
import com.erp.user.entity.LoginLog;
import com.erp.user.mapper.LoginLogMapper;
import com.erp.user.service.SecurityAuditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import cn.hutool.core.util.StrUtil;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 安全审计服务实现类
 *
 * @author ERP System
 */
@Service
public class SecurityAuditServiceImpl implements SecurityAuditService {

    private static final Logger logger = LoggerFactory.getLogger(SecurityAuditServiceImpl.class);

    @Autowired
    private LoginLogMapper loginLogMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String LOGIN_ATTEMPT_KEY = "login:attempt:";
    private static final String ABNORMAL_LOGIN_KEY = "abnormal:login:";
    private static final int MAX_LOGIN_ATTEMPTS_PER_HOUR = 10;
    private static final int ABNORMAL_LOGIN_THRESHOLD = 5;

    @Override
    public boolean recordLoginLog(LoginLog loginLog) {
        try {
            if (loginLog.getLoginTime() == null) {
                loginLog.setLoginTime(LocalDateTime.now());
            }
            return loginLogMapper.insert(loginLog) > 0;
        } catch (Exception e) {
            logger.error("记录登录日志失败", e);
            return false;
        }
    }

    @Override
    public boolean recordAuditLog(AuditLog auditLog) {
        try {
            if (auditLog.getOperationTime() == null) {
                auditLog.setOperationTime(LocalDateTime.now());
            }
            // 这里简化实现，实际应该有AuditLogMapper
            logger.info("审计日志: 用户[{}] 在模块[{}] 执行[{}]操作", 
                auditLog.getUsername(), auditLog.getModule(), auditLog.getOperationType());
            return true;
        } catch (Exception e) {
            logger.error("记录审计日志失败", e);
            return false;
        }
    }

    @Override
    public boolean detectAbnormalLogin(String username, String loginIp) {
        try {
            // 检查IP登录频率
            String ipKey = LOGIN_ATTEMPT_KEY + "ip:" + loginIp;
            Integer ipAttempts = (Integer) redisTemplate.opsForValue().get(ipKey);
            if (ipAttempts == null) {
                ipAttempts = 0;
            }

            // 检查用户登录频率
            String userKey = LOGIN_ATTEMPT_KEY + "user:" + username;
            Integer userAttempts = (Integer) redisTemplate.opsForValue().get(userKey);
            if (userAttempts == null) {
                userAttempts = 0;
            }

            // 判断是否异常（在增加计数之前检查）
            boolean isAbnormal = ipAttempts >= MAX_LOGIN_ATTEMPTS_PER_HOUR || 
                               userAttempts >= MAX_LOGIN_ATTEMPTS_PER_HOUR;

            // 增加计数
            redisTemplate.opsForValue().set(ipKey, ipAttempts + 1, 1, TimeUnit.HOURS);
            redisTemplate.opsForValue().set(userKey, userAttempts + 1, 1, TimeUnit.HOURS);

            if (isAbnormal) {
                // 记录异常登录
                String abnormalKey = ABNORMAL_LOGIN_KEY + username + ":" + loginIp;
                redisTemplate.opsForValue().set(abnormalKey, true, 24, TimeUnit.HOURS);
                
                logger.warn("检测到异常登录: 用户[{}], IP[{}], IP尝试次数[{}], 用户尝试次数[{}]", 
                    username, loginIp, ipAttempts, userAttempts);
            }

            return isAbnormal;
        } catch (Exception e) {
            logger.error("异常登录检测失败", e);
            // 如果检测失败，不阻止登录
            return false;
        }
    }

    @Override
    public List<LoginLog> getUserLoginHistory(Long userId, Integer limit) {
        return loginLogMapper.selectByUserId(userId, limit);
    }

    @Override
    public Page<LoginLog> getLoginLogList(int page, int size, String username, String loginIp, 
                                        Integer status, LocalDateTime startTime, LocalDateTime endTime) {
        Page<LoginLog> loginLogPage = new Page<>(page, size);
        LambdaQueryWrapper<LoginLog> queryWrapper = new LambdaQueryWrapper<>();
        
        if (StrUtil.isNotBlank(username)) {
            queryWrapper.like(LoginLog::getUsername, username);
        }
        if (StrUtil.isNotBlank(loginIp)) {
            queryWrapper.eq(LoginLog::getLoginIp, loginIp);
        }
        if (status != null) {
            queryWrapper.eq(LoginLog::getStatus, status);
        }
        if (startTime != null) {
            queryWrapper.ge(LoginLog::getLoginTime, startTime);
        }
        if (endTime != null) {
            queryWrapper.le(LoginLog::getLoginTime, endTime);
        }
        
        queryWrapper.orderByDesc(LoginLog::getLoginTime);
        
        return loginLogMapper.selectPage(loginLogPage, queryWrapper);
    }

    @Override
    public Page<AuditLog> getAuditLogList(int page, int size, String username, String module, 
                                        String operationType, LocalDateTime startTime, LocalDateTime endTime) {
        // 这里简化实现，实际应该有AuditLogMapper
        Page<AuditLog> auditLogPage = new Page<>(page, size);
        // 返回空页面
        return auditLogPage;
    }

    @Override
    public List<LoginLog> getAbnormalLogins(Integer hours) {
        return loginLogMapper.selectAbnormalLogins(hours);
    }

    @Override
    public boolean cleanExpiredLogs(Integer days) {
        try {
            LocalDateTime beforeTime = LocalDateTime.now().minusDays(days);
            int deletedCount = loginLogMapper.deleteExpiredLogs(beforeTime);
            logger.info("清理过期登录日志 {} 条", deletedCount);
            return true;
        } catch (Exception e) {
            logger.error("清理过期日志失败", e);
            return false;
        }
    }

    @Override
    public LoginStatistics getLoginStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        LoginStatistics statistics = new LoginStatistics();
        
        try {
            LambdaQueryWrapper<LoginLog> queryWrapper = new LambdaQueryWrapper<>();
            if (startTime != null) {
                queryWrapper.ge(LoginLog::getLoginTime, startTime);
            }
            if (endTime != null) {
                queryWrapper.le(LoginLog::getLoginTime, endTime);
            }
            
            // 总登录次数
            Long totalLogins = loginLogMapper.selectCount(queryWrapper);
            statistics.setTotalLogins(totalLogins);
            
            // 成功登录次数
            LambdaQueryWrapper<LoginLog> successWrapper = queryWrapper.clone();
            successWrapper.eq(LoginLog::getStatus, 1);
            Long successLogins = loginLogMapper.selectCount(successWrapper);
            statistics.setSuccessLogins(successLogins);
            
            // 失败登录次数
            statistics.setFailedLogins(totalLogins - successLogins);
            
            // 这里简化实现，实际应该统计唯一用户和IP数量
            statistics.setUniqueUsers(0L);
            statistics.setUniqueIps(0L);
            
        } catch (Exception e) {
            logger.error("获取登录统计数据失败", e);
        }
        
        return statistics;
    }
}