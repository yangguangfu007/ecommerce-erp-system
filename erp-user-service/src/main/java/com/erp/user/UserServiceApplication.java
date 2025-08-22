package com.erp.user;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * 用户服务启动类
 *
 * @author ERP System
 */
@SpringBootApplication
@EnableDiscoveryClient 
@MapperScan("com.erp.user.mapper")
public class UserServiceApplication {

    public static void main(String[] args) {
        // 设置系统字符编码
        System.setProperty("file.encoding", "UTF-8");
        System.setProperty("sun.jnu.encoding", "UTF-8");
        
        SpringApplication.run(UserServiceApplication.class, args);
    }
}