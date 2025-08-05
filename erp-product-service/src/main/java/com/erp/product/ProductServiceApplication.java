package com.erp.product;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 商品服务启动类
 *
 * @author ERP System
 */
@SpringBootApplication(scanBasePackages = { "com.erp.product", "com.erp.common" })
@EnableDiscoveryClient
@EnableTransactionManagement
@MapperScan("com.erp.product.mapper")
public class ProductServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }
}