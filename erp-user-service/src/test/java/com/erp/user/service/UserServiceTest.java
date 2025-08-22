package com.erp.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.erp.common.exception.BusinessException;
import com.erp.user.dto.*;
import com.erp.user.entity.User;
import com.erp.user.mapper.UserMapper;
import com.erp.user.mapper.UserRoleMapper;
import com.erp.user.service.impl.UserServiceImpl;
import com.erp.user.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 用户服务测试类
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserRoleMapper userRoleMapper;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private SecurityAuditService securityAuditService;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("$2a$10$encodedPassword");
        testUser.setRealName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPhone("13800138000");
        testUser.setStatus(1);
        testUser.setLocked(0);

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("newuser");
        registerRequest.setPassword("password123");
        registerRequest.setConfirmPassword("password123");
        registerRequest.setRealName("New User");
        registerRequest.setEmail("newuser@example.com");
        registerRequest.setPhone("13900139000");
    }

    @Test
    void testLoginSuccess() {
        // Given
        when(securityAuditService.detectAbnormalLogin(anyString(), anyString())).thenReturn(false);
        when(securityAuditService.recordLoginLog(any())).thenReturn(true);
        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        when(userMapper.selectByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("password123", "$2a$10$encodedPassword")).thenReturn(true);
        when(jwtUtil.generateTokenWithUserId(anyString(), any())).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(anyString())).thenReturn("refresh-token");
        when(userMapper.selectRoleCodesByUserId(1L)).thenReturn(java.util.Arrays.asList("USER"));
        when(userMapper.selectPermissionCodesByUserId(1L)).thenReturn(java.util.Arrays.asList("user:view"));
        when(userMapper.updateLoginInfo(anyLong(), anyString(), anyString())).thenReturn(1);

        // When
        LoginResponse response = userService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertNotNull(response.getUserInfo());
        assertEquals("testuser", response.getUserInfo().getUsername());
        verify(securityAuditService, times(1)).recordLoginLog(any());
    }

    @Test
    void testRegisterSuccess() {
        // Given
        when(userMapper.selectByUsername("newuser")).thenReturn(null);
        when(userMapper.selectByEmail("newuser@example.com")).thenReturn(null);
        when(userMapper.selectByPhone("13900139000")).thenReturn(null);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$encodedPassword");
        when(userMapper.insert(any(User.class))).thenReturn(1);

        // When
        boolean result = userService.register(registerRequest);

        // Then
        assertTrue(result);
        verify(userMapper).insert(any(User.class));
    }

    @Test
    void testGetUserByUsername() {
        // Given
        when(userMapper.selectByUsername("testuser")).thenReturn(testUser);

        // When
        User result = userService.getUserByUsername("testuser");

        // Then
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("Test User", result.getRealName());
    }

    @Test
    void testExistsByUsername() {
        // Given
        when(userMapper.selectByUsername("testuser")).thenReturn(testUser);

        // When
        boolean exists = userService.existsByUsername("testuser");

        // Then
        assertTrue(exists);
    }

    @Test
    void testExistsByUsernameNotFound() {
        // Given
        when(userMapper.selectByUsername("nonexistent")).thenReturn(null);

        // When
        boolean exists = userService.existsByUsername("nonexistent");

        // Then
        assertFalse(exists);
    }

    @Test
    void testLoginFailure_UserNotFound() {
        // Given
        when(securityAuditService.detectAbnormalLogin(anyString(), anyString())).thenReturn(false);
        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        when(userMapper.selectByUsername("testuser")).thenReturn(null);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.login(loginRequest));
        verify(securityAuditService, times(1)).recordLoginLog(any());
    }

    @Test
    void testLoginFailure_WrongPassword() {
        // Given
        when(securityAuditService.detectAbnormalLogin(anyString(), anyString())).thenReturn(false);
        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        when(userMapper.selectByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("password123", "$2a$10$encodedPassword")).thenReturn(false);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.login(loginRequest));
        verify(securityAuditService, times(1)).recordLoginLog(any());
    }

    @Test
    void testLoginFailure_UserDisabled() {
        // Given
        testUser.setStatus(0); // 禁用用户
        when(securityAuditService.detectAbnormalLogin(anyString(), anyString())).thenReturn(false);
        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        when(userMapper.selectByUsername("testuser")).thenReturn(testUser);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.login(loginRequest));
        verify(securityAuditService, times(1)).recordLoginLog(any());
    }

    @Test
    void testLoginFailure_UserLocked() {
        // Given
        testUser.setLocked(1); // 锁定用户
        when(securityAuditService.detectAbnormalLogin(anyString(), anyString())).thenReturn(false);
        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        when(userMapper.selectByUsername("testuser")).thenReturn(testUser);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.login(loginRequest));
        verify(securityAuditService, times(1)).recordLoginLog(any());
    }

    @Test
    void testRegisterFailure_PasswordMismatch() {
        // Given
        registerRequest.setConfirmPassword("different");

        // When & Then
        assertThrows(BusinessException.class, () -> userService.register(registerRequest));
    }

    @Test
    void testRegisterFailure_UsernameExists() {
        // Given
        when(userMapper.selectByUsername("newuser")).thenReturn(testUser);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.register(registerRequest));
    }

    @Test
    void testRegisterFailure_EmailExists() {
        // Given
        when(userMapper.selectByUsername("newuser")).thenReturn(null);
        when(userMapper.selectByEmail("newuser@example.com")).thenReturn(testUser);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.register(registerRequest));
    }

    @Test
    void testRegisterFailure_PhoneExists() {
        // Given
        when(userMapper.selectByUsername("newuser")).thenReturn(null);
        when(userMapper.selectByEmail("newuser@example.com")).thenReturn(null);
        when(userMapper.selectByPhone("13900139000")).thenReturn(testUser);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.register(registerRequest));
    }

    @Test
    void testChangePassword() {
        // Given
        ChangePasswordRequest changePasswordRequest = new ChangePasswordRequest();
        changePasswordRequest.setOldPassword("oldPassword");
        changePasswordRequest.setNewPassword("newPassword");
        changePasswordRequest.setConfirmPassword("newPassword");

        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(passwordEncoder.matches("oldPassword", "$2a$10$encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("$2a$10$newEncodedPassword");
        when(userMapper.updateById(any(User.class))).thenReturn(1);

        // When
        boolean result = userService.changePassword(1L, changePasswordRequest);

        // Then
        assertTrue(result);
        verify(userMapper).updateById(any(User.class));
    }

    @Test
    void testChangePasswordFailure_PasswordMismatch() {
        // Given
        ChangePasswordRequest changePasswordRequest = new ChangePasswordRequest();
        changePasswordRequest.setOldPassword("oldPassword");
        changePasswordRequest.setNewPassword("newPassword");
        changePasswordRequest.setConfirmPassword("differentPassword");

        // When & Then
        assertThrows(BusinessException.class, () -> userService.changePassword(1L, changePasswordRequest));
    }

    @Test
    void testChangePasswordFailure_UserNotFound() {
        // Given
        ChangePasswordRequest changePasswordRequest = new ChangePasswordRequest();
        changePasswordRequest.setOldPassword("oldPassword");
        changePasswordRequest.setNewPassword("newPassword");
        changePasswordRequest.setConfirmPassword("newPassword");

        when(userMapper.selectById(1L)).thenReturn(null);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.changePassword(1L, changePasswordRequest));
    }

    @Test
    void testChangePasswordFailure_WrongOldPassword() {
        // Given
        ChangePasswordRequest changePasswordRequest = new ChangePasswordRequest();
        changePasswordRequest.setOldPassword("wrongPassword");
        changePasswordRequest.setNewPassword("newPassword");
        changePasswordRequest.setConfirmPassword("newPassword");

        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(passwordEncoder.matches("wrongPassword", "$2a$10$encodedPassword")).thenReturn(false);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.changePassword(1L, changePasswordRequest));
    }

    @Test
    void testGetUserById() {
        // Given
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(1L);
        roleDTO.setCode("USER");
        roleDTO.setName("普通用户");
        
        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(userMapper.selectRoleCodesByUserId(1L)).thenReturn(Arrays.asList("USER"));
        when(userMapper.selectRolesByUserId(1L)).thenReturn(Arrays.asList(roleDTO));
        when(userMapper.selectPermissionCodesByUserId(1L)).thenReturn(Arrays.asList("user:view"));

        // When
        UserDTO result = userService.getUserById(1L);

        // Then
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("Test User", result.getRealName());
        assertEquals(1, result.getRoles().size());
        assertEquals("USER", result.getRoles().get(0).getCode());
    }

    @Test
    void testGetUserByIdNotFound() {
        // Given
        when(userMapper.selectById(1L)).thenReturn(null);

        // When
        UserDTO result = userService.getUserById(1L);

        // Then
        assertNull(result);
    }

    @Test
    void testCreateUser() {
        // Given
        User newUser = new User();
        newUser.setUsername("newuser");
        newUser.setPassword("password");
        newUser.setEmail("new@example.com");
        newUser.setPhone("13900139001");

        when(userMapper.selectByUsername("newuser")).thenReturn(null);
        when(userMapper.selectByEmail("new@example.com")).thenReturn(null);
        when(userMapper.selectByPhone("13900139001")).thenReturn(null);
        when(passwordEncoder.encode("password")).thenReturn("$2a$10$encodedPassword");
        when(userMapper.insert(any(User.class))).thenReturn(1);

        // When
        boolean result = userService.createUser(newUser);

        // Then
        assertTrue(result);
        verify(userMapper).insert(any(User.class));
    }

    @Test
    void testCreateUserFailure_UsernameExists() {
        // Given
        User newUser = new User();
        newUser.setUsername("existinguser");

        when(userMapper.selectByUsername("existinguser")).thenReturn(testUser);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.createUser(newUser));
    }

    @Test
    void testUpdateUser() {
        // Given
        User updateUser = new User();
        updateUser.setId(1L);
        updateUser.setUsername("updateduser");
        updateUser.setEmail("updated@example.com");
        updateUser.setPhone("13900139002");

        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(userMapper.selectByUsername("updateduser")).thenReturn(null);
        when(userMapper.selectByEmail("updated@example.com")).thenReturn(null);
        when(userMapper.selectByPhone("13900139002")).thenReturn(null);
        when(userMapper.updateById(any(User.class))).thenReturn(1);

        // When
        boolean result = userService.updateUser(updateUser);

        // Then
        assertTrue(result);
        verify(userMapper).updateById(any(User.class));
    }

    @Test
    void testUpdateUserFailure_UserNotFound() {
        // Given
        User updateUser = new User();
        updateUser.setId(1L);

        when(userMapper.selectById(1L)).thenReturn(null);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.updateUser(updateUser));
    }

    @Test
    void testDeleteUser() {
        // Given
        when(userRoleMapper.deleteByUserId(1L)).thenReturn(1);
        when(userMapper.deleteById(1L)).thenReturn(1);

        // When
        boolean result = userService.deleteUser(1L);

        // Then
        assertTrue(result);
        verify(userRoleMapper).deleteByUserId(1L);
        verify(userMapper).deleteById(1L);
    }

    @Test
    void testUpdateUserStatus() {
        // Given
        when(userMapper.updateById(any(User.class))).thenReturn(1);

        // When
        boolean result = userService.updateUserStatus(1L, 0);

        // Then
        assertTrue(result);
        verify(userMapper).updateById(any(User.class));
    }

    @Test
    void testLockUser() {
        // Given
        when(userMapper.lockUser(eq(1L), anyString())).thenReturn(1);

        // When
        boolean result = userService.lockUser(1L);

        // Then
        assertTrue(result);
        verify(userMapper).lockUser(eq(1L), anyString());
    }

    @Test
    void testUnlockUser() {
        // Given
        when(userMapper.unlockUser(1L)).thenReturn(1);

        // When
        boolean result = userService.unlockUser(1L);

        // Then
        assertTrue(result);
        verify(userMapper).unlockUser(1L);
    }

    @Test
    void testGetUserList() {
        // Given
        Page<User> userPage = new Page<>(1, 10);
        userPage.setRecords(Arrays.asList(testUser));
        userPage.setTotal(1);

        when(userMapper.selectPage(any(), any())).thenReturn(userPage);
        when(userMapper.selectRoleCodesByUserId(1L)).thenReturn(Arrays.asList("USER"));

        // When
        Page<UserDTO> result = userService.getUserList(1, 10, "test", "Test", 1);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getRecords().size());
        assertEquals("testuser", result.getRecords().get(0).getUsername());
    }

    @Test
    void testAssignUserRoles() {
        // Given
        List<Long> roleIds = Arrays.asList(1L, 2L);
        when(userRoleMapper.deleteByUserId(1L)).thenReturn(1);
        when(userRoleMapper.batchInsert(any())).thenReturn(2);

        // When
        boolean result = userService.assignUserRoles(1L, roleIds);

        // Then
        assertTrue(result);
        verify(userRoleMapper).deleteByUserId(1L);
        verify(userRoleMapper).batchInsert(any());
    }

    @Test
    void testAssignUserRolesEmpty() {
        // Given
        when(userRoleMapper.deleteByUserId(1L)).thenReturn(1);

        // When
        boolean result = userService.assignUserRoles(1L, null);

        // Then
        assertTrue(result);
        verify(userRoleMapper).deleteByUserId(1L);
        verify(userRoleMapper, never()).batchInsert(any());
    }

    @Test
    void testGetUserRoles() {
        // Given
        when(userMapper.selectRoleCodesByUserId(1L)).thenReturn(Arrays.asList("USER", "ADMIN"));

        // When
        List<String> result = userService.getUserRoles(1L);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.contains("USER"));
        assertTrue(result.contains("ADMIN"));
    }

    @Test
    void testGetUserPermissions() {
        // Given
        when(userMapper.selectPermissionCodesByUserId(1L)).thenReturn(Arrays.asList("user:view", "user:edit"));

        // When
        List<String> result = userService.getUserPermissions(1L);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.contains("user:view"));
        assertTrue(result.contains("user:edit"));
    }

    @Test
    void testUpdateLoginInfo() {
        // Given
        when(userMapper.updateLoginInfo(eq(1L), anyString(), eq("127.0.0.1"))).thenReturn(1);

        // When
        boolean result = userService.updateLoginInfo(1L, "127.0.0.1");

        // Then
        assertTrue(result);
        verify(userMapper).updateLoginInfo(eq(1L), anyString(), eq("127.0.0.1"));
    }

    @Test
    void testExistsByEmail() {
        // Given
        when(userMapper.selectByEmail("test@example.com")).thenReturn(testUser);

        // When
        boolean exists = userService.existsByEmail("test@example.com");

        // Then
        assertTrue(exists);
    }

    @Test
    void testExistsByEmailNotFound() {
        // Given
        when(userMapper.selectByEmail("notfound@example.com")).thenReturn(null);

        // When
        boolean exists = userService.existsByEmail("notfound@example.com");

        // Then
        assertFalse(exists);
    }

    @Test
    void testExistsByPhone() {
        // Given
        when(userMapper.selectByPhone("13800138000")).thenReturn(testUser);

        // When
        boolean exists = userService.existsByPhone("13800138000");

        // Then
        assertTrue(exists);
    }

    @Test
    void testExistsByPhoneNotFound() {
        // Given
        when(userMapper.selectByPhone("13900139999")).thenReturn(null);

        // When
        boolean exists = userService.existsByPhone("13900139999");

        // Then
        assertFalse(exists);
    }
}