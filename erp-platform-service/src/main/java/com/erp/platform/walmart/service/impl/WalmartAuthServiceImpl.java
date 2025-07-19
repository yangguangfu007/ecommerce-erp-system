package com.erp.platform.walmart.service.impl;

import com.erp.common.exception.BusinessException;
import com.erp.platform.walmart.config.WalmartConfig;
import com.erp.platform.walmart.dto.WalmartAuthToken;
import com.erp.platform.walmart.service.WalmartAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

/**
 * 沃尔玛认证服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WalmartAuthServiceImpl implements WalmartAuthService {
    
    private final WalmartConfig walmartConfig;
    private final RedisTemplate<String, Object> redisTemplate;
    private final WebClient webClient;
    
    private static final String TOKEN_CACHE_KEY = "walmart:auth:token";
    private static final String AUTH_ENDPOINT = "/v3/token";
    
    @Override
    public WalmartAuthToken getAccessToken() {
        // 先从缓存获取
        WalmartAuthToken cachedToken = getCachedToken();
        if (cachedToken != null && !cachedToken.isExpired()) {
            log.debug("使用缓存的沃尔玛访问令牌");
            return cachedToken;
        }
        
        // 缓存中没有或已过期，重新获取
        return refreshAccessToken();
    }
    
    @Override
    public WalmartAuthToken refreshAccessToken() {
        log.info("正在获取沃尔玛访问令牌");
        
        try {
            // 准备认证头
            String credentials = walmartConfig.getClientId() + ":" + walmartConfig.getClientSecret();
            String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());
            
            // 准备请求体
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("grant_type", "client_credentials");
            
            // 发送请求
            WalmartAuthToken token = webClient.post()
                    .uri(walmartConfig.getBaseUrl() + AUTH_ENDPOINT)
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + encodedCredentials)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(WalmartAuthToken.class)
                    .timeout(Duration.ofMillis(walmartConfig.getReadTimeout()))
                    .block();
            
            if (token == null) {
                throw new BusinessException("获取沃尔玛访问令牌失败：响应为空");
            }
            
            // 设置创建时间
            token.setCreatedAt(LocalDateTime.now());
            
            // 缓存令牌
            cacheToken(token);
            
            log.info("成功获取沃尔玛访问令牌，过期时间: {} 秒", token.getExpiresIn());
            return token;
            
        } catch (WebClientResponseException e) {
            log.error("获取沃尔玛访问令牌失败，HTTP状态码: {}, 响应体: {}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("获取沃尔玛访问令牌失败: " + e.getMessage());
        } catch (Exception e) {
            log.error("获取沃尔玛访问令牌时发生异常", e);
            throw new BusinessException("获取沃尔玛访问令牌失败: " + e.getMessage());
        }
    }
    
    @Override
    public boolean validateToken(WalmartAuthToken token) {
        if (token == null || token.getAccessToken() == null) {
            return false;
        }
        
        return !token.isExpired();
    }
    
    @Override
    public void clearCachedToken() {
        redisTemplate.delete(TOKEN_CACHE_KEY);
        log.info("已清除缓存的沃尔玛访问令牌");
    }
    
    /**
     * 从缓存获取令牌
     */
    private WalmartAuthToken getCachedToken() {
        try {
            return (WalmartAuthToken) redisTemplate.opsForValue().get(TOKEN_CACHE_KEY);
        } catch (Exception e) {
            log.warn("从缓存获取沃尔玛令牌失败", e);
            return null;
        }
    }
    
    /**
     * 缓存令牌
     */
    private void cacheToken(WalmartAuthToken token) {
        try {
            long cacheTime = Math.min(token.getExpiresIn() - 300, walmartConfig.getTokenCacheTime());
            redisTemplate.opsForValue().set(TOKEN_CACHE_KEY, token, cacheTime, TimeUnit.SECONDS);
            log.debug("已缓存沃尔玛访问令牌，缓存时间: {} 秒", cacheTime);
        } catch (Exception e) {
            log.warn("缓存沃尔玛令牌失败", e);
        }
    }
}