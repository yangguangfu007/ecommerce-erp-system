package com.erp.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.response.Result;
import com.erp.user.dto.*;
import com.erp.user.entity.User;
import com.erp.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;

/**
 * 用户控制器
 *
 * @author ERP System
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = userService.login(loginRequest);
        return Result.success(response);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterRequest registerRequest) {
        userService.register(registerRequest);
        return Result.success();
    }

    /**
     * 修改密码
     */
    @PutMapping("/{userId}/password")
    public Result<Void> changePassword(@PathVariable Long userId, 
                                     @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        userService.changePassword(userId, changePasswordRequest);
        return Result.success();
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/{userId}")
    public Result<UserDTO> getUserById(@PathVariable Long userId) {
        UserDTO userDTO = userService.getUserById(userId);
        return Result.success(userDTO);
    }

    /**
     * 创建用户
     */
    @PostMapping
    public Result<Void> createUser(@Valid @RequestBody User user) {
        userService.createUser(user);
        return Result.success();
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/{userId}")
    public Result<Void> updateUser(@PathVariable Long userId, @Valid @RequestBody User user) {
        user.setId(userId);
        userService.updateUser(user);
        return Result.success();
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{userId}")
    public Result<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return Result.success();
    }

    /**
     * 启用/禁用用户
     */
    @PutMapping("/{userId}/status")
    public Result<Void> updateUserStatus(@PathVariable Long userId, @RequestParam Integer status) {
        userService.updateUserStatus(userId, status);
        return Result.success();
    }

    /**
     * 锁定用户
     */
    @PutMapping("/{userId}/lock")
    public Result<Void> lockUser(@PathVariable Long userId) {
        userService.lockUser(userId);
        return Result.success();
    }

    /**
     * 解锁用户
     */
    @PutMapping("/{userId}/unlock")
    public Result<Void> unlockUser(@PathVariable Long userId) {
        userService.unlockUser(userId);
        return Result.success();
    }

    /**
     * 分页查询用户列表
     */
    @GetMapping
    public Result<PageResponse<UserDTO>> getUserList(@RequestParam(defaultValue = "1") int page,
                                                   @RequestParam(defaultValue = "10") int size,
                                                   @RequestParam(required = false) String username,
                                                   @RequestParam(required = false) String realName,
                                                   @RequestParam(required = false) Integer status) {
        Page<UserDTO> userPage = userService.getUserList(page, size, username, realName, status);
        
        // 转换为前端期望的数据结构
        PageResponse<UserDTO> response = new PageResponse<>();
        response.setList(userPage.getRecords());
        response.setTotal((int) userPage.getTotal());
        response.setPage((int) userPage.getCurrent());
        response.setSize((int) userPage.getSize());
        response.setPages((int) userPage.getPages());
        
        return Result.success(response);
    }

    /**
     * 分配用户角色
     */
    @PutMapping("/{userId}/roles")
    public Result<Void> assignUserRoles(@PathVariable Long userId, @RequestBody List<Long> roleIds) {
        userService.assignUserRoles(userId, roleIds);
        return Result.success();
    }

    /**
     * 获取用户角色
     */
    @GetMapping("/{userId}/roles")
    public Result<List<String>> getUserRoles(@PathVariable Long userId) {
        List<String> roles = userService.getUserRoles(userId);
        return Result.success(roles);
    }

    /**
     * 获取用户权限
     */
    @GetMapping("/{userId}/permissions")
    public Result<List<String>> getUserPermissions(@PathVariable Long userId) {
        List<String> permissions = userService.getUserPermissions(userId);
        return Result.success(permissions);
    }

    /**
     * 检查用户名是否存在
     */
    @GetMapping("/check-username")
    public Result<Boolean> checkUsername(@RequestParam String username) {
        boolean exists = userService.existsByUsername(username);
        return Result.success(exists);
    }

    /**
     * 检查邮箱是否存在
     */
    @GetMapping("/check-email")
    public Result<Boolean> checkEmail(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        return Result.success(exists);
    }

    /**
     * 检查手机号是否存在
     */
    @GetMapping("/check-phone")
    public Result<Boolean> checkPhone(@RequestParam String phone) {
        boolean exists = userService.existsByPhone(phone);
        return Result.success(exists);
    }

    /**
     * 获取用户关联的店铺列表
     */
    @GetMapping("/stores")
    public Result<List<StoreDTO>> getUserStores() {
        // 暂时返回空列表，实际应该从数据库查询用户关联的店铺
        List<StoreDTO> stores = new ArrayList<>();
        return Result.success(stores);
    }
}