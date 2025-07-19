package com.erp.gateway.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.HandlerFunction;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 降级处理器
 *
 * @author ERP System
 */
@Component
public class FallbackHandler {

    /**
     * 配置降级路由
     */
    public RouterFunction<ServerResponse> fallbackRoutes() {
        return RouterFunctions.route()
                .GET("/fallback", this::fallbackResponse)
                .POST("/fallback", this::fallbackResponse)
                .PUT("/fallback", this::fallbackResponse)
                .DELETE("/fallback", this::fallbackResponse)
                .build();
    }

    /**
     * 降级响应处理
     */
    private Mono<ServerResponse> fallbackResponse(ServerRequest request) {
        Map<String, Object> result = new HashMap<>();
        result.put("code", HttpStatus.SERVICE_UNAVAILABLE.value());
        result.put("message", "服务暂时不可用，请稍后重试");
        result.put("timestamp", LocalDateTime.now());
        result.put("path", request.path());
        
        return ServerResponse.status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(result));
    }
}