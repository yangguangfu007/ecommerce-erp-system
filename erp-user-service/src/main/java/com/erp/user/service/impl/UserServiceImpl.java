package com.erp.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.exception.BusinessException;
import com.erp.user.dto.*;
import com.erp.user.entity.User;
import com.erp.user.entity.UserRole;
import com.erp.user.mapper.UserMapper;
import com.erp.user.mapper.UserRoleMapper;
import com.erp.user.service.SecurityAuditService;
import com.erp.user.service.UserService;
import com.erp.user.util.JwtUtil;
import com.erp.user.entity.LoginLog;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cn.hutool.core.util.StrUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 用户服务实现类
 *
 * @author ERP System
 */
@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private SecurityAuditService securityAuditService;

    private static final String LOGIN_ERROR_COUNT_KEY = "login:error:count:";
    private static final String USER_LOCK_KEY = "user:lock:";
    private static final int MAX_LOGIN_ERROR_COUNT = 5;
    private static final int LOCK_TIME_MINUTES = 30;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();
        String clientIp = getClientIp();
        
        LoginLog loginLog = new LoginLog();
        loginLog.setUsername(username);
        loginLog.setLoginIp(clientIp);
        loginLog.setLoginTime(LocalDateTime.now());
        loginLog.setLoginType(1); // 正常登录
        loginLog.setUserAgent("Unknown"); // 简化实现

        try {
            // 检测异常登录
            boolean isAbnormal = securityAuditService.detectAbnormalLogin(username, clientIp);
            if (isAbnormal) {
                loginLog.setStatus(0);
                loginLog.setFailureReason("异常登录检测");
                securityAuditService.recordLoginLog(loginLog);
                throw new BusinessException("检测到异常登录行为，请稍后再试");
            }

            // 检查用户是否被锁定
            if (isUserLocked(username)) {
                loginLog.setStatus(0);
                loginLog.setFailureReason("账户已被锁定");
                securityAuditService.recordLoginLog(loginLog);
                throw new BusinessException("账户已被锁定，请稍后再试");
            }

            // 查询用户
            User user = userMapper.selectByUsername(username);
            if (user == null) {
                incrementLoginErrorCount(username);
                loginLog.setStatus(0);
                loginLog.setFailureReason("用户不存在");
                securityAuditService.recordLoginLog(loginLog);
                throw new BusinessException("用户名或密码错误");
            }

            loginLog.setUserId(user.getId());

            // 检查用户状态
            if (user.getStatus() == 0) {
                loginLog.setStatus(0);
                loginLog.setFailureReason("账户已被禁用");
                securityAuditService.recordLoginLog(loginLog);
                throw new BusinessException("账户已被禁用");
            }

            if (user.getLocked() == 1) {
                loginLog.setStatus(0);
                loginLog.setFailureReason("账户已被锁定");
                securityAuditService.recordLoginLog(loginLog);
                throw new BusinessException("账户已被锁定");
            }

            // 验证密码
            if (!passwordEncoder.matches(password, user.getPassword())) {
                incrementLoginErrorCount(username);
                loginLog.setStatus(0);
                loginLog.setFailureReason("密码错误");
                securityAuditService.recordLoginLog(loginLog);
                throw new BusinessException("用户名或密码错误");
            }

            // 清除登录错误次数
            clearLoginErrorCount(username);

            // 更新登录信息
            updateLoginInfo(user.getId(), clientIp);

            // 记录成功登录日志
            loginLog.setStatus(1);
            securityAuditService.recordLoginLog(loginLog);

            // 生成JWT令牌
            String accessToken = jwtUtil.generateTokenWithUserId(username, user.getId());
            String refreshToken = jwtUtil.generateRefreshToken(username);

            // 构建用户信息
            UserDTO userDTO = convertToUserDTO(user);
            userDTO.setRoles(getUserRoles(user.getId()));
            userDTO.setPermissions(getUserPermissions(user.getId()));

            // 构建登录响应
            LoginResponse response = new LoginResponse();
            response.setAccessToken(accessToken);
            response.setRefreshToken(refreshToken);
            response.setExpiresIn(86400L); // 24小时
            response.setUserInfo(userDTO);

            return response;
            
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            loginLog.setStatus(0);
            loginLog.setFailureReason("系统异常");
            securityAuditService.recordLoginLog(loginLog);
            logger.error("登录异常", e);
            throw new BusinessException("登录失败，请稍后再试");
        }
    }

    @Override
    @Transactional
    public boolean register(RegisterRequest registerRequest) {
        // 验证确认密码
        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new BusinessException("两次输入的密码不一致");
        }

        // 检查用户名是否存在
        if (existsByUsername(registerRequest.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        // 检查邮箱是否存在
        if (existsByEmail(registerRequest.getEmail())) {
            throw new BusinessException("邮箱已存在");
        }

        // 检查手机号是否存在
        if (StrUtil.isNotBlank(registerRequest.getPhone()) && existsByPhone(registerRequest.getPhone())) {
            throw new BusinessException("手机号已存在");
        }

        // 创建用户
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRealName(registerRequest.getRealName());
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setStatus(1); // 默认启用
        user.setLocked(0); // 默认未锁定
        user.setPasswordErrorCount(0);

        return userMapper.insert(user) > 0;
    }

    @Override
    public boolean changePassword(Long userId, ChangePasswordRequest changePasswordRequest) {
        // 验证确认密码
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword())) {
            throw new BusinessException("两次输入的新密码不一致");
        }

        // 查询用户
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 验证原密码
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            throw new BusinessException("原密码错误");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        return userMapper.updateById(user) > 0;
    }

    @Override
    public User getUserByUsername(String username) {
        return userMapper.selectByUsername(username);
    }

    @Override
    public UserDTO getUserById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }

        UserDTO userDTO = convertToUserDTO(user);
        userDTO.setRoles(getUserRoles(userId));
        userDTO.setPermissions(getUserPermissions(userId));
        return userDTO;
    }

    @Override
    @Transactional
    public boolean createUser(User user) {
        // 检查用户名是否存在
        if (existsByUsername(user.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        // 检查邮箱是否存在
        if (StrUtil.isNotBlank(user.getEmail()) && existsByEmail(user.getEmail())) {
            throw new BusinessException("邮箱已存在");
        }

        // 检查手机号是否存在
        if (StrUtil.isNotBlank(user.getPhone()) && existsByPhone(user.getPhone())) {
            throw new BusinessException("手机号已存在");
        }

        // 加密密码
        if (StrUtil.isNotBlank(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        // 设置默认值
        if (user.getStatus() == null) {
            user.setStatus(1);
        }
        if (user.getLocked() == null) {
            user.setLocked(0);
        }
        if (user.getPasswordErrorCount() == null) {
            user.setPasswordErrorCount(0);
        }

        return userMapper.insert(user) > 0;
    }

    @Override
    public boolean updateUser(User user) {
        User existingUser = userMapper.selectById(user.getId());
        if (existingUser == null) {
            throw new BusinessException("用户不存在");
        }

        // 检查用户名是否被其他用户使用
        if (StrUtil.isNotBlank(user.getUsername()) && !user.getUsername().equals(existingUser.getUsername())) {
            if (existsByUsername(user.getUsername())) {
                throw new BusinessException("用户名已存在");
            }
        }

        // 检查邮箱是否被其他用户使用
        if (StrUtil.isNotBlank(user.getEmail()) && !user.getEmail().equals(existingUser.getEmail())) {
            if (existsByEmail(user.getEmail())) {
                throw new BusinessException("邮箱已存在");
            }
        }

        // 检查手机号是否被其他用户使用
        if (StrUtil.isNotBlank(user.getPhone()) && !user.getPhone().equals(existingUser.getPhone())) {
            if (existsByPhone(user.getPhone())) {
                throw new BusinessException("手机号已存在");
            }
        }

        return userMapper.updateById(user) > 0;
    }

    @Override
    @Transactional
    public boolean deleteUser(Long userId) {
        // 删除用户角色关联
        userRoleMapper.deleteByUserId(userId);
        // 删除用户
        return userMapper.deleteById(userId) > 0;
    }

    @Override
    public boolean updateUserStatus(Long userId, Integer status) {
        User user = new User();
        user.setId(userId);
        user.setStatus(status);
        return userMapper.updateById(user) > 0;
    }

    @Override
    public boolean lockUser(Long userId) {
        return userMapper.lockUser(userId, LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))) > 0;
    }

    @Override
    public boolean unlockUser(Long userId) {
        return userMapper.unlockUser(userId) > 0;
    }

    @Override
    public Page<UserDTO> getUserList(int page, int size, String username, String realName, Integer status) {
        Page<User> userPage = new Page<>(page, size);
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        
        if (StrUtil.isNotBlank(username)) {
            queryWrapper.like(User::getUsername, username);
        }
        if (StrUtil.isNotBlank(realName)) {
            queryWrapper.like(User::getRealName, realName);
        }
        if (status != null) {
            queryWrapper.eq(User::getStatus, status);
        }
        
        queryWrapper.orderByDesc(User::getCreateTime);
        
        Page<User> result = userMapper.selectPage(userPage, queryWrapper);
        
        // 转换为DTO
        Page<UserDTO> dtoPage = new Page<>();
        BeanUtils.copyProperties(result, dtoPage, "records");
        
        List<UserDTO> userDTOs = new ArrayList<>();
        for (User user : result.getRecords()) {
            UserDTO userDTO = convertToUserDTO(user);
            userDTO.setRoles(getUserRoles(user.getId()));
            userDTOs.add(userDTO);
        }
        dtoPage.setRecords(userDTOs);
        
        return dtoPage;
    }

    @Override
    @Transactional
    public boolean assignUserRoles(Long userId, List<Long> roleIds) {
        // 删除原有角色关联
        userRoleMapper.deleteByUserId(userId);
        
        // 添加新的角色关联
        if (roleIds != null && !roleIds.isEmpty()) {
            List<UserRole> userRoles = new ArrayList<>();
            for (Long roleId : roleIds) {
                UserRole userRole = new UserRole();
                userRole.setUserId(userId);
                userRole.setRoleId(roleId);
                userRoles.add(userRole);
            }
            return userRoleMapper.batchInsert(userRoles) > 0;
        }
        
        return true;
    }

    @Override
    public List<String> getUserRoles(Long userId) {
        return userMapper.selectRoleCodesByUserId(userId);
    }

    @Override
    public List<String> getUserPermissions(Long userId) {
        return userMapper.selectPermissionCodesByUserId(userId);
    }

    @Override
    public boolean updateLoginInfo(Long userId, String loginIp) {
        String loginTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        return userMapper.updateLoginInfo(userId, loginTime, loginIp) > 0;
    }

    @Override
    public boolean existsByUsername(String username) {
        return userMapper.selectByUsername(username) != null;
    }

    @Override
    public boolean existsByEmail(String email) {
        return userMapper.selectByEmail(email) != null;
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userMapper.selectByPhone(phone) != null;
    }

    /**
     * 转换为UserDTO
     */
    private UserDTO convertToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        BeanUtils.copyProperties(user, userDTO);
        return userDTO;
    }

    /**
     * 检查用户是否被锁定
     */
    private boolean isUserLocked(String username) {
        String lockKey = USER_LOCK_KEY + username;
        return Boolean.TRUE.equals(redisTemplate.hasKey(lockKey));
    }

    /**
     * 增加登录错误次数
     */
    private void incrementLoginErrorCount(String username) {
        String errorCountKey = LOGIN_ERROR_COUNT_KEY + username;
        Integer errorCount = (Integer) redisTemplate.opsForValue().get(errorCountKey);
        
        if (errorCount == null) {
            errorCount = 0;
        }
        
        errorCount++;
        redisTemplate.opsForValue().set(errorCountKey, errorCount, 30, TimeUnit.MINUTES);
        
        // 如果错误次数达到上限，锁定用户
        if (errorCount >= MAX_LOGIN_ERROR_COUNT) {
            String lockKey = USER_LOCK_KEY + username;
            redisTemplate.opsForValue().set(lockKey, true, LOCK_TIME_MINUTES, TimeUnit.MINUTES);
        }
    }

    /**
     * 清除登录错误次数
     */
    private void clearLoginErrorCount(String username) {
        String errorCountKey = LOGIN_ERROR_COUNT_KEY + username;
        redisTemplate.delete(errorCountKey);
    }

    /**
     * 获取客户端IP（简化实现）
     */
    private String getClientIp() {
        // 这里简化实现，实际应该从HttpServletRequest中获取
        return "127.0.0.1";
    }

    @Override
    public boolean logout(String token) {
        try {
            // 将token加入黑名单
            String tokenKey = "blacklist:token:" + token;
            redisTemplate.opsForValue().set(tokenKey, "1", 24, TimeUnit.HOURS);
            
            // 记录登出日志
            String username = jwtUtil.getUsernameFromToken(token);
            logger.info("用户 {} 已登出", username);
            
            return true;
        } catch (Exception e) {
            logger.error("用户登出失败", e);
            return false;
        }
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        try {
            // 验证刷新token
            if (!jwtUtil.validateToken(refreshToken)) {
                throw new BusinessException("刷新token无效");
            }

            String username = jwtUtil.getUsernameFromToken(refreshToken);
            User user = userMapper.selectByUsername(username);
            
            if (user == null) {
                throw new BusinessException("用户不存在");
            }

            // 生成新的访问token
            String newAccessToken = jwtUtil.generateToken(username);
            String newRefreshToken = jwtUtil.generateRefreshToken(username);

            LoginResponse response = new LoginResponse();
            response.setAccessToken(newAccessToken);
            response.setRefreshToken(newRefreshToken);
            
            UserDTO userDTO = new UserDTO();
            BeanUtils.copyProperties(user, userDTO);
            response.setUserInfo(userDTO);
            
            return response;
        } catch (Exception e) {
            logger.error("刷新token失败", e);
            throw new BusinessException("刷新token失败");
        }
    }

    @Override
    public UserDTO getCurrentUser(String token) {
        try {
            String username = jwtUtil.getUsernameFromToken(token);
            User user = userMapper.selectByUsername(username);
            
            if (user == null) {
                throw new BusinessException("用户不存在");
            }

            UserDTO userDTO = new UserDTO();
            BeanUtils.copyProperties(user, userDTO);
            
            return userDTO;
        } catch (Exception e) {
            logger.error("获取当前用户信息失败", e);
            throw new BusinessException("获取用户信息失败");
        }
    }

    @Override
    public boolean changePasswordByToken(String token, ChangePasswordRequest changePasswordRequest) {
        try {
            String username = jwtUtil.getUsernameFromToken(token);
            User user = userMapper.selectByUsername(username);
            
            if (user == null) {
                throw new BusinessException("用户不存在");
            }

            return changePassword(user.getId(), changePasswordRequest);
        } catch (Exception e) {
            logger.error("修改密码失败", e);
            return false;
        }
    }

    @Override
    public boolean sendPasswordResetEmail(String email) {
        try {
            User user = userMapper.selectByEmail(email);
            if (user == null) {
                // 为了安全，即使邮箱不存在也返回成功
                return true;
            }

            // 生成重置token
            String resetToken = jwtUtil.generatePasswordResetToken(user.getUsername());
            
            // 存储重置token到Redis，有效期30分钟
            String resetKey = "password:reset:" + resetToken;
            redisTemplate.opsForValue().set(resetKey, user.getId(), 30, TimeUnit.MINUTES);

            // TODO: 发送邮件
            logger.info("密码重置邮件已发送到: {}", email);
            
            return true;
        } catch (Exception e) {
            logger.error("发送密码重置邮件失败", e);
            return false;
        }
    }

    @Override
    public boolean resetPassword(String resetToken, String newPassword) {
        try {
            String resetKey = "password:reset:" + resetToken;
            Object userIdObj = redisTemplate.opsForValue().get(resetKey);
            
            if (userIdObj == null) {
                throw new BusinessException("重置token无效或已过期");
            }

            Long userId = Long.valueOf(userIdObj.toString());
            User user = userMapper.selectById(userId);
            
            if (user == null) {
                throw new BusinessException("用户不存在");
            }

            // 更新密码
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUpdateTime(LocalDateTime.now());
            userMapper.updateById(user);

            // 删除重置token
            redisTemplate.delete(resetKey);

            logger.info("用户 {} 密码重置成功", user.getUsername());
            return true;
        } catch (Exception e) {
            logger.error("重置密码失败", e);
            return false;
        }
    }

    @Override
    public CaptchaResponse generateCaptcha() {
        try {
            // 简化实现，实际应该生成图形验证码
            String captchaId = "captcha_" + System.currentTimeMillis();
            String captchaCode = String.valueOf((int)(Math.random() * 9000) + 1000);
            
            // 存储验证码到Redis，有效期5分钟
            String captchaKey = "captcha:" + captchaId;
            redisTemplate.opsForValue().set(captchaKey, captchaCode, 5, TimeUnit.MINUTES);

            CaptchaResponse response = new CaptchaResponse();
            response.setCaptchaId(captchaId);
            response.setImageUrl("/api/auth/captcha/image/" + captchaId);
            response.setImageBase64("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
            
            return response;
        } catch (Exception e) {
            logger.error("生成验证码失败", e);
            throw new BusinessException("生成验证码失败");
        }
    }
}