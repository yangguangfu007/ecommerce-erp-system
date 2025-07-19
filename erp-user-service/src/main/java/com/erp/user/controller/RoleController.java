package com.erp.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.response.Result;
import com.erp.user.annotation.RequirePermission;
import com.erp.user.entity.Role;
import com.erp.user.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 角色控制器
 *
 * @author ERP System
 */
@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    /**
     * 创建角色
     */
    @PostMapping
    @RequirePermission("role:create")
    public Result<Void> createRole(@Valid @RequestBody Role role) {
        roleService.createRole(role);
        return Result.success();
    }

    /**
     * 更新角色
     */
    @PutMapping("/{roleId}")
    @RequirePermission("role:update")
    public Result<Void> updateRole(@PathVariable Long roleId, @Valid @RequestBody Role role) {
        role.setId(roleId);
        roleService.updateRole(role);
        return Result.success();
    }

    /**
     * 删除角色
     */
    @DeleteMapping("/{roleId}")
    @RequirePermission("role:delete")
    public Result<Void> deleteRole(@PathVariable Long roleId) {
        roleService.deleteRole(roleId);
        return Result.success();
    }

    /**
     * 获取角色详情
     */
    @GetMapping("/{roleId}")
    @RequirePermission("role:view")
    public Result<Role> getRoleById(@PathVariable Long roleId) {
        Role role = roleService.getRoleById(roleId);
        return Result.success(role);
    }

    /**
     * 分页查询角色列表
     */
    @GetMapping
    @RequirePermission("role:view")
    public Result<Page<Role>> getRoleList(@RequestParam(defaultValue = "1") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(required = false) String roleName,
                                        @RequestParam(required = false) Integer status) {
        Page<Role> rolePage = roleService.getRoleList(page, size, roleName, status);
        return Result.success(rolePage);
    }

    /**
     * 获取所有启用的角色
     */
    @GetMapping("/enabled")
    @RequirePermission("role:view")
    public Result<List<Role>> getEnabledRoles() {
        List<Role> roles = roleService.getEnabledRoles();
        return Result.success(roles);
    }

    /**
     * 分配角色权限
     */
    @PutMapping("/{roleId}/permissions")
    @RequirePermission("role:assign-permission")
    public Result<Void> assignRolePermissions(@PathVariable Long roleId, @RequestBody List<Long> permissionIds) {
        roleService.assignRolePermissions(roleId, permissionIds);
        return Result.success();
    }

    /**
     * 获取角色权限ID列表
     */
    @GetMapping("/{roleId}/permissions")
    @RequirePermission("role:view")
    public Result<List<Long>> getRolePermissionIds(@PathVariable Long roleId) {
        List<Long> permissionIds = roleService.getRolePermissionIds(roleId);
        return Result.success(permissionIds);
    }

    /**
     * 启用/禁用角色
     */
    @PutMapping("/{roleId}/status")
    @RequirePermission("role:update")
    public Result<Void> updateRoleStatus(@PathVariable Long roleId, @RequestParam Integer status) {
        roleService.updateRoleStatus(roleId, status);
        return Result.success();
    }

    /**
     * 检查角色编码是否存在
     */
    @GetMapping("/check-code")
    @RequirePermission("role:view")
    public Result<Boolean> checkRoleCode(@RequestParam String roleCode) {
        boolean exists = roleService.existsByRoleCode(roleCode);
        return Result.success(exists);
    }
}