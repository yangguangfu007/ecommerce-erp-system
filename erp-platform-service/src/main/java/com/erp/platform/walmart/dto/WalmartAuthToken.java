package com.erp.platform.walmart.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 沃尔玛认证令牌
 *
 * @author ERP System
 */
@Data
public class WalmartAuthToken {
    
    /**
     * 访问令牌
     */
    @JsonProperty("access_token")
    private String accessToken;
    
    /**
     * 令牌类型
     */
    @JsonProperty("token_type")
    private String tokenType;
    
    /**
     * 过期时间(秒)
     */
    @JsonProperty("expires_in")
    private Long expiresIn;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 检查令牌是否过期
     */
    public boolean isExpired() {
        if (createdAt == null || expiresIn == null) {
            return true;
        }
        return LocalDateTime.now().isAfter(createdAt.plusSeconds(expiresIn - 300)); // 提前5分钟过期
    }
    
    /**
     * 获取完整的授权头
     */
    public String getAuthorizationHeader() {
        return tokenType + " " + accessToken;
    }
}