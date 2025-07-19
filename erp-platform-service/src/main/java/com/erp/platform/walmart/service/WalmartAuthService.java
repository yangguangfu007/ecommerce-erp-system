package com.erp.platform.walmart.service;

import com.erp.platform.walmart.dto.WalmartAuthToken;

/**
 * 沃尔玛认证服务接口
 *
 * @author ERP System
 */
public interface WalmartAuthService {
    
    /**
     * 获取访问令牌
     *
     * @return 访问令牌
     */
    WalmartAuthToken getAccessToken();
    
    /**
     * 刷新访问令牌
     *
     * @return 新的访问令牌
     */
    WalmartAuthToken refreshAccessToken();
    
    /**
     * 验证令牌是否有效
     *
     * @param token 令牌
     * @return 是否有效
     */
    boolean validateToken(WalmartAuthToken token);
    
    /**
     * 清除缓存的令牌
     */
    void clearCachedToken();
}