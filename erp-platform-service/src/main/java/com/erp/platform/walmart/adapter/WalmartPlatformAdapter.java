package com.erp.platform.walmart.adapter;

import com.erp.common.exception.BusinessException;
import com.erp.platform.adapter.PlatformAdapter;
import com.erp.platform.walmart.config.WalmartConfig;
import com.erp.platform.walmart.dto.WalmartAuthToken;
import com.erp.platform.walmart.dto.WalmartOrder;
import com.erp.platform.walmart.service.WalmartAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 沃尔玛平台适配器实现
 *
 * @author ERP System
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WalmartPlatformAdapter implements PlatformAdapter {
    
    private final WalmartConfig walmartConfig;
    private final WalmartAuthService walmartAuthService;
    private final WebClient webClient;
    
    private static final String PLATFORM_NAME = "WALMART";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    
    @Override
    public String getPlatformName() {
        return PLATFORM_NAME;
    }
    
    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public boolean testConnection(String storeId) {
        log.info("测试沃尔玛平台连接，店铺ID: {}", storeId);
        
        try {
            WalmartAuthToken token = walmartAuthService.getAccessToken();
            
            // 调用一个简单的API来测试连接
            webClient.get()
                    .uri(walmartConfig.getBaseUrl() + "/v3/orders")
                    .header(HttpHeaders.AUTHORIZATION, token.getAuthorizationHeader())
                    .header("WM_SVC.NAME", "Walmart Marketplace")
                    .header("WM_QOS.CORRELATION_ID", UUID.randomUUID().toString())
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(walmartConfig.getReadTimeout()))
                    .block();
            
            log.info("沃尔玛平台连接测试成功，店铺ID: {}", storeId);
            return true;
            
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                log.warn("沃尔玛平台认证失败，店铺ID: {}", storeId);
                walmartAuthService.clearCachedToken();
            } else {
                log.error("沃尔玛平台连接测试失败，店铺ID: {}, HTTP状态码: {}, 响应: {}", 
                        storeId, e.getStatusCode(), e.getResponseBodyAsString());
            }
            return false;
        } catch (Exception e) {
            log.error("沃尔玛平台连接测试异常，店铺ID: {}", storeId, e);
            return false;
        }
    }
    
    @Override
    public Map<String, Object> validateCredentials(String storeId) {
        log.info("验证沃尔玛平台API凭证，店铺ID: {}", storeId);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 尝试获取访问令牌来验证凭证
            WalmartAuthToken token = walmartAuthService.getAccessToken();
            
            if (token != null && token.getAccessToken() != null && !token.getAccessToken().isEmpty()) {
                result.put("valid", true);
                result.put("tokenType", token.getTokenType());
                result.put("expiresIn", token.getExpiresIn());
                result.put("message", "沃尔玛API凭证验证成功");
                
                // 进一步验证令牌是否可用
                boolean connectionTest = testConnection(storeId);
                result.put("connectionTest", connectionTest);
                
                if (!connectionTest) {
                    result.put("warning", "凭证有效但连接测试失败，可能是网络问题或API限制");
                }
            } else {
                result.put("valid", false);
                result.put("error", "无法获取有效的访问令牌");
            }
            
        } catch (Exception e) {
            log.error("验证沃尔玛平台API凭证失败，店铺ID: {}", storeId, e);
            result.put("valid", false);
            result.put("error", "凭证验证失败: " + e.getMessage());
        }
        
        return result;
    }
    
    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public List<Map<String, Object>> fetchOrders(String storeId, LocalDateTime fromDate, LocalDateTime toDate) {
        log.info("拉取沃尔玛订单，店铺ID: {}, 时间范围: {} - {}", storeId, fromDate, toDate);
        
        try {
            WalmartAuthToken token = walmartAuthService.getAccessToken();
            
            String uri = String.format("%s/v3/orders?createdStartDate=%s&createdEndDate=%s&limit=200",
                    walmartConfig.getBaseUrl(),
                    fromDate.format(DATE_FORMATTER),
                    toDate.format(DATE_FORMATTER));
            
            Map<String, Object> response = webClient.get()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, token.getAuthorizationHeader())
                    .header("WM_SVC.NAME", "Walmart Marketplace")
                    .header("WM_QOS.CORRELATION_ID", UUID.randomUUID().toString())
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofMillis(walmartConfig.getReadTimeout()))
                    .block();
            
            List<Map<String, Object>> orders = extractOrdersFromResponse(response);
            log.info("成功拉取沃尔玛订单 {} 个，店铺ID: {}", orders.size(), storeId);
            
            return orders;
            
        } catch (WebClientResponseException e) {
            log.error("拉取沃尔玛订单失败，店铺ID: {}, HTTP状态码: {}, 响应: {}", 
                    storeId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("拉取沃尔玛订单失败: " + e.getMessage());
        } catch (Exception e) {
            log.error("拉取沃尔玛订单异常，店铺ID: {}", storeId, e);
            throw new BusinessException("拉取沃尔玛订单失败: " + e.getMessage());
        }
    }
    
    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public boolean uploadProduct(String storeId, Map<String, Object> productData) {
        log.info("上传商品到沃尔玛平台，店铺ID: {}, SKU: {}", storeId, productData.get("sku"));
        
        try {
            WalmartAuthToken token = walmartAuthService.getAccessToken();
            
            // 转换商品数据格式
            Map<String, Object> walmartProductData = convertToWalmartProductFormat(productData);
            
            webClient.post()
                    .uri(walmartConfig.getBaseUrl() + "/v3/items")
                    .header(HttpHeaders.AUTHORIZATION, token.getAuthorizationHeader())
                    .header("WM_SVC.NAME", "Walmart Marketplace")
                    .header("WM_QOS.CORRELATION_ID", UUID.randomUUID().toString())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(walmartProductData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(walmartConfig.getReadTimeout()))
                    .block();
            
            log.info("成功上传商品到沃尔玛平台，店铺ID: {}, SKU: {}", storeId, productData.get("sku"));
            return true;
            
        } catch (WebClientResponseException e) {
            log.error("上传商品到沃尔玛平台失败，店铺ID: {}, SKU: {}, HTTP状态码: {}, 响应: {}", 
                    storeId, productData.get("sku"), e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("上传商品到沃尔玛平台异常，店铺ID: {}, SKU: {}", storeId, productData.get("sku"), e);
            return false;
        }
    }
    
    @Override
    public Map<String, Object> batchUploadProducts(String storeId, List<Map<String, Object>> productsData) {
        log.info("批量上传商品到沃尔玛平台，店铺ID: {}, 商品数量: {}", storeId, productsData.size());
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> successList = new ArrayList<>();
        List<Map<String, Object>> failureList = new ArrayList<>();
        
        for (Map<String, Object> productData : productsData) {
            try {
                boolean success = uploadProduct(storeId, productData);
                if (success) {
                    successList.add(productData);
                } else {
                    Map<String, Object> failureItem = new HashMap<>(productData);
                    failureItem.put("error", "上传失败");
                    failureList.add(failureItem);
                }
            } catch (Exception e) {
                Map<String, Object> failureItem = new HashMap<>(productData);
                failureItem.put("error", e.getMessage());
                failureList.add(failureItem);
            }
        }
        
        result.put("total", productsData.size());
        result.put("success", successList.size());
        result.put("failure", failureList.size());
        result.put("successList", successList);
        result.put("failureList", failureList);
        
        log.info("批量上传商品完成，店铺ID: {}, 成功: {}, 失败: {}", 
                storeId, successList.size(), failureList.size());
        
        return result;
    }
    
    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public boolean syncInventory(String storeId, String sku, Integer quantity) {
        log.info("同步库存到沃尔玛平台，店铺ID: {}, SKU: {}, 数量: {}", storeId, sku, quantity);
        
        try {
            WalmartAuthToken token = walmartAuthService.getAccessToken();
            
            Map<String, Object> inventoryData = new HashMap<>();
            inventoryData.put("sku", sku);
            inventoryData.put("quantity", Map.of("unit", "EACH", "amount", quantity));
            
            webClient.put()
                    .uri(walmartConfig.getBaseUrl() + "/v3/inventory")
                    .header(HttpHeaders.AUTHORIZATION, token.getAuthorizationHeader())
                    .header("WM_SVC.NAME", "Walmart Marketplace")
                    .header("WM_QOS.CORRELATION_ID", UUID.randomUUID().toString())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(inventoryData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(walmartConfig.getReadTimeout()))
                    .block();
            
            log.info("成功同步库存到沃尔玛平台，店铺ID: {}, SKU: {}, 数量: {}", storeId, sku, quantity);
            return true;
            
        } catch (WebClientResponseException e) {
            log.error("同步库存到沃尔玛平台失败，店铺ID: {}, SKU: {}, HTTP状态码: {}, 响应: {}", 
                    storeId, sku, e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("同步库存到沃尔玛平台异常，店铺ID: {}, SKU: {}", storeId, sku, e);
            return false;
        }
    }
    
    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public boolean updateOrderStatus(String storeId, String orderId, String status, String trackingNumber) {
        log.info("更新沃尔玛订单状态，店铺ID: {}, 订单ID: {}, 状态: {}, 物流单号: {}", 
                storeId, orderId, status, trackingNumber);
        
        try {
            WalmartAuthToken token = walmartAuthService.getAccessToken();
            
            Map<String, Object> statusData = new HashMap<>();
            statusData.put("orderLineStatuses", Map.of(
                    "orderLineStatus", List.of(Map.of(
                            "status", status,
                            "statusQuantity", Map.of("unit", "EACH", "amount", 1)
                    ))
            ));
            
            if (trackingNumber != null && !trackingNumber.isEmpty()) {
                statusData.put("trackingInfo", Map.of(
                        "shipDateTime", LocalDateTime.now().format(DATE_FORMATTER),
                        "carrierName", Map.of("carrier", "OTHER"),
                        "methodCode", "Standard",
                        "trackingNumber", trackingNumber
                ));
            }
            
            webClient.post()
                    .uri(walmartConfig.getBaseUrl() + "/v3/orders/" + orderId + "/shipping")
                    .header(HttpHeaders.AUTHORIZATION, token.getAuthorizationHeader())
                    .header("WM_SVC.NAME", "Walmart Marketplace")
                    .header("WM_QOS.CORRELATION_ID", UUID.randomUUID().toString())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(statusData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(walmartConfig.getReadTimeout()))
                    .block();
            
            log.info("成功更新沃尔玛订单状态，店铺ID: {}, 订单ID: {}", storeId, orderId);
            return true;
            
        } catch (WebClientResponseException e) {
            log.error("更新沃尔玛订单状态失败，店铺ID: {}, 订单ID: {}, HTTP状态码: {}, 响应: {}", 
                    storeId, orderId, e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("更新沃尔玛订单状态异常，店铺ID: {}, 订单ID: {}", storeId, orderId, e);
            return false;
        }
    }
    
    @Override
    public Map<String, Object> getPlatformStatus(String storeId) {
        Map<String, Object> status = new HashMap<>();
        status.put("platform", PLATFORM_NAME);
        status.put("storeId", storeId);
        status.put("enabled", walmartConfig.isEnabled());
        status.put("connected", testConnection(storeId));
        status.put("lastCheckTime", LocalDateTime.now());
        
        return status;
    }
    
    /**
     * 从响应中提取订单列表
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractOrdersFromResponse(Map<String, Object> response) {
        if (response == null) {
            return new ArrayList<>();
        }
        
        Object listObj = response.get("list");
        if (listObj instanceof Map) {
            Map<String, Object> listMap = (Map<String, Object>) listObj;
            Object elementsObj = listMap.get("elements");
            if (elementsObj instanceof Map) {
                Map<String, Object> elementsMap = (Map<String, Object>) elementsObj;
                Object orderObj = elementsMap.get("order");
                if (orderObj instanceof List) {
                    return (List<Map<String, Object>>) orderObj;
                }
            }
        }
        
        return new ArrayList<>();
    }
    
    /**
     * 转换商品数据为沃尔玛格式
     */
    private Map<String, Object> convertToWalmartProductFormat(Map<String, Object> productData) {
        Map<String, Object> walmartData = new HashMap<>();
        
        // 基本信息
        walmartData.put("sku", productData.get("sku"));
        walmartData.put("productName", productData.get("title"));
        walmartData.put("shortDescription", productData.get("description"));
        
        // 价格信息
        if (productData.containsKey("price")) {
            walmartData.put("price", Map.of(
                    "currency", "USD",
                    "amount", productData.get("price")
            ));
        }
        
        // 库存信息
        if (productData.containsKey("quantity")) {
            walmartData.put("inventory", Map.of(
                    "quantity", Map.of(
                            "unit", "EACH",
                            "amount", productData.get("quantity")
                    )
            ));
        }
        
        // 分类信息
        if (productData.containsKey("category")) {
            walmartData.put("productCategory", productData.get("category"));
        }
        
        return walmartData;
    }
}