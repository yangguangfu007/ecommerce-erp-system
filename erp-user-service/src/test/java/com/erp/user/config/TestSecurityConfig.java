package com.erp.user.config;

import com.erp.user.util.JwtUtil;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 测试安全配置
 * 提供测试环境下的安全配置和Mock Bean
 * 
 * @author ERP System
 */
@TestConfiguration
@EnableWebSecurity
public class TestSecurityConfig {
    
    /**
     * 提供Mock的JwtUtil Bean
     */
    @Bean
    @Primary
    public JwtUtil jwtUtil() {
        return Mockito.mock(JwtUtil.class);
    }
    
    /**
     * 测试环境下的安全配置
     * 禁用所有安全检查
     */
    @Bean
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .headers(headers -> headers.frameOptions().disable());
        
        return http.build();
    }
}