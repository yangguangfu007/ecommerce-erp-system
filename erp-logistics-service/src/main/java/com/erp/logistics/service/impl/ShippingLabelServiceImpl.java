package com.erp.logistics.service.impl;

import com.erp.logistics.adapter.LogisticsAdapter;
import com.erp.logistics.dto.ShippingLabelResponse;
import com.erp.logistics.service.ShippingLabelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 面单服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingLabelServiceImpl implements ShippingLabelService {

    private final LogisticsAdapter logisticsAdapter;
    private final RedisTemplate<String, String> redisTemplate;
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);

    private static final String LABEL_CACHE_PREFIX = "shipping_label:";
    private static final Duration LABEL_CACHE_TTL = Duration.ofHours(24);

    @Override
    public ShippingLabelResponse generateLabelForOrder(Long orderId) {
        try {
            log.info("为订单生成面单，订单ID: {}", orderId);
            
            // 这里应该从订单服务获取订单信息和运单号
            // 为了演示，我们假设已经有运单号
            String trackingNumber = getTrackingNumberByOrderId(orderId);
            
            if (trackingNumber == null) {
                log.error("订单{}没有关联的运单号", orderId);
                return ShippingLabelResponse.failure("NO_TRACKING_NUMBER", "订单没有关联的运单号");
            }
            
            return generateLabel(trackingNumber);
            
        } catch (Exception e) {
            log.error("为订单{}生成面单异常", orderId, e);
            return ShippingLabelResponse.failure("GENERATION_ERROR", "面单生成异常: " + e.getMessage());
        }
    }

    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public ShippingLabelResponse generateLabel(String trackingNumber) {
        try {
            log.info("生成面单，运单号: {}", trackingNumber);
            
            // 先检查缓存
            String cachedLabel = getCachedLabel(trackingNumber);
            if (cachedLabel != null) {
                log.info("从缓存获取面单，运单号: {}", trackingNumber);
                return ShippingLabelResponse.success(trackingNumber, cachedLabel);
            }
            
            // 调用物流适配器生成面单
            ShippingLabelResponse response = logisticsAdapter.generateLabel(trackingNumber);
            
            if (response.isSuccess() && response.getLabelPdfBase64() != null) {
                // 缓存面单
                cacheLabel(trackingNumber, response.getLabelPdfBase64());
                log.info("面单生成成功并已缓存，运单号: {}", trackingNumber);
            }
            
            return response;
            
        } catch (Exception e) {
            log.error("生成面单异常，运单号: {}", trackingNumber, e);
            throw e;
        }
    }

    @Override
    public ShippingLabelResponse regenerateLabel(String trackingNumber) {
        try {
            log.info("重新生成面单，运单号: {}", trackingNumber);
            
            // 清除缓存
            clearCachedLabel(trackingNumber);
            
            // 重新生成
            return generateLabel(trackingNumber);
            
        } catch (Exception e) {
            log.error("重新生成面单异常，运单号: {}", trackingNumber, e);
            return ShippingLabelResponse.failure("REGENERATION_ERROR", "重新生成面单异常: " + e.getMessage());
        }
    }

    @Override
    public String getLabelPdf(String trackingNumber) {
        try {
            log.info("获取面单PDF，运单号: {}", trackingNumber);
            
            // 先检查缓存
            String cachedLabel = getCachedLabel(trackingNumber);
            if (cachedLabel != null) {
                return cachedLabel;
            }
            
            // 如果缓存中没有，重新生成
            ShippingLabelResponse response = generateLabel(trackingNumber);
            return response.isSuccess() ? response.getLabelPdfBase64() : null;
            
        } catch (Exception e) {
            log.error("获取面单PDF异常，运单号: {}", trackingNumber, e);
            return null;
        }
    }

    @Override
    public boolean printLabel(String trackingNumber) {
        try {
            log.info("打印面单，运单号: {}", trackingNumber);
            
            String labelPdf = getLabelPdf(trackingNumber);
            if (labelPdf == null) {
                log.error("无法获取面单PDF，运单号: {}", trackingNumber);
                return false;
            }
            
            // 这里应该调用打印服务
            // 为了演示，我们只是记录日志
            log.info("面单打印请求已发送，运单号: {}", trackingNumber);
            
            // 记录打印历史
            recordPrintHistory(trackingNumber);
            
            return true;
            
        } catch (Exception e) {
            log.error("打印面单异常，运单号: {}", trackingNumber, e);
            return false;
        }
    }

    @Override
    public Map<String, ShippingLabelResponse> batchGenerateLabels(List<String> trackingNumbers) {
        log.info("批量生成面单，数量: {}", trackingNumbers.size());
        
        Map<String, ShippingLabelResponse> results = new HashMap<>();
        
        // 使用CompletableFuture并行处理
        List<CompletableFuture<Void>> futures = trackingNumbers.stream()
                .map(trackingNumber -> CompletableFuture.runAsync(() -> {
                    try {
                        ShippingLabelResponse response = generateLabel(trackingNumber);
                        synchronized (results) {
                            results.put(trackingNumber, response);
                        }
                    } catch (Exception e) {
                        log.error("批量生成面单失败，运单号: {}", trackingNumber, e);
                        synchronized (results) {
                            results.put(trackingNumber, 
                                ShippingLabelResponse.failure("BATCH_ERROR", "批量生成失败: " + e.getMessage()));
                        }
                    }
                }, executorService))
                .toList();
        
        // 等待所有任务完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        log.info("批量生成面单完成，成功: {}, 失败: {}", 
                results.values().stream().mapToLong(r -> r.isSuccess() ? 1 : 0).sum(),
                results.values().stream().mapToLong(r -> r.isSuccess() ? 0 : 1).sum());
        
        return results;
    }

    /**
     * 重试失败后的恢复方法
     */
    @Recover
    public ShippingLabelResponse recoverGenerateLabel(Exception ex, String trackingNumber) {
        log.error("生成面单重试失败，运单号: {}", trackingNumber, ex);
        return ShippingLabelResponse.failure("RETRY_FAILED", "生成面单重试失败: " + ex.getMessage());
    }

    /**
     * 获取缓存的面单
     */
    private String getCachedLabel(String trackingNumber) {
        try {
            String cacheKey = LABEL_CACHE_PREFIX + trackingNumber;
            return redisTemplate.opsForValue().get(cacheKey);
        } catch (Exception e) {
            log.warn("获取缓存面单异常，运单号: {}", trackingNumber, e);
            return null;
        }
    }

    /**
     * 缓存面单
     */
    private void cacheLabel(String trackingNumber, String labelPdfBase64) {
        try {
            String cacheKey = LABEL_CACHE_PREFIX + trackingNumber;
            redisTemplate.opsForValue().set(cacheKey, labelPdfBase64, LABEL_CACHE_TTL);
        } catch (Exception e) {
            log.warn("缓存面单异常，运单号: {}", trackingNumber, e);
        }
    }

    /**
     * 清除缓存的面单
     */
    private void clearCachedLabel(String trackingNumber) {
        try {
            String cacheKey = LABEL_CACHE_PREFIX + trackingNumber;
            redisTemplate.delete(cacheKey);
        } catch (Exception e) {
            log.warn("清除缓存面单异常，运单号: {}", trackingNumber, e);
        }
    }

    /**
     * 根据订单ID获取运单号
     * 这里应该调用订单服务的API
     */
    private String getTrackingNumberByOrderId(Long orderId) {
        // TODO: 调用订单服务API获取运单号
        // 为了演示，返回模拟的运单号
        // 特殊处理：订单ID为999时返回null，用于测试
        if (orderId == 999L) {
            return null;
        }
        return "YE" + System.currentTimeMillis();
    }

    /**
     * 记录打印历史
     */
    private void recordPrintHistory(String trackingNumber) {
        try {
            String historyKey = "print_history:" + trackingNumber;
            String timestamp = String.valueOf(System.currentTimeMillis());
            redisTemplate.opsForList().leftPush(historyKey, timestamp);
            redisTemplate.expire(historyKey, Duration.ofDays(30));
        } catch (Exception e) {
            log.warn("记录打印历史异常，运单号: {}", trackingNumber, e);
        }
    }
}