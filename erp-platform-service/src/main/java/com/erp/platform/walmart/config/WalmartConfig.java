package com.erp.platform.walmart.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 沃尔玛平台配置
 *
 * @author ERP System
 */
@Data
@Component
@ConfigurationProperties(prefix = "walmart.api")
public class WalmartConfig {
    
    /**
     * API基础URL
     */
    private String baseUrl = "https://marketplace.walmartapis.com";
    
    /**
     * 客户端ID
     */
    private String clientId;
    
    /**
     * 客户端密钥
     */
    private String clientSecret;
    
    /**
     * 连接超时时间(毫秒)
     */
    private int connectTimeout = 30000;
    
    /**
     * 读取超时时间(毫秒)
     */
    private int readTimeout = 60000;
    
    /**
     * 重试次数
     */
    private int maxRetries = 3;
    
    /**
     * 重试间隔(毫秒)
     */
    private long retryDelay = 1000;
    
    /**
     * 令牌缓存时间(秒)
     */
    private long tokenCacheTime = 3600;
    
    /**
     * 是否启用
     */
    private boolean enabled = true;
}