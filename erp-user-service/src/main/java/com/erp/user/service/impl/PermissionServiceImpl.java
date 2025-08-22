package com.erp.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.exception.BusinessException;
import com.erp.user.entity.Permission;
import com.erp.user.mapper.PermissionMapper;
import com.erp.user.mapper.RolePermissionMapper;
import com.erp.user.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cn.hutool.core.util.StrUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 权限服务实现类
 *
 * @author ERP System
 */
@Service
public class PermissionServiceImpl implements PermissionService {

    @Autowired
    private PermissionMapper permissionMapper;

    @Autowired
    private RolePermissionMapper rolePermissionMapper;

    @Override
    @Transactional
    public boolean createPermission(Permission permission) {
        // 检查权限编码是否存在
        if (existsByPermissionCode(permission.getPermissionCode())) {
            throw new BusinessException("权限编码已存在");
        }

        // 设置默认值
        if (permission.getStatus() == null) {
            permission.setStatus(1);
        }
        if (permission.getSort() == null) {
            permission.setSort(0);
        }
        if (permission.getParentId() == null) {
            permission.setParentId(0L);
        }

        return permissionMapper.insert(permission) > 0;
    }

    @Override
    public boolean updatePermission(Permission permission) {
        Permission existingPermission = permissionMapper.selectById(permission.getId());
        if (existingPermission == null) {
            throw new BusinessException("权限不存在");
        }

        // 检查权限编码是否被其他权限使用
        if (StrUtil.isNotBlank(permission.getPermissionCode()) && 
            !permission.getPermissionCode().equals(existingPermission.getPermissionCode())) {
            if (existsByPermissionCode(permission.getPermissionCode())) {
                throw new BusinessException("权限编码已存在");
            }
        }

        return permissionMapper.updateById(permission) > 0;
    }

    @Override
    @Transactional
    public boolean deletePermission(Long permissionId) {
        // 检查是否有子权限
        List<Permission> children = getPermissionsByParentId(permissionId);
        if (!children.isEmpty()) {
            throw new BusinessException("该权限存在子权限，无法删除");
        }

        // 检查是否有角色使用该权限
        List<Long> roleIds = rolePermissionMapper.selectRoleIdsByPermissionId(permissionId);
        if (!roleIds.isEmpty()) {
            throw new BusinessException("该权限已被角色使用，无法删除");
        }

        // 删除权限
        return permissionMapper.deleteById(permissionId) > 0;
    }

    @Override
    public Permission getPermissionById(Long permissionId) {
        return permissionMapper.selectById(permissionId);
    }

    @Override
    public Permission getPermissionByCode(String permissionCode) {
        return permissionMapper.selectByPermissionCode(permissionCode);
    }

    @Override
    public Page<Permission> getPermissionList(int page, int size, String permissionName, Integer type, Integer status) {
        Page<Permission> permissionPage = new Page<>(page, size);
        LambdaQueryWrapper<Permission> queryWrapper = new LambdaQueryWrapper<>();
        
        if (StrUtil.isNotBlank(permissionName)) {
            queryWrapper.like(Permission::getPermissionName, permissionName);
        }
        if (type != null) {
            queryWrapper.eq(Permission::getType, type);
        }
        if (status != null) {
            queryWrapper.eq(Permission::getStatus, status);
        }
        
        queryWrapper.orderByAsc(Permission::getSort).orderByDesc(Permission::getCreateTime);
        
        return permissionMapper.selectPage(permissionPage, queryWrapper);
    }

    @Override
    public List<Permission> getEnabledPermissions() {
        return permissionMapper.selectEnabledPermissions();
    }

    @Override
    public List<Permission> getPermissionsByParentId(Long parentId) {
        return permissionMapper.selectByParentId(parentId);
    }

    @Override
    public List<Permission> getPermissionTree() {
        List<Permission> allPermissions = getEnabledPermissions();
        return buildPermissionTree(allPermissions, 0L);
    }

    @Override
    public boolean existsByPermissionCode(String permissionCode) {
        return permissionMapper.selectByPermissionCode(permissionCode) != null;
    }

    @Override
    public boolean updatePermissionStatus(Long permissionId, Integer status) {
        Permission permission = new Permission();
        permission.setId(permissionId);
        permission.setStatus(status);
        return permissionMapper.updateById(permission) > 0;
    }

    @Override
    public List<Permission> getPermissionsByRoleId(Long roleId) {
        return permissionMapper.selectPermissionsByRoleId(roleId);
    }

    @Override
    public List<Permission> getPermissionsByUserId(Long userId) {
        return permissionMapper.selectPermissionsByUserId(userId);
    }

    /**
     * 构建权限树
     */
    private List<Permission> buildPermissionTree(List<Permission> permissions, Long parentId) {
        List<Permission> tree = new ArrayList<>();
        
        for (Permission permission : permissions) {
            if (permission.getParentId() != null && permission.getParentId().equals(parentId)) {
                // 递归构建子权限树
                List<Permission> children = buildPermissionTree(permissions, permission.getId());
                permission.setChildren(children);
                tree.add(permission);
            }
        }
        
        return tree;
    }
}