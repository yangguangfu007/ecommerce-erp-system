package com.erp.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.user.entity.Permission;

import java.util.List;

/**
 * 权限服务接口
 *
 * @author ERP System
 */
public interface PermissionService {

    /**
     * 创建权限
     *
     * @param permission 权限信息
     * @return 创建结果
     */
    boolean createPermission(Permission permission);

    /**
     * 更新权限
     *
     * @param permission 权限信息
     * @return 更新结果
     */
    boolean updatePermission(Permission permission);

    /**
     * 删除权限
     *
     * @param permissionId 权限ID
     * @return 删除结果
     */
    boolean deletePermission(Long permissionId);

    /**
     * 根据ID获取权限
     *
     * @param permissionId 权限ID
     * @return 权限信息
     */
    Permission getPermissionById(Long permissionId);

    /**
     * 根据权限编码获取权限
     *
     * @param permissionCode 权限编码
     * @return 权限信息
     */
    Permission getPermissionByCode(String permissionCode);

    /**
     * 分页查询权限列表
     *
     * @param page 页码
     * @param size 每页大小
     * @param permissionName 权限名称（可选）
     * @param type 权限类型（可选）
     * @param status 状态（可选）
     * @return 权限列表
     */
    Page<Permission> getPermissionList(int page, int size, String permissionName, Integer type, Integer status);

    /**
     * 获取所有启用的权限
     *
     * @return 权限列表
     */
    List<Permission> getEnabledPermissions();

    /**
     * 根据父权限ID获取子权限列表
     *
     * @param parentId 父权限ID
     * @return 权限列表
     */
    List<Permission> getPermissionsByParentId(Long parentId);

    /**
     * 获取权限树结构
     *
     * @return 权限树
     */
    List<Permission> getPermissionTree();

    /**
     * 检查权限编码是否存在
     *
     * @param permissionCode 权限编码
     * @return 是否存在
     */
    boolean existsByPermissionCode(String permissionCode);

    /**
     * 启用/禁用权限
     *
     * @param permissionId 权限ID
     * @param status 状态
     * @return 操作结果
     */
    boolean updatePermissionStatus(Long permissionId, Integer status);

    /**
     * 根据角色ID获取权限列表
     *
     * @param roleId 角色ID
     * @return 权限列表
     */
    List<Permission> getPermissionsByRoleId(Long roleId);

    /**
     * 根据用户ID获取权限列表
     *
     * @param userId 用户ID
     * @return 权限列表
     */
    List<Permission> getPermissionsByUserId(Long userId);
}