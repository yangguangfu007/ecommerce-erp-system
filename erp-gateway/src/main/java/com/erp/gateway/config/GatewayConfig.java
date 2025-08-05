package com.erp.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

/**
 * 网关配置类
 *
 * @author ERP System
 */
@Configuration
public class GatewayConfig {

    /**
     * 配置路由规则
     */
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // 用户服务路由
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .uri("lb://erp-user-service"))
                
                // 商品服务路由
                .route("product-service", r -> r
                        .path("/api/products/**")
                        .uri("lb://erp-product-service"))
                
                // 订单服务路由
                .route("order-service", r -> r
                        .path("/api/orders/**")
                        .uri("lb://erp-order-service"))
                
                // 库存服务路由
                .route("inventory-service", r -> r
                        .path("/api/inventory/**")
                        .uri("lb://erp-inventory-service"))
                
                // 平台服务路由
                .route("platform-service", r -> r
                        .path("/api/platforms/**")
                        .uri("lb://erp-platform-service"))
                
                // 物流服务路由
                .route("logistics-service", r -> r
                        .path("/api/logistics/**")
                        .uri("lb://erp-logistics-service"))
                
                // 通知服务路由
                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .uri("lb://erp-notification-service"))
                
                .build();
    }

    /**
     * 跨域配置
     */
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowCredentials(true);
        // 明确允许前端端口
        corsConfig.addAllowedOrigin("http://localhost:5174");
        corsConfig.addAllowedOrigin("http://127.0.0.1:5174");
        corsConfig.addAllowedOriginPattern("*");
        corsConfig.addAllowedHeader("*");
        corsConfig.addAllowedMethod("*");
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}