package com.erp.platform.walmart.service;

import com.erp.platform.walmart.config.WalmartConfig;
import com.erp.platform.walmart.dto.WalmartAuthToken;
import com.erp.platform.walmart.service.impl.WalmartAuthServiceImpl;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.web.reactive.function.client.WebClient;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * 沃尔玛认证服务测试
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class WalmartAuthServiceTest {
    
    @Mock
    private RedisTemplate<String, Object> redisTemplate;
    
    @Mock
    private ValueOperations<String, Object> valueOperations;
    
    private WireMockServer wireMockServer;
    private WalmartAuthService walmartAuthService;
    private WalmartConfig walmartConfig;
    
    @BeforeEach
    void setUp() {
        // 启动WireMock服务器
        wireMockServer = new WireMockServer(8089);
        wireMockServer.start();
        WireMock.configureFor("localhost", 8089);
        
        // 配置
        walmartConfig = new WalmartConfig();
        walmartConfig.setBaseUrl("http://localhost:8089");
        walmartConfig.setClientId("test-client-id");
        walmartConfig.setClientSecret("test-client-secret");
        walmartConfig.setReadTimeout(5000);
        walmartConfig.setTokenCacheTime(3600);
        
        // Mock Redis操作 (使用lenient避免unnecessary stubbing错误)
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        
        // 创建WebClient
        WebClient webClient = WebClient.builder().build();
        
        // 创建服务实例
        walmartAuthService = new WalmartAuthServiceImpl(walmartConfig, redisTemplate, webClient);
    }
    
    @AfterEach
    void tearDown() {
        if (wireMockServer != null) {
            wireMockServer.stop();
        }
    }
    
    @Test
    void testGetAccessToken_Success() {
        // Mock Redis返回空（无缓存）
        when(valueOperations.get(anyString())).thenReturn(null);
        
        // Mock沃尔玛API响应
        stubFor(post(urlEqualTo("/v3/token"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\n" +
                                "  \"access_token\": \"test-access-token\",\n" +
                                "  \"token_type\": \"Bearer\",\n" +
                                "  \"expires_in\": 3600\n" +
                                "}")));
        
        // 执行测试
        WalmartAuthToken token = walmartAuthService.getAccessToken();
        
        // 验证结果
        assertNotNull(token);
        assertEquals("test-access-token", token.getAccessToken());
        assertEquals("Bearer", token.getTokenType());
        assertEquals(3600L, token.getExpiresIn());
        assertNotNull(token.getCreatedAt());
        assertFalse(token.isExpired());
        assertEquals("Bearer test-access-token", token.getAuthorizationHeader());
    }
    
    @Test
    void testGetAccessToken_FromCache() {
        // 创建缓存的令牌
        WalmartAuthToken cachedToken = new WalmartAuthToken();
        cachedToken.setAccessToken("cached-token");
        cachedToken.setTokenType("Bearer");
        cachedToken.setExpiresIn(3600L);
        cachedToken.setCreatedAt(java.time.LocalDateTime.now());
        
        // Mock Redis返回缓存的令牌
        when(valueOperations.get(anyString())).thenReturn(cachedToken);
        
        // 执行测试
        WalmartAuthToken token = walmartAuthService.getAccessToken();
        
        // 验证结果
        assertNotNull(token);
        assertEquals("cached-token", token.getAccessToken());
        assertEquals("Bearer", token.getTokenType());
        
        // 验证没有调用API
        verify(0, postRequestedFor(urlEqualTo("/v3/token")));
    }
    
    @Test
    void testRefreshAccessToken_ApiError() {
        // Mock沃尔玛API返回错误
        stubFor(post(urlEqualTo("/v3/token"))
                .willReturn(aResponse()
                        .withStatus(401)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"error\":\"invalid_client\"}")));
        
        // 执行测试并验证异常
        assertThrows(Exception.class, () -> {
            walmartAuthService.refreshAccessToken();
        });
    }
    
    @Test
    void testValidateToken_Valid() {
        WalmartAuthToken token = new WalmartAuthToken();
        token.setAccessToken("test-token");
        token.setTokenType("Bearer");
        token.setExpiresIn(3600L);
        token.setCreatedAt(java.time.LocalDateTime.now());
        
        assertTrue(walmartAuthService.validateToken(token));
    }
    
    @Test
    void testValidateToken_Expired() {
        WalmartAuthToken token = new WalmartAuthToken();
        token.setAccessToken("test-token");
        token.setTokenType("Bearer");
        token.setExpiresIn(3600L);
        token.setCreatedAt(java.time.LocalDateTime.now().minusHours(2)); // 2小时前创建
        
        assertFalse(walmartAuthService.validateToken(token));
    }
    
    @Test
    void testValidateToken_Null() {
        assertFalse(walmartAuthService.validateToken(null));
    }
}