package com.erp.order;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 订单服务启动类
 *
 * @author ERP System
 */
@SpringBootApplication(scanBasePackages = {"com.erp.order", "com.erp.common"})
@EnableDiscoveryClient
@EnableKafka
@EnableAsync
@EnableTransactionManagement
@MapperScan("com.erp.order.mapper")
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}