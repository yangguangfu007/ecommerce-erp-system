package com.erp.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.exception.BusinessException;
import com.erp.user.entity.Permission;
import com.erp.user.mapper.PermissionMapper;
import com.erp.user.mapper.RolePermissionMapper;
import com.erp.user.service.impl.PermissionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 权限服务测试类
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class PermissionServiceTest {

    @Mock
    private PermissionMapper permissionMapper;

    @Mock
    private RolePermissionMapper rolePermissionMapper;

    @InjectMocks
    private PermissionServiceImpl permissionService;

    private Permission testPermission;

    @BeforeEach
    void setUp() {
        testPermission = new Permission();
        testPermission.setId(1L);
        testPermission.setPermissionCode("user:view");
        testPermission.setPermissionName("查看用户");
        testPermission.setType(3);
        testPermission.setParentId(0L);
        testPermission.setStatus(1);
        testPermission.setSort(1);
    }

    @Test
    void testCreatePermissionSuccess() {
        // Given
        when(permissionMapper.selectByPermissionCode("user:create")).thenReturn(null);
        when(permissionMapper.insert(any(Permission.class))).thenReturn(1);

        Permission newPermission = new Permission();
        newPermission.setPermissionCode("user:create");
        newPermission.setPermissionName("创建用户");

        // When
        boolean result = permissionService.createPermission(newPermission);

        // Then
        assertTrue(result);
        verify(permissionMapper).insert(any(Permission.class));
    }

    @Test
    void testCreatePermissionFailure_CodeExists() {
        // Given
        when(permissionMapper.selectByPermissionCode("user:view")).thenReturn(testPermission);

        Permission newPermission = new Permission();
        newPermission.setPermissionCode("user:view");

        // When & Then
        assertThrows(BusinessException.class, () -> permissionService.createPermission(newPermission));
    }

    @Test
    void testUpdatePermissionSuccess() {
        // Given
        when(permissionMapper.selectById(1L)).thenReturn(testPermission);
        when(permissionMapper.updateById(any(Permission.class))).thenReturn(1);

        Permission updatePermission = new Permission();
        updatePermission.setId(1L);
        updatePermission.setPermissionName("更新后的权限名");

        // When
        boolean result = permissionService.updatePermission(updatePermission);

        // Then
        assertTrue(result);
        verify(permissionMapper).updateById(any(Permission.class));
    }

    @Test
    void testUpdatePermissionFailure_NotFound() {
        // Given
        when(permissionMapper.selectById(1L)).thenReturn(null);

        Permission updatePermission = new Permission();
        updatePermission.setId(1L);

        // When & Then
        assertThrows(BusinessException.class, () -> permissionService.updatePermission(updatePermission));
    }

    @Test
    void testDeletePermissionSuccess() {
        // Given
        when(permissionService.getPermissionsByParentId(1L)).thenReturn(Arrays.asList());
        when(rolePermissionMapper.selectRoleIdsByPermissionId(1L)).thenReturn(Arrays.asList());
        when(permissionMapper.deleteById(1L)).thenReturn(1);

        // When
        boolean result = permissionService.deletePermission(1L);

        // Then
        assertTrue(result);
        verify(permissionMapper).deleteById(1L);
    }

    @Test
    void testDeletePermissionFailure_HasChildren() {
        // Given
        Permission childPermission = new Permission();
        childPermission.setId(2L);
        when(permissionService.getPermissionsByParentId(1L)).thenReturn(Arrays.asList(childPermission));

        // When & Then
        assertThrows(BusinessException.class, () -> permissionService.deletePermission(1L));
    }

    @Test
    void testDeletePermissionFailure_UsedByRole() {
        // Given
        when(permissionService.getPermissionsByParentId(1L)).thenReturn(Arrays.asList());
        when(rolePermissionMapper.selectRoleIdsByPermissionId(1L)).thenReturn(Arrays.asList(1L));

        // When & Then
        assertThrows(BusinessException.class, () -> permissionService.deletePermission(1L));
    }

    @Test
    void testGetPermissionById() {
        // Given
        when(permissionMapper.selectById(1L)).thenReturn(testPermission);

        // When
        Permission result = permissionService.getPermissionById(1L);

        // Then
        assertNotNull(result);
        assertEquals("user:view", result.getPermissionCode());
    }

    @Test
    void testGetPermissionByCode() {
        // Given
        when(permissionMapper.selectByPermissionCode("user:view")).thenReturn(testPermission);

        // When
        Permission result = permissionService.getPermissionByCode("user:view");

        // Then
        assertNotNull(result);
        assertEquals("user:view", result.getPermissionCode());
    }

    @Test
    void testGetPermissionList() {
        // Given
        Page<Permission> permissionPage = new Page<>(1, 10);
        permissionPage.setRecords(Arrays.asList(testPermission));
        when(permissionMapper.selectPage(any(), any())).thenReturn(permissionPage);

        // When
        Page<Permission> result = permissionService.getPermissionList(1, 10, "用户", 3, 1);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getRecords().size());
    }

    @Test
    void testGetEnabledPermissions() {
        // Given
        when(permissionMapper.selectEnabledPermissions()).thenReturn(Arrays.asList(testPermission));

        // When
        List<Permission> result = permissionService.getEnabledPermissions();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("user:view", result.get(0).getPermissionCode());
    }

    @Test
    void testGetPermissionsByParentId() {
        // Given
        when(permissionMapper.selectByParentId(0L)).thenReturn(Arrays.asList(testPermission));

        // When
        List<Permission> result = permissionService.getPermissionsByParentId(0L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetPermissionTree() {
        // Given
        when(permissionMapper.selectEnabledPermissions()).thenReturn(Arrays.asList(testPermission));

        // When
        List<Permission> result = permissionService.getPermissionTree();

        // Then
        assertNotNull(result);
    }

    @Test
    void testExistsByPermissionCode() {
        // Given
        when(permissionMapper.selectByPermissionCode("user:view")).thenReturn(testPermission);

        // When
        boolean exists = permissionService.existsByPermissionCode("user:view");

        // Then
        assertTrue(exists);
    }

    @Test
    void testUpdatePermissionStatus() {
        // Given
        when(permissionMapper.updateById(any(Permission.class))).thenReturn(1);

        // When
        boolean result = permissionService.updatePermissionStatus(1L, 0);

        // Then
        assertTrue(result);
        verify(permissionMapper).updateById(any(Permission.class));
    }

    @Test
    void testGetPermissionsByRoleId() {
        // Given
        when(permissionMapper.selectPermissionsByRoleId(1L)).thenReturn(Arrays.asList(testPermission));

        // When
        List<Permission> result = permissionService.getPermissionsByRoleId(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetPermissionsByUserId() {
        // Given
        when(permissionMapper.selectPermissionsByUserId(1L)).thenReturn(Arrays.asList(testPermission));

        // When
        List<Permission> result = permissionService.getPermissionsByUserId(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }
}