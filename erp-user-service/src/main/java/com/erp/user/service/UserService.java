package com.erp.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.user.dto.*;
import com.erp.user.entity.User;

import java.util.List;

/**
 * 用户服务接口
 *
 * @author ERP System
 */
public interface UserService {

    /**
     * 用户登录
     *
     * @param loginRequest 登录请求
     * @return 登录结果
     */
    LoginResponse login(LoginRequest loginRequest);

    /**
     * 用户注册
     *
     * @param registerRequest 注册请求
     * @return 注册结果
     */
    boolean register(RegisterRequest registerRequest);

    /**
     * 修改密码
     *
     * @param userId 用户ID
     * @param changePasswordRequest 修改密码请求
     * @return 修改结果
     */
    boolean changePassword(Long userId, ChangePasswordRequest changePasswordRequest);

    /**
     * 根据用户名获取用户信息
     *
     * @param username 用户名
     * @return 用户信息
     */
    User getUserByUsername(String username);

    /**
     * 根据用户ID获取用户信息
     *
     * @param userId 用户ID
     * @return 用户信息
     */
    UserDTO getUserById(Long userId);

    /**
     * 创建用户
     *
     * @param user 用户信息
     * @return 创建结果
     */
    boolean createUser(User user);

    /**
     * 更新用户信息
     *
     * @param user 用户信息
     * @return 更新结果
     */
    boolean updateUser(User user);

    /**
     * 删除用户
     *
     * @param userId 用户ID
     * @return 删除结果
     */
    boolean deleteUser(Long userId);

    /**
     * 启用/禁用用户
     *
     * @param userId 用户ID
     * @param status 状态
     * @return 操作结果
     */
    boolean updateUserStatus(Long userId, Integer status);

    /**
     * 锁定用户
     *
     * @param userId 用户ID
     * @return 操作结果
     */
    boolean lockUser(Long userId);

    /**
     * 解锁用户
     *
     * @param userId 用户ID
     * @return 操作结果
     */
    boolean unlockUser(Long userId);

    /**
     * 分页查询用户列表
     *
     * @param page 页码
     * @param size 每页大小
     * @param username 用户名（可选）
     * @param realName 真实姓名（可选）
     * @param status 状态（可选）
     * @return 用户列表
     */
    Page<UserDTO> getUserList(int page, int size, String username, String realName, Integer status);

    /**
     * 分配用户角色
     *
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     * @return 分配结果
     */
    boolean assignUserRoles(Long userId, List<Long> roleIds);

    /**
     * 获取用户角色
     *
     * @param userId 用户ID
     * @return 角色列表
     */
    List<String> getUserRoles(Long userId);

    /**
     * 获取用户权限
     *
     * @param userId 用户ID
     * @return 权限列表
     */
    List<String> getUserPermissions(Long userId);

    /**
     * 更新用户登录信息
     *
     * @param userId 用户ID
     * @param loginIp 登录IP
     * @return 更新结果
     */
    boolean updateLoginInfo(Long userId, String loginIp);

    /**
     * 检查用户名是否存在
     *
     * @param username 用户名
     * @return 是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在
     *
     * @param email 邮箱
     * @return 是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 检查手机号是否存在
     *
     * @param phone 手机号
     * @return 是否存在
     */
    boolean existsByPhone(String phone);

    /**
     * 用户登出
     *
     * @param token JWT token
     * @return 登出结果
     */
    boolean logout(String token);

    /**
     * 刷新token
     *
     * @param refreshToken 刷新token
     * @return 新的登录响应
     */
    LoginResponse refreshToken(String refreshToken);

    /**
     * 根据token获取当前用户信息
     *
     * @param token JWT token
     * @return 用户信息
     */
    UserDTO getCurrentUser(String token);

    /**
     * 根据token修改密码
     *
     * @param token JWT token
     * @param changePasswordRequest 修改密码请求
     * @return 修改结果
     */
    boolean changePasswordByToken(String token, ChangePasswordRequest changePasswordRequest);

    /**
     * 发送密码重置邮件
     *
     * @param email 邮箱地址
     * @return 发送结果
     */
    boolean sendPasswordResetEmail(String email);

    /**
     * 重置密码
     *
     * @param resetToken 重置token
     * @param newPassword 新密码
     * @return 重置结果
     */
    boolean resetPassword(String resetToken, String newPassword);

    /**
     * 生成验证码
     *
     * @return 验证码响应
     */
    CaptchaResponse generateCaptcha();
}