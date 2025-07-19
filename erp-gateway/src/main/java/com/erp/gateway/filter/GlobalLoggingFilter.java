package com.erp.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 全局日志过滤器
 * 记录请求和响应信息
 *
 * @author ERP System
 */
@Component
public class GlobalLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(GlobalLoggingFilter.class);
    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String START_TIME_ATTR = "startTime";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // 生成请求ID
        String requestId = UUID.randomUUID().toString();
        
        // 记录开始时间
        exchange.getAttributes().put(START_TIME_ATTR, System.currentTimeMillis());
        
        // 在请求头中添加请求ID
        ServerHttpRequest modifiedRequest = request.mutate()
                .header(REQUEST_ID_HEADER, requestId)
                .build();
        
        // 记录请求信息
        logRequest(modifiedRequest, requestId);
        
        return chain.filter(exchange.mutate().request(modifiedRequest).build())
                .then(Mono.fromRunnable(() -> {
                    // 记录响应信息
                    logResponse(exchange, requestId);
                }));
    }

    /**
     * 记录请求信息
     */
    private void logRequest(ServerHttpRequest request, String requestId) {
        logger.info("Request [{}] - Method: {}, URI: {}, Headers: {}, RemoteAddress: {}",
                requestId,
                request.getMethod(),
                request.getURI(),
                request.getHeaders().toSingleValueMap(),
                request.getRemoteAddress());
    }

    /**
     * 记录响应信息
     */
    private void logResponse(ServerWebExchange exchange, String requestId) {
        ServerHttpResponse response = exchange.getResponse();
        Long startTime = exchange.getAttribute(START_TIME_ATTR);
        long duration = startTime != null ? System.currentTimeMillis() - startTime : 0;
        
        logger.info("Response [{}] - Status: {}, Duration: {}ms, Headers: {}",
                requestId,
                response.getStatusCode(),
                duration,
                response.getHeaders().toSingleValueMap());
    }

    @Override
    public int getOrder() {
        // 设置较高优先级，确保在其他过滤器之前执行
        return -1;
    }
}