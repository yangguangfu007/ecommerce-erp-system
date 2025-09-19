package com.erp.platform.walmart.service;

import com.erp.platform.walmart.config.WalmartConfig;
import com.erp.platform.walmart.dto.WalmartAuthToken;
import com.erp.platform.walmart.service.impl.WalmartProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

/**
 * 沃尔玛商品服务测试类
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class WalmartProductServiceTest {

    @Mock
    private WalmartConfig walmartConfig;

    @Mock
    private WalmartAuthService walmartAuthService;

    @Mock
    private WebClient webClient;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private WebClient.RequestBodySpec requestBodySpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private WalmartProductServiceImpl walmartProductService;

    private Map<String, Object> validProductData;
    private WalmartAuthToken mockToken;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(walmartConfig.getBaseUrl()).thenReturn("https://marketplace.walmartapis.com");
        lenient().when(walmartConfig.getReadTimeout()).thenReturn(30000);

        mockToken = new WalmartAuthToken();
        mockToken.setAccessToken("test-token");
        mockToken.setTokenType("Bearer");

        validProductData = new HashMap<>();
        validProductData.put("sku", "TEST-SKU-001");
        validProductData.put("title", "Test Product");
        validProductData.put("description", "Test product description");
        validProductData.put("price", new BigDecimal("29.99"));
        validProductData.put("quantity", 100);
        validProductData.put("category", "Electronics");
        validProductData.put("brand", "TestBrand");
        validProductData.put("images", Arrays.asList("http://example.com/image1.jpg", "http://example.com/image2.jpg"));
    }

    @Test
    void testValidateProduct_ValidData_ShouldReturnValid() {
        // When
        Map<String, Object> result = walmartProductService.validateProduct(validProductData);

        // Then
        assertTrue((Boolean) result.get("valid"));
        assertTrue(((List<?>) result.get("errors")).isEmpty());
        assertNotNull(result.get("warnings"));
    }

    @Test
    void testValidateProduct_MissingSku_ShouldReturnInvalid() {
        // Given
        validProductData.remove("sku");

        // When
        Map<String, Object> result = walmartProductService.validateProduct(validProductData);

        // Then
        assertFalse((Boolean) result.get("valid"));
        List<String> errors = (List<String>) result.get("errors");
        assertTrue(errors.contains("SKU不能为空"));
    }

    @Test
    void testValidateProduct_MissingTitle_ShouldReturnInvalid() {
        // Given
        validProductData.remove("title");

        // When
        Map<String, Object> result = walmartProductService.validateProduct(validProductData);

        // Then
        assertFalse((Boolean) result.get("valid"));
        List<String> errors = (List<String>) result.get("errors");
        assertTrue(errors.contains("商品标题不能为空"));
    }

    @Test
    void testValidateProduct_InvalidPrice_ShouldReturnInvalid() {
        // Given
        validProductData.put("price", "invalid-price");

        // When
        Map<String, Object> result = walmartProductService.validateProduct(validProductData);

        // Then
        assertFalse((Boolean) result.get("valid"));
        List<String> errors = (List<String>) result.get("errors");
        assertTrue(errors.contains("商品价格格式不正确"));
    }

    @Test
    void testValidateProduct_NegativePrice_ShouldReturnInvalid() {
        // Given
        validProductData.put("price", new BigDecimal("-10.00"));

        // When
        Map<String, Object> result = walmartProductService.validateProduct(validProductData);

        // Then
        assertFalse((Boolean) result.get("valid"));
        List<String> errors = (List<String>) result.get("errors");
        assertTrue(errors.contains("商品价格必须大于0"));
    }

    @Test
    void testConvertToWalmartFormat_ValidData_ShouldConvertCorrectly() {
        // When
        Map<String, Object> result = walmartProductService.convertToWalmartFormat(validProductData);

        // Then
        assertEquals("TEST-SKU-001", result.get("sku"));
        assertEquals("Test Product", result.get("productName"));
        assertEquals("Test product description", result.get("shortDescription"));
        assertEquals("Test product description", result.get("longDescription"));
        assertEquals("Electronics", result.get("productCategory"));
        assertEquals("TestBrand", result.get("brand"));

        // Check price structure
        Map<String, Object> priceInfo = (Map<String, Object>) result.get("price");
        assertEquals("USD", priceInfo.get("currency"));
        assertEquals(new BigDecimal("29.99"), priceInfo.get("amount"));

        // Check inventory structure
        Map<String, Object> inventoryInfo = (Map<String, Object>) result.get("inventory");
        Map<String, Object> quantityInfo = (Map<String, Object>) inventoryInfo.get("quantity");
        assertEquals("EACH", quantityInfo.get("unit"));
        assertEquals(100, quantityInfo.get("amount"));

        // Check images
        List<Map<String, Object>> images = (List<Map<String, Object>>) result.get("images");
        assertEquals(2, images.size());
        assertTrue((Boolean) images.get(0).get("main")); // First image should be main
        assertFalse((Boolean) images.get(1).get("main"));
    }

    @Test
    void testUploadProduct_ValidData_ShouldReturnSuccess() {
        // Given
        when(walmartAuthService.getAccessToken()).thenReturn(mockToken);
        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(any(ParameterizedTypeReference.class))).thenReturn(Mono.just(new HashMap<>()));


        // When
        Map<String, Object> result = walmartProductService.uploadProduct("store123", validProductData);

        // Then
        assertTrue((Boolean) result.get("success"));
        assertEquals("TEST-SKU-001", result.get("sku"));
        assertNotNull(result.get("uploadTime"));
    }

    @Test
    void testUploadProduct_InvalidData_ShouldReturnFailure() {
        // Given
        validProductData.remove("sku");

        // When
        Map<String, Object> result = walmartProductService.uploadProduct("store123", validProductData);

        // Then
        assertFalse((Boolean) result.get("success"));
        assertNotNull(result.get("errors"));
    }

    @Test
    void testUploadProduct_WebClientException_ShouldReturnFailure() {
        // Given
        when(walmartAuthService.getAccessToken()).thenReturn(mockToken);
        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(any(ParameterizedTypeReference.class)))
                .thenReturn(Mono.error(WebClientResponseException.create(400, "Bad Request", null, null, null)));
        // timeout is handled at the Mono level, not ResponseSpec level

        // When
        Map<String, Object> result = walmartProductService.uploadProduct("store123", validProductData);

        // Then
        assertFalse((Boolean) result.get("success"));
        assertEquals("TEST-SKU-001", result.get("sku"));
        assertNotNull(result.get("error"));
        assertFalse((Boolean) result.get("retryable")); // 400 is not retryable
    }

    @Test
    void testBatchUploadProducts_ShouldReturnBatchId() {
        // Given
        List<Map<String, Object>> productsData = Arrays.asList(validProductData);

        // When
        Map<String, Object> result = walmartProductService.batchUploadProducts("store123", productsData);

        // Then
        assertNotNull(result.get("batchId"));
        assertEquals("PROCESSING", result.get("status"));
        assertNotNull(result.get("message"));
    }

    @Test
    void testTrackUploadProgress_ExistingBatch_ShouldReturnProgress() {
        // Given
        String batchId = "batch123";
        Map<String, Object> progress = new HashMap<>();
        progress.put("batchId", batchId);
        progress.put("status", "PROCESSING");
        progress.put("processed", 5);
        progress.put("total", 10);

        when(valueOperations.get("walmart:upload:progress:store123:" + batchId)).thenReturn(progress);

        // When
        Map<String, Object> result = walmartProductService.trackUploadProgress("store123", batchId);

        // Then
        assertEquals(batchId, result.get("batchId"));
        assertEquals("PROCESSING", result.get("status"));
        assertEquals(5, result.get("processed"));
        assertEquals(10, result.get("total"));
    }

    @Test
    void testTrackUploadProgress_NonExistentBatch_ShouldReturnError() {
        // Given
        String batchId = "nonexistent";
        when(valueOperations.get("walmart:upload:progress:store123:" + batchId)).thenReturn(null);

        // When
        Map<String, Object> result = walmartProductService.trackUploadProgress("store123", batchId);

        // Then
        assertEquals("批次ID不存在或已过期", result.get("error"));
    }

    @Test
    void testUpdateProductStatus_Success_ShouldReturnTrue() {
        // Given
        when(walmartAuthService.getAccessToken()).thenReturn(mockToken);
        when(webClient.put()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just("success"));
        // timeout is handled at the Mono level, not ResponseSpec level

        // When
        boolean result = walmartProductService.updateProductStatus("store123", "TEST-SKU-001", "ACTIVE");

        // Then
        assertTrue(result);
    }

    @Test
    void testUpdateProductStatus_WebClientException_ShouldReturnFalse() {
        // Given
        when(walmartAuthService.getAccessToken()).thenReturn(mockToken);
        when(webClient.put()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class))
                .thenReturn(Mono.error(WebClientResponseException.create(500, "Internal Server Error", null, null, null)));
        // timeout is handled at the Mono level, not ResponseSpec level

        // When
        boolean result = walmartProductService.updateProductStatus("store123", "TEST-SKU-001", "ACTIVE");

        // Then
        assertFalse(result);
    }

    @Test
    void testRetryFailedProducts_WithRetryableProducts_ShouldReturnBatchResult() {
        // Given
        Map<String, Object> failedProduct1 = new HashMap<>();
        failedProduct1.put("sku", "FAILED-SKU-001");
        failedProduct1.put("retryable", true);

        Map<String, Object> failedProduct2 = new HashMap<>();
        failedProduct2.put("sku", "FAILED-SKU-002");
        failedProduct2.put("retryable", false);

        List<Map<String, Object>> failedProducts = Arrays.asList(failedProduct1, failedProduct2);

        // When
        Map<String, Object> result = walmartProductService.retryFailedProducts("store123", failedProducts);

        // Then
        assertNotNull(result.get("batchId"));
        assertEquals("PROCESSING", result.get("status"));
    }

    @Test
    void testRetryFailedProducts_NoRetryableProducts_ShouldReturnMessage() {
        // Given
        Map<String, Object> failedProduct = new HashMap<>();
        failedProduct.put("sku", "FAILED-SKU-001");
        failedProduct.put("retryable", false);

        List<Map<String, Object>> failedProducts = Arrays.asList(failedProduct);

        // When
        Map<String, Object> result = walmartProductService.retryFailedProducts("store123", failedProducts);

        // Then
        assertEquals("没有可重试的商品", result.get("message"));
        assertEquals(1, result.get("total"));
        assertEquals(0, result.get("retryable"));
    }
}