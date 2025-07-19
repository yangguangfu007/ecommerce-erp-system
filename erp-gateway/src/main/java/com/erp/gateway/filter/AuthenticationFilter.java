package com.erp.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * 认证过滤器
 *
 * @author ERP System
 */
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    /**
     * 不需要认证的路径
     */
    private static final List<String> SKIP_AUTH_PATHS = Arrays.asList(
            "/api/users/login",
            "/api/users/register",
            "/actuator/health",
            "/actuator/info",
            "/v3/api-docs",
            "/swagger-ui"
    );

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // 检查是否需要跳过认证
            if (shouldSkipAuth(path)) {
                return chain.filter(exchange);
            }

            // 获取Authorization头
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            
            if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
                return handleUnauthorized(exchange, "Missing or invalid authorization header");
            }

            // 提取token
            String token = authHeader.substring(7);
            
            // TODO: 实现JWT token验证逻辑
            if (!isValidToken(token)) {
                return handleUnauthorized(exchange, "Invalid token");
            }

            // 在请求头中添加用户信息
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", getUserIdFromToken(token))
                    .header("X-User-Name", getUserNameFromToken(token))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        };
    }

    /**
     * 检查路径是否需要跳过认证
     */
    private boolean shouldSkipAuth(String path) {
        return SKIP_AUTH_PATHS.stream().anyMatch(path::startsWith);
    }

    /**
     * 验证token是否有效
     * TODO: 实现真实的JWT验证逻辑
     */
    private boolean isValidToken(String token) {
        // 暂时简单验证，后续集成JWT
        return StringUtils.hasText(token) && token.length() > 10;
    }

    /**
     * 从token中获取用户ID
     * TODO: 实现真实的JWT解析逻辑
     */
    private String getUserIdFromToken(String token) {
        // 暂时返回固定值，后续从JWT中解析
        return "1";
    }

    /**
     * 从token中获取用户名
     * TODO: 实现真实的JWT解析逻辑
     */
    private String getUserNameFromToken(String token) {
        // 暂时返回固定值，后续从JWT中解析
        return "admin";
    }

    /**
     * 处理未授权请求
     */
    private Mono<Void> handleUnauthorized(org.springframework.web.server.ServerWebExchange exchange, String message) {
        logger.warn("Unauthorized access attempt: {}", message);
        
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        String body = "{\"code\":401,\"message\":\"" + message + "\",\"timestamp\":\"" + 
                     java.time.LocalDateTime.now() + "\"}";
        
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    /**
     * 配置类
     */
    public static class Config {
        // 配置属性可以在这里定义
    }
}