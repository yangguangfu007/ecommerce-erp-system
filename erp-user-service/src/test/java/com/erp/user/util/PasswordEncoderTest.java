package com.erp.user.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 密码编码器测试类
 * 用于生成BCrypt密码哈希
 *
 * @author ERP System
 */
public class PasswordEncoderTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    public void generatePasswordHash() {
        String password = "admin123";
        String encodedPassword = passwordEncoder.encode(password);
        
        System.out.println("原始密码: " + password);
        System.out.println("BCrypt哈希: " + encodedPassword);
        
        // 验证密码是否正确
        boolean matches = passwordEncoder.matches(password, encodedPassword);
        System.out.println("密码验证结果: " + matches);
    }

    @Test
    public void testSpecificHash() {
        String password = "admin123";
        String hash = "$2a$10$N.zmdr9k7uOCQb07XjVqSOBFDAK0LXSyYy2FkFcoGLUxDdmLHJWw6";
        
        boolean matches = passwordEncoder.matches(password, hash);
        System.out.println("测试密码: " + password);
        System.out.println("测试哈希: " + hash);
        System.out.println("验证结果: " + matches);
    }
}