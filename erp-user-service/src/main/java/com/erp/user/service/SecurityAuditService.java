package com.erp.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.user.entity.AuditLog;
import com.erp.user.entity.LoginLog;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 安全审计服务接口
 *
 * @author ERP System
 */
public interface SecurityAuditService {

    /**
     * 记录登录日志
     *
     * @param loginLog 登录日志
     * @return 记录结果
     */
    boolean recordLoginLog(LoginLog loginLog);

    /**
     * 记录审计日志
     *
     * @param auditLog 审计日志
     * @return 记录结果
     */
    boolean recordAuditLog(AuditLog auditLog);

    /**
     * 检测异常登录
     *
     * @param username 用户名
     * @param loginIp 登录IP
     * @return 是否异常
     */
    boolean detectAbnormalLogin(String username, String loginIp);

    /**
     * 获取用户登录历史
     *
     * @param userId 用户ID
     * @param limit 限制条数
     * @return 登录历史
     */
    List<LoginLog> getUserLoginHistory(Long userId, Integer limit);

    /**
     * 分页查询登录日志
     *
     * @param page 页码
     * @param size 每页大小
     * @param username 用户名（可选）
     * @param loginIp 登录IP（可选）
     * @param status 状态（可选）
     * @param startTime 开始时间（可选）
     * @param endTime 结束时间（可选）
     * @return 登录日志列表
     */
    Page<LoginLog> getLoginLogList(int page, int size, String username, String loginIp, 
                                 Integer status, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 分页查询审计日志
     *
     * @param page 页码
     * @param size 每页大小
     * @param username 用户名（可选）
     * @param module 模块（可选）
     * @param operationType 操作类型（可选）
     * @param startTime 开始时间（可选）
     * @param endTime 结束时间（可选）
     * @return 审计日志列表
     */
    Page<AuditLog> getAuditLogList(int page, int size, String username, String module, 
                                 String operationType, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取异常登录记录
     *
     * @param hours 时间范围（小时）
     * @return 异常登录记录
     */
    List<LoginLog> getAbnormalLogins(Integer hours);

    /**
     * 清理过期日志
     *
     * @param days 保留天数
     * @return 清理结果
     */
    boolean cleanExpiredLogs(Integer days);

    /**
     * 统计登录数据
     *
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计数据
     */
    LoginStatistics getLoginStatistics(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 登录统计数据
     */
    class LoginStatistics {
        private long totalLogins;
        private long successLogins;
        private long failedLogins;
        private long uniqueUsers;
        private long uniqueIps;

        public long getTotalLogins() {
            return totalLogins;
        }

        public void setTotalLogins(long totalLogins) {
            this.totalLogins = totalLogins;
        }

        public long getSuccessLogins() {
            return successLogins;
        }

        public void setSuccessLogins(long successLogins) {
            this.successLogins = successLogins;
        }

        public long getFailedLogins() {
            return failedLogins;
        }

        public void setFailedLogins(long failedLogins) {
            this.failedLogins = failedLogins;
        }

        public long getUniqueUsers() {
            return uniqueUsers;
        }

        public void setUniqueUsers(long uniqueUsers) {
            this.uniqueUsers = uniqueUsers;
        }

        public long getUniqueIps() {
            return uniqueIps;
        }

        public void setUniqueIps(long uniqueIps) {
            this.uniqueIps = uniqueIps;
        }
    }
}