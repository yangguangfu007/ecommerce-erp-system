package com.erp.platform.walmart.service.impl;

import com.erp.common.exception.BusinessException;
import com.erp.platform.walmart.config.WalmartConfig;
import com.erp.platform.walmart.dto.WalmartAuthToken;
import com.erp.platform.walmart.service.WalmartAuthService;
import com.erp.platform.walmart.service.WalmartProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 沃尔玛商品服务实现
 *
 * @author ERP System
 */
@Service
public class WalmartProductServiceImpl implements WalmartProductService {
    
    private static final Logger log = LoggerFactory.getLogger(WalmartProductServiceImpl.class);
    
    @Autowired
    private WalmartConfig walmartConfig;
    
    @Autowired
    private WalmartAuthService walmartAuthService;
    
    @Autowired
    private WebClient webClient;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String UPLOAD_PROGRESS_KEY = "walmart:upload:progress:";
    private static final String FAILED_PRODUCTS_KEY = "walmart:failed:products:";
    
    @Override
    public Map<String, Object> validateProduct(Map<String, Object> productData) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        // 必填字段验证
        if (!StringUtils.hasText((String) productData.get("sku"))) {
            errors.add("SKU不能为空");
        }
        
        if (!StringUtils.hasText((String) productData.get("title"))) {
            errors.add("商品标题不能为空");
        }
        
        if (!StringUtils.hasText((String) productData.get("description"))) {
            errors.add("商品描述不能为空");
        }
        
        // 价格验证
        Object priceObj = productData.get("price");
        if (priceObj == null) {
            errors.add("商品价格不能为空");
        } else {
            try {
                BigDecimal price = new BigDecimal(priceObj.toString());
                if (price.compareTo(BigDecimal.ZERO) <= 0) {
                    errors.add("商品价格必须大于0");
                }
            } catch (NumberFormatException e) {
                errors.add("商品价格格式不正确");
            }
        }
        
        // 库存验证
        Object quantityObj = productData.get("quantity");
        if (quantityObj != null) {
            try {
                int quantity = Integer.parseInt(quantityObj.toString());
                if (quantity < 0) {
                    warnings.add("库存数量为负数");
                }
            } catch (NumberFormatException e) {
                errors.add("库存数量格式不正确");
            }
        }
        
        // 分类验证
        if (!StringUtils.hasText((String) productData.get("category"))) {
            warnings.add("建议设置商品分类");
        }
        
        // 图片验证
        Object imagesObj = productData.get("images");
        if (imagesObj == null || (imagesObj instanceof List && ((List<?>) imagesObj).isEmpty())) {
            warnings.add("建议添加商品图片");
        }
        
        result.put("valid", errors.isEmpty());
        result.put("errors", errors);
        result.put("warnings", warnings);
        
        return result;
    }
    
    @Override
    public Map<String, Object> convertToWalmartFormat(Map<String, Object> productData) {
        Map<String, Object> walmartData = new HashMap<>();
        
        // 基本信息
        walmartData.put("sku", productData.get("sku"));
        walmartData.put("productName", productData.get("title"));
        walmartData.put("shortDescription", truncateDescription((String) productData.get("description"), 4000));
        walmartData.put("longDescription", productData.get("description"));
        
        // 价格信息
        if (productData.containsKey("price")) {
            Map<String, Object> priceInfo = new HashMap<>();
            priceInfo.put("currency", "USD");
            priceInfo.put("amount", productData.get("price"));
            walmartData.put("price", priceInfo);
        }
        
        // 库存信息
        if (productData.containsKey("quantity")) {
            Map<String, Object> inventoryInfo = new HashMap<>();
            Map<String, Object> quantityInfo = new HashMap<>();
            quantityInfo.put("unit", "EACH");
            quantityInfo.put("amount", productData.get("quantity"));
            inventoryInfo.put("quantity", quantityInfo);
            walmartData.put("inventory", inventoryInfo);
        }
        
        // 分类信息
        if (productData.containsKey("category")) {
            walmartData.put("productCategory", productData.get("category"));
        }
        
        // 品牌信息
        if (productData.containsKey("brand")) {
            walmartData.put("brand", productData.get("brand"));
        }
        
        // 尺寸重量信息
        if (productData.containsKey("weight") || productData.containsKey("dimensions")) {
            Map<String, Object> shippingInfo = new HashMap<>();
            
            if (productData.containsKey("weight")) {
                Map<String, Object> weightInfo = new HashMap<>();
                weightInfo.put("unit", "LB");
                weightInfo.put("measure", productData.get("weight"));
                shippingInfo.put("weight", weightInfo);
            }
            
            if (productData.containsKey("dimensions")) {
                shippingInfo.put("dimensions", productData.get("dimensions"));
            }
            
            walmartData.put("shippingInfo", shippingInfo);
        }
        
        // 图片信息
        if (productData.containsKey("images")) {
            List<?> images = (List<?>) productData.get("images");
            if (images != null && !images.isEmpty()) {
                List<Map<String, Object>> imageList = new ArrayList<>();
                for (int i = 0; i < Math.min(images.size(), 8); i++) { // 沃尔玛最多支持8张图片
                    Map<String, Object> imageInfo = new HashMap<>();
                    imageInfo.put("url", images.get(i));
                    imageInfo.put("main", i == 0); // 第一张为主图
                    imageList.add(imageInfo);
                }
                walmartData.put("images", imageList);
            }
        }
        
        // 属性信息
        if (productData.containsKey("attributes")) {
            walmartData.put("attributes", productData.get("attributes"));
        }
        
        return walmartData;
    }
    
    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public Map<String, Object> uploadProduct(String storeId, Map<String, Object> productData) {
        String sku = (String) productData.get("sku");
        log.info("开始上传商品到沃尔玛，店铺ID: {}, SKU: {}", storeId, sku);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 验证商品数据
            Map<String, Object> validation = validateProduct(productData);
            if (!(Boolean) validation.get("valid")) {
                result.put("success", false);
                result.put("errors", validation.get("errors"));
                return result;
            }
            
            // 转换格式
            Map<String, Object> walmartData = convertToWalmartFormat(productData);
            
            // 获取认证令牌
            WalmartAuthToken token = walmartAuthService.getAccessToken();
            
            // 发送上传请求
            Map<String, Object> response = webClient.post()
                    .uri(walmartConfig.getBaseUrl() + "/v3/items")
                    .header(HttpHeaders.AUTHORIZATION, token.getAuthorizationHeader())
                    .header("WM_SVC.NAME", "Walmart Marketplace")
                    .header("WM_QOS.CORRELATION_ID", UUID.randomUUID().toString())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(walmartData)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofMillis(walmartConfig.getReadTimeout()))
                    .block();
            
            result.put("success", true);
            result.put("sku", sku);
            result.put("response", response);
            result.put("uploadTime", LocalDateTime.now());
            
            log.info("成功上传商品到沃尔玛，店铺ID: {}, SKU: {}", storeId, sku);
            
        } catch (WebClientResponseException e) {
            log.error("上传商品到沃尔玛失败，店铺ID: {}, SKU: {}, HTTP状态码: {}, 响应: {}", 
                    storeId, sku, e.getStatusCode(), e.getResponseBodyAsString());
            
            result.put("success", false);
            result.put("sku", sku);
            result.put("error", "HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            result.put("retryable", isRetryableError(e.getStatusCode().value()));
            
        } catch (Exception e) {
            log.error("上传商品到沃尔玛异常，店铺ID: {}, SKU: {}", storeId, sku, e);
            
            result.put("success", false);
            result.put("sku", sku);
            result.put("error", e.getMessage());
            result.put("retryable", true);
        }
        
        return result;
    }
    
    @Override
    public Map<String, Object> batchUploadProducts(String storeId, List<Map<String, Object>> productsData) {
        String batchId = UUID.randomUUID().toString();
        log.info("开始批量上传商品到沃尔玛，店铺ID: {}, 批次ID: {}, 商品数量: {}", 
                storeId, batchId, productsData.size());
        
        Map<String, Object> batchResult = new HashMap<>();
        List<Map<String, Object>> successList = new ArrayList<>();
        List<Map<String, Object>> failureList = new ArrayList<>();
        
        // 初始化进度跟踪
        Map<String, Object> progress = new HashMap<>();
        progress.put("batchId", batchId);
        progress.put("total", productsData.size());
        progress.put("processed", 0);
        progress.put("success", 0);
        progress.put("failure", 0);
        progress.put("startTime", LocalDateTime.now());
        progress.put("status", "PROCESSING");
        
        cacheUploadProgress(storeId, batchId, progress);
        
        // 异步处理批量上传
        CompletableFuture.runAsync(() -> {
            processBatchUpload(storeId, batchId, productsData, successList, failureList, progress);
        });
        
        batchResult.put("batchId", batchId);
        batchResult.put("status", "PROCESSING");
        batchResult.put("message", "批量上传已开始，请使用批次ID查询进度");
        
        return batchResult;
    }
    
    @Override
    public Map<String, Object> trackUploadProgress(String storeId, String batchId) {
        String progressKey = UPLOAD_PROGRESS_KEY + storeId + ":" + batchId;
        Map<String, Object> progress = (Map<String, Object>) redisTemplate.opsForValue().get(progressKey);
        
        if (progress == null) {
            Map<String, Object> notFound = new HashMap<>();
            notFound.put("error", "批次ID不存在或已过期");
            return notFound;
        }
        
        return progress;
    }
    
    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public boolean updateProductStatus(String storeId, String sku, String status) {
        log.info("更新沃尔玛商品状态，店铺ID: {}, SKU: {}, 状态: {}", storeId, sku, status);
        
        try {
            WalmartAuthToken token = walmartAuthService.getAccessToken();
            
            Map<String, Object> statusData = new HashMap<>();
            statusData.put("sku", sku);
            statusData.put("lifecycle", status);
            
            webClient.put()
                    .uri(walmartConfig.getBaseUrl() + "/v3/items/" + sku + "/lifecycle")
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
            
            log.info("成功更新沃尔玛商品状态，店铺ID: {}, SKU: {}", storeId, sku);
            return true;
            
        } catch (WebClientResponseException e) {
            log.error("更新沃尔玛商品状态失败，店铺ID: {}, SKU: {}, HTTP状态码: {}, 响应: {}", 
                    storeId, sku, e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("更新沃尔玛商品状态异常，店铺ID: {}, SKU: {}", storeId, sku, e);
            return false;
        }
    }
    
    @Override
    public Map<String, Object> retryFailedProducts(String storeId, List<Map<String, Object>> failedProducts) {
        log.info("重试失败的商品上传，店铺ID: {}, 商品数量: {}", storeId, failedProducts.size());
        
        List<Map<String, Object>> retryableProducts = failedProducts.stream()
                .filter(product -> Boolean.TRUE.equals(product.get("retryable")))
                .collect(Collectors.toList());
        
        if (retryableProducts.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("message", "没有可重试的商品");
            result.put("total", failedProducts.size());
            result.put("retryable", 0);
            return result;
        }
        
        // 重新批量上传可重试的商品
        return batchUploadProducts(storeId, retryableProducts);
    }
    
    /**
     * 处理批量上传
     */
    private void processBatchUpload(String storeId, String batchId, List<Map<String, Object>> productsData,
                                   List<Map<String, Object>> successList, List<Map<String, Object>> failureList,
                                   Map<String, Object> progress) {
        
        for (int i = 0; i < productsData.size(); i++) {
            Map<String, Object> productData = productsData.get(i);
            
            try {
                Map<String, Object> result = uploadProduct(storeId, productData);
                
                if (Boolean.TRUE.equals(result.get("success"))) {
                    successList.add(result);
                    progress.put("success", (Integer) progress.get("success") + 1);
                } else {
                    failureList.add(result);
                    progress.put("failure", (Integer) progress.get("failure") + 1);
                }
                
                progress.put("processed", i + 1);
                
                // 更新进度
                if (i % 10 == 0 || i == productsData.size() - 1) {
                    cacheUploadProgress(storeId, batchId, progress);
                }
                
                // 避免请求过于频繁
                Thread.sleep(100);
                
            } catch (Exception e) {
                log.error("批量上传商品异常，SKU: {}", productData.get("sku"), e);
                
                Map<String, Object> errorResult = new HashMap<>();
                errorResult.put("success", false);
                errorResult.put("sku", productData.get("sku"));
                errorResult.put("error", e.getMessage());
                errorResult.put("retryable", true);
                
                failureList.add(errorResult);
                progress.put("failure", (Integer) progress.get("failure") + 1);
                progress.put("processed", i + 1);
            }
        }
        
        // 完成处理
        progress.put("status", "COMPLETED");
        progress.put("endTime", LocalDateTime.now());
        progress.put("successList", successList);
        progress.put("failureList", failureList);
        
        cacheUploadProgress(storeId, batchId, progress);
        
        // 缓存失败的商品用于重试
        if (!failureList.isEmpty()) {
            cacheFailedProducts(storeId, batchId, failureList);
        }
        
        log.info("批量上传完成，店铺ID: {}, 批次ID: {}, 成功: {}, 失败: {}", 
                storeId, batchId, successList.size(), failureList.size());
    }
    
    /**
     * 缓存上传进度
     */
    private void cacheUploadProgress(String storeId, String batchId, Map<String, Object> progress) {
        String progressKey = UPLOAD_PROGRESS_KEY + storeId + ":" + batchId;
        redisTemplate.opsForValue().set(progressKey, progress, 24, TimeUnit.HOURS);
    }
    
    /**
     * 缓存失败的商品
     */
    private void cacheFailedProducts(String storeId, String batchId, List<Map<String, Object>> failedProducts) {
        String failedKey = FAILED_PRODUCTS_KEY + storeId + ":" + batchId;
        redisTemplate.opsForValue().set(failedKey, failedProducts, 24, TimeUnit.HOURS);
    }
    
    /**
     * 截断描述文本
     */
    private String truncateDescription(String description, int maxLength) {
        if (description == null || description.length() <= maxLength) {
            return description;
        }
        return description.substring(0, maxLength - 3) + "...";
    }
    
    /**
     * 判断是否为可重试的错误
     */
    private boolean isRetryableError(int statusCode) {
        return statusCode >= 500 || statusCode == 429; // 服务器错误或限流
    }
}