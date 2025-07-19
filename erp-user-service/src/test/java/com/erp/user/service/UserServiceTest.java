package com.erp.user.service;

import com.erp.user.dto.LoginRequest;
import com.erp.user.dto.LoginResponse;
import com.erp.user.dto.RegisterRequest;
import com.erp.user.entity.User;
import com.erp.user.mapper.UserMapper;
import com.erp.user.service.impl.UserServiceImpl;
import com.erp.user.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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
    private RedisTemplate<String, Object> redisTemplate;

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
        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        when(userMapper.selectByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("password123", "$2a$10$encodedPassword")).thenReturn(true);
        when(jwtUtil.generateTokenWithUserId(anyString(), any())).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(anyString())).thenReturn("refresh-token");
        when(userMapper.selectRoleCodesByUserId(1L)).thenReturn(java.util.Arrays.asList("USER"));
        when(userMapper.selectPermissionCodesByUserId(1L)).thenReturn(java.util.Arrays.asList("user:view"));

        // When
        LoginResponse response = userService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertNotNull(response.getUserInfo());
        assertEquals("testuser", response.getUserInfo().getUsername());
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
}