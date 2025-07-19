package com.erp.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.response.Result;
import com.erp.user.annotation.RequirePermission;
import com.erp.user.entity.Permission;
import com.erp.user.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 权限控制器
 *
 * @author ERP System
 */
@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;

    /**
     * 创建权限
     */
    @PostMapping
    @RequirePermission("permission:create")
    public Result<Void> createPermission(@Valid @RequestBody Permission permission) {
        permissionService.createPermission(permission);
        return Result.success();
    }

    /**
     * 更新权限
     */
    @PutMapping("/{permissionId}")
    @RequirePermission("permission:update")
    public Result<Void> updatePermission(@PathVariable Long permissionId, @Valid @RequestBody Permission permission) {
        permission.setId(permissionId);
        permissionService.updatePermission(permission);
        return Result.success();
    }

    /**
     * 删除权限
     */
    @DeleteMapping("/{permissionId}")
    @RequirePermission("permission:delete")
    public Result<Void> deletePermission(@PathVariable Long permissionId) {
        permissionService.deletePermission(permissionId);
        return Result.success();
    }

    /**
     * 获取权限详情
     */
    @GetMapping("/{permissionId}")
    @RequirePermission("permission:view")
    public Result<Permission> getPermissionById(@PathVariable Long permissionId) {
        Permission permission = permissionService.getPermissionById(permissionId);
        return Result.success(permission);
    }

    /**
     * 分页查询权限列表
     */
    @GetMapping
    @RequirePermission("permission:view")
    public Result<Page<Permission>> getPermissionList(@RequestParam(defaultValue = "1") int page,
                                                    @RequestParam(defaultValue = "10") int size,
                                                    @RequestParam(required = false) String permissionName,
                                                    @RequestParam(required = false) Integer type,
                                                    @RequestParam(required = false) Integer status) {
        Page<Permission> permissionPage = permissionService.getPermissionList(page, size, permissionName, type, status);
        return Result.success(permissionPage);
    }

    /**
     * 获取所有启用的权限
     */
    @GetMapping("/enabled")
    @RequirePermission("permission:view")
    public Result<List<Permission>> getEnabledPermissions() {
        List<Permission> permissions = permissionService.getEnabledPermissions();
        return Result.success(permissions);
    }

    /**
     * 获取权限树结构
     */
    @GetMapping("/tree")
    @RequirePermission("permission:view")
    public Result<List<Permission>> getPermissionTree() {
        List<Permission> permissionTree = permissionService.getPermissionTree();
        return Result.success(permissionTree);
    }

    /**
     * 根据父权限ID获取子权限列表
     */
    @GetMapping("/children/{parentId}")
    @RequirePermission("permission:view")
    public Result<List<Permission>> getPermissionsByParentId(@PathVariable Long parentId) {
        List<Permission> permissions = permissionService.getPermissionsByParentId(parentId);
        return Result.success(permissions);
    }

    /**
     * 启用/禁用权限
     */
    @PutMapping("/{permissionId}/status")
    @RequirePermission("permission:update")
    public Result<Void> updatePermissionStatus(@PathVariable Long permissionId, @RequestParam Integer status) {
        permissionService.updatePermissionStatus(permissionId, status);
        return Result.success();
    }

    /**
     * 检查权限编码是否存在
     */
    @GetMapping("/check-code")
    @RequirePermission("permission:view")
    public Result<Boolean> checkPermissionCode(@RequestParam String permissionCode) {
        boolean exists = permissionService.existsByPermissionCode(permissionCode);
        return Result.success(exists);
    }

    /**
     * 根据角色ID获取权限列表
     */
    @GetMapping("/by-role/{roleId}")
    @RequirePermission("permission:view")
    public Result<List<Permission>> getPermissionsByRoleId(@PathVariable Long roleId) {
        List<Permission> permissions = permissionService.getPermissionsByRoleId(roleId);
        return Result.success(permissions);
    }

    /**
     * 根据用户ID获取权限列表
     */
    @GetMapping("/by-user/{userId}")
    @RequirePermission("permission:view")
    public Result<List<Permission>> getPermissionsByUserId(@PathVariable Long userId) {
        List<Permission> permissions = permissionService.getPermissionsByUserId(userId);
        return Result.success(permissions);
    }
}