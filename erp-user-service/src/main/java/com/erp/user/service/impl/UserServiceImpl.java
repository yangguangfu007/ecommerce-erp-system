package com.erp.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.exception.BusinessException;
import com.erp.user.dto.*;
import com.erp.user.entity.User;
import com.erp.user.entity.UserRole;
import com.erp.user.mapper.UserMapper;
import com.erp.user.mapper.UserRoleMapper;
import com.erp.user.service.UserService;
import com.erp.user.util.JwtUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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

    private static final String LOGIN_ERROR_COUNT_KEY = "login:error:count:";
    private static final String USER_LOCK_KEY = "user:lock:";
    private static final int MAX_LOGIN_ERROR_COUNT = 5;
    private static final int LOCK_TIME_MINUTES = 30;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        // 检查用户是否被锁定
        if (isUserLocked(username)) {
            throw new BusinessException("账户已被锁定，请稍后再试");
        }

        // 查询用户
        User user = userMapper.selectByUsername(username);
        if (user == null) {
            incrementLoginErrorCount(username);
            throw new BusinessException("用户名或密码错误");
        }

        // 检查用户状态
        if (user.getStatus() == 0) {
            throw new BusinessException("账户已被禁用");
        }

        if (user.getLocked() == 1) {
            throw new BusinessException("账户已被锁定");
        }

        // 验证密码
        if (!passwordEncoder.matches(password, user.getPassword())) {
            incrementLoginErrorCount(username);
            throw new BusinessException("用户名或密码错误");
        }

        // 清除登录错误次数
        clearLoginErrorCount(username);

        // 更新登录信息
        updateLoginInfo(user.getId(), getClientIp());

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
        if (StringUtils.hasText(registerRequest.getPhone()) && existsByPhone(registerRequest.getPhone())) {
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
        if (StringUtils.hasText(user.getEmail()) && existsByEmail(user.getEmail())) {
            throw new BusinessException("邮箱已存在");
        }

        // 检查手机号是否存在
        if (StringUtils.hasText(user.getPhone()) && existsByPhone(user.getPhone())) {
            throw new BusinessException("手机号已存在");
        }

        // 加密密码
        if (StringUtils.hasText(user.getPassword())) {
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
        if (StringUtils.hasText(user.getUsername()) && !user.getUsername().equals(existingUser.getUsername())) {
            if (existsByUsername(user.getUsername())) {
                throw new BusinessException("用户名已存在");
            }
        }

        // 检查邮箱是否被其他用户使用
        if (StringUtils.hasText(user.getEmail()) && !user.getEmail().equals(existingUser.getEmail())) {
            if (existsByEmail(user.getEmail())) {
                throw new BusinessException("邮箱已存在");
            }
        }

        // 检查手机号是否被其他用户使用
        if (StringUtils.hasText(user.getPhone()) && !user.getPhone().equals(existingUser.getPhone())) {
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
        
        if (StringUtils.hasText(username)) {
            queryWrapper.like(User::getUsername, username);
        }
        if (StringUtils.hasText(realName)) {
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
}