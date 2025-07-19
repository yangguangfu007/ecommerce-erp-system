package com.erp.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.exception.BusinessException;
import com.erp.user.entity.Role;
import com.erp.user.entity.RolePermission;
import com.erp.user.mapper.RoleMapper;
import com.erp.user.mapper.RolePermissionMapper;
import com.erp.user.mapper.UserRoleMapper;
import com.erp.user.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 角色服务实现类
 *
 * @author ERP System
 */
@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private RolePermissionMapper rolePermissionMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Override
    @Transactional
    public boolean createRole(Role role) {
        // 检查角色编码是否存在
        if (existsByRoleCode(role.getRoleCode())) {
            throw new BusinessException("角色编码已存在");
        }

        // 设置默认值
        if (role.getStatus() == null) {
            role.setStatus(1);
        }
        if (role.getSort() == null) {
            role.setSort(0);
        }

        return roleMapper.insert(role) > 0;
    }

    @Override
    public boolean updateRole(Role role) {
        Role existingRole = roleMapper.selectById(role.getId());
        if (existingRole == null) {
            throw new BusinessException("角色不存在");
        }

        // 检查角色编码是否被其他角色使用
        if (StringUtils.hasText(role.getRoleCode()) && !role.getRoleCode().equals(existingRole.getRoleCode())) {
            if (existsByRoleCode(role.getRoleCode())) {
                throw new BusinessException("角色编码已存在");
            }
        }

        return roleMapper.updateById(role) > 0;
    }

    @Override
    @Transactional
    public boolean deleteRole(Long roleId) {
        // 检查是否有用户使用该角色
        List<Long> userIds = userRoleMapper.selectUserIdsByRoleId(roleId);
        if (!userIds.isEmpty()) {
            throw new BusinessException("该角色已被用户使用，无法删除");
        }

        // 删除角色权限关联
        rolePermissionMapper.deleteByRoleId(roleId);
        
        // 删除角色
        return roleMapper.deleteById(roleId) > 0;
    }

    @Override
    public Role getRoleById(Long roleId) {
        return roleMapper.selectById(roleId);
    }

    @Override
    public Role getRoleByCode(String roleCode) {
        return roleMapper.selectByRoleCode(roleCode);
    }

    @Override
    public Page<Role> getRoleList(int page, int size, String roleName, Integer status) {
        Page<Role> rolePage = new Page<>(page, size);
        LambdaQueryWrapper<Role> queryWrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(roleName)) {
            queryWrapper.like(Role::getRoleName, roleName);
        }
        if (status != null) {
            queryWrapper.eq(Role::getStatus, status);
        }
        
        queryWrapper.orderByAsc(Role::getSort).orderByDesc(Role::getCreateTime);
        
        return roleMapper.selectPage(rolePage, queryWrapper);
    }

    @Override
    public List<Role> getEnabledRoles() {
        return roleMapper.selectEnabledRoles();
    }

    @Override
    @Transactional
    public boolean assignRolePermissions(Long roleId, List<Long> permissionIds) {
        // 删除原有权限关联
        rolePermissionMapper.deleteByRoleId(roleId);
        
        // 添加新的权限关联
        if (permissionIds != null && !permissionIds.isEmpty()) {
            List<RolePermission> rolePermissions = new ArrayList<>();
            for (Long permissionId : permissionIds) {
                RolePermission rolePermission = new RolePermission();
                rolePermission.setRoleId(roleId);
                rolePermission.setPermissionId(permissionId);
                rolePermissions.add(rolePermission);
            }
            return rolePermissionMapper.batchInsert(rolePermissions) > 0;
        }
        
        return true;
    }

    @Override
    public List<Long> getRolePermissionIds(Long roleId) {
        return rolePermissionMapper.selectPermissionIdsByRoleId(roleId);
    }

    @Override
    public boolean existsByRoleCode(String roleCode) {
        return roleMapper.selectByRoleCode(roleCode) != null;
    }

    @Override
    public boolean updateRoleStatus(Long roleId, Integer status) {
        Role role = new Role();
        role.setId(roleId);
        role.setStatus(status);
        return roleMapper.updateById(role) > 0;
    }
}