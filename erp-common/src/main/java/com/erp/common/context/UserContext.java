package com.erp.common.context;

import lombok.extern.slf4j.Slf4j;

/**
 * 用户上下文工具类
 * 用于在整个请求生命周期中传递用户信息
 *
 * @author ERP System
 */
@Slf4j
public class UserContext {

    /**
     * 用户ID的ThreadLocal存储
     */
    private static final ThreadLocal<Long> USER_ID_HOLDER = new ThreadLocal<>();

    /**
     * 用户名的ThreadLocal存储
     */
    private static final ThreadLocal<String> USERNAME_HOLDER = new ThreadLocal<>();

    /**
     * 用户真实姓名的ThreadLocal存储
     */
    private static final ThreadLocal<String> REAL_NAME_HOLDER = new ThreadLocal<>();

    /**
     * 租户ID的ThreadLocal存储（多租户场景）
     */
    private static final ThreadLocal<Long> TENANT_ID_HOLDER = new ThreadLocal<>();

    /**
     * 设置当前用户ID
     *
     * @param userId 用户ID
     */
    public static void setCurrentUserId(Long userId) {
        USER_ID_HOLDER.set(userId);
        log.debug("设置当前用户ID：{}", userId);
    }

    /**
     * 获取当前用户ID
     *
     * @return 用户ID
     */
    public static Long getCurrentUserId() {
        return USER_ID_HOLDER.get();
    }

    /**
     * 设置当前用户名
     *
     * @param username 用户名
     */
    public static void setCurrentUsername(String username) {
        USERNAME_HOLDER.set(username);
        log.debug("设置当前用户名：{}", username);
    }

    /**
     * 获取当前用户名
     *
     * @return 用户名
     */
    public static String getCurrentUsername() {
        return USERNAME_HOLDER.get();
    }

    /**
     * 设置当前用户真实姓名
     *
     * @param realName 真实姓名
     */
    public static void setCurrentRealName(String realName) {
        REAL_NAME_HOLDER.set(realName);
        log.debug("设置当前用户真实姓名：{}", realName);
    }

    /**
     * 获取当前用户真实姓名
     *
     * @return 真实姓名
     */
    public static String getCurrentRealName() {
        return REAL_NAME_HOLDER.get();
    }

    /**
     * 设置当前租户ID（多租户场景）
     *
     * @param tenantId 租户ID
     */
    public static void setCurrentTenantId(Long tenantId) {
        TENANT_ID_HOLDER.set(tenantId);
        log.debug("设置当前租户ID：{}", tenantId);
    }

    /**
     * 获取当前租户ID（多租户场景）
     *
     * @return 租户ID
     */
    public static Long getCurrentTenantId() {
        return TENANT_ID_HOLDER.get();
    }

    /**
     * 设置用户上下文信息
     *
     * @param userId   用户ID
     * @param username 用户名
     * @param realName 真实姓名
     */
    public static void setUserContext(Long userId, String username, String realName) {
        setCurrentUserId(userId);
        setCurrentUsername(username);
        setCurrentRealName(realName);
        log.debug("设置用户上下文：userId={}, username={}, realName={}", userId, username, realName);
    }

    /**
     * 设置用户上下文信息（包含租户）
     *
     * @param userId   用户ID
     * @param username 用户名
     * @param realName 真实姓名
     * @param tenantId 租户ID
     */
    public static void setUserContext(Long userId, String username, String realName, Long tenantId) {
        setUserContext(userId, username, realName);
        setCurrentTenantId(tenantId);
        log.debug("设置用户上下文（含租户）：userId={}, username={}, realName={}, tenantId={}", 
                 userId, username, realName, tenantId);
    }

    /**
     * 清除当前线程的用户上下文
     */
    public static void clear() {
        USER_ID_HOLDER.remove();
        USERNAME_HOLDER.remove();
        REAL_NAME_HOLDER.remove();
        TENANT_ID_HOLDER.remove();
        log.debug("清除用户上下文");
    }

    /**
     * 获取当前用户上下文信息
     *
     * @return 用户上下文信息字符串
     */
    public static String getCurrentUserInfo() {
        return String.format("用户ID：%s，用户名：%s，真实姓名：%s，租户ID：%s",
                getCurrentUserId(), getCurrentUsername(), getCurrentRealName(), getCurrentTenantId());
    }

    /**
     * 检查是否已设置用户上下文
     *
     * @return true-已设置，false-未设置
     */
    public static boolean hasUserContext() {
        return getCurrentUserId() != null;
    }
}