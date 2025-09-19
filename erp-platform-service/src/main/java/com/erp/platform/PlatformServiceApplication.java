package com.erp.platform;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 平台对接服务启动类
 * 提供电商平台对接和管理功能
 *
 * @author ERP System
 */
@SpringBootApplication(scanBasePackages = {"com.erp.platform", "com.erp.common"})
@EnableDiscoveryClient
@EnableRetry
@EnableAsync
@EnableScheduling
@MapperScan("com.erp.platform.mapper")
public class PlatformServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlatformServiceApplication.class, args);
    }
}