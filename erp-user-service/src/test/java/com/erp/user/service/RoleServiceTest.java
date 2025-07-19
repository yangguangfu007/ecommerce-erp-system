package com.erp.user.service;

import com.erp.user.entity.Role;
import com.erp.user.mapper.RoleMapper;
import com.erp.user.mapper.RolePermissionMapper;
import com.erp.user.mapper.UserRoleMapper;
import com.erp.user.service.impl.RoleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * 角色服务测试类
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class RoleServiceTest {

    @Mock
    private RoleMapper roleMapper;

    @Mock
    private RolePermissionMapper rolePermissionMapper;

    @Mock
    private UserRoleMapper userRoleMapper;

    @InjectMocks
    private RoleServiceImpl roleService;

    private Role testRole;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setId(1L);
        testRole.setRoleCode("TEST_ROLE");
        testRole.setRoleName("测试角色");
        testRole.setDescription("测试角色描述");
        testRole.setStatus(1);
        testRole.setSort(1);
    }

    @Test
    void testCreateRoleSuccess() {
        // Given
        when(roleMapper.selectByRoleCode("TEST_ROLE")).thenReturn(null);
        when(roleMapper.insert(any(Role.class))).thenReturn(1);

        // When
        boolean result = roleService.createRole(testRole);

        // Then
        assertTrue(result);
        verify(roleMapper).insert(any(Role.class));
    }

    @Test
    void testUpdateRoleSuccess() {
        // Given
        when(roleMapper.selectById(1L)).thenReturn(testRole);
        when(roleMapper.updateById(any(Role.class))).thenReturn(1);

        // When
        boolean result = roleService.updateRole(testRole);

        // Then
        assertTrue(result);
        verify(roleMapper).updateById(any(Role.class));
    }

    @Test
    void testDeleteRoleSuccess() {
        // Given
        when(userRoleMapper.selectUserIdsByRoleId(1L)).thenReturn(Collections.emptyList());
        when(rolePermissionMapper.deleteByRoleId(1L)).thenReturn(1);
        when(roleMapper.deleteById(1L)).thenReturn(1);

        // When
        boolean result = roleService.deleteRole(1L);

        // Then
        assertTrue(result);
        verify(rolePermissionMapper).deleteByRoleId(1L);
        verify(roleMapper).deleteById(1L);
    }

    @Test
    void testGetRoleById() {
        // Given
        when(roleMapper.selectById(1L)).thenReturn(testRole);

        // When
        Role result = roleService.getRoleById(1L);

        // Then
        assertNotNull(result);
        assertEquals("TEST_ROLE", result.getRoleCode());
        assertEquals("测试角色", result.getRoleName());
    }

    @Test
    void testAssignRolePermissions() {
        // Given
        when(rolePermissionMapper.deleteByRoleId(1L)).thenReturn(1);
        when(rolePermissionMapper.batchInsert(any())).thenReturn(2);

        // When
        boolean result = roleService.assignRolePermissions(1L, Arrays.asList(1L, 2L));

        // Then
        assertTrue(result);
        verify(rolePermissionMapper).deleteByRoleId(1L);
        verify(rolePermissionMapper).batchInsert(any());
    }

    @Test
    void testExistsByRoleCode() {
        // Given
        when(roleMapper.selectByRoleCode("TEST_ROLE")).thenReturn(testRole);

        // When
        boolean exists = roleService.existsByRoleCode("TEST_ROLE");

        // Then
        assertTrue(exists);
    }

    @Test
    void testExistsByRoleCodeNotFound() {
        // Given
        when(roleMapper.selectByRoleCode("NONEXISTENT")).thenReturn(null);

        // When
        boolean exists = roleService.existsByRoleCode("NONEXISTENT");

        // Then
        assertFalse(exists);
    }
}