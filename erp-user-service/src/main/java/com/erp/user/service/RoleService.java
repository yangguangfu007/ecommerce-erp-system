package com.erp.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.user.entity.Role;

import java.util.List;

/**
 * 角色服务接口
 *
 * @author ERP System
 */
public interface RoleService {

    /**
     * 创建角色
     *
     * @param role 角色信息
     * @return 创建结果
     */
    boolean createRole(Role role);

    /**
     * 更新角色
     *
     * @param role 角色信息
     * @return 更新结果
     */
    boolean updateRole(Role role);

    /**
     * 删除角色
     *
     * @param roleId 角色ID
     * @return 删除结果
     */
    boolean deleteRole(Long roleId);

    /**
     * 根据ID获取角色
     *
     * @param roleId 角色ID
     * @return 角色信息
     */
    Role getRoleById(Long roleId);

    /**
     * 根据角色编码获取角色
     *
     * @param roleCode 角色编码
     * @return 角色信息
     */
    Role getRoleByCode(String roleCode);

    /**
     * 分页查询角色列表
     *
     * @param page 页码
     * @param size 每页大小
     * @param roleName 角色名称（可选）
     * @param status 状态（可选）
     * @return 角色列表
     */
    Page<Role> getRoleList(int page, int size, String roleName, Integer status);

    /**
     * 获取所有启用的角色
     *
     * @return 角色列表
     */
    List<Role> getEnabledRoles();

    /**
     * 分配角色权限
     *
     * @param roleId 角色ID
     * @param permissionIds 权限ID列表
     * @return 分配结果
     */
    boolean assignRolePermissions(Long roleId, List<Long> permissionIds);

    /**
     * 获取角色权限ID列表
     *
     * @param roleId 角色ID
     * @return 权限ID列表
     */
    List<Long> getRolePermissionIds(Long roleId);

    /**
     * 检查角色编码是否存在
     *
     * @param roleCode 角色编码
     * @return 是否存在
     */
    boolean existsByRoleCode(String roleCode);

    /**
     * 启用/禁用角色
     *
     * @param roleId 角色ID
     * @param status 状态
     * @return 操作结果
     */
    boolean updateRoleStatus(Long roleId, Integer status);
}