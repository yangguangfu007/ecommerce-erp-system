package com.erp.logistics.service.impl;

import com.erp.logistics.adapter.LogisticsAdapter;
import com.erp.logistics.dto.LogisticsStatusResponse;
import com.erp.logistics.service.LogisticsTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 物流跟踪服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LogisticsTrackingServiceImpl implements LogisticsTrackingService {

    private final LogisticsAdapter logisticsAdapter;
    private final RedisTemplate<String, String> redisTemplate;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ExecutorService executorService = Executors.newFixedThreadPool(20);

    private static final String STATUS_CACHE_PREFIX = "logistics_status:";
    private static final String ABNORMAL_SET_KEY = "abnormal_trackings";
    private static final String SYNC_QUEUE_KEY = "sync_queue";
    private static final Duration STATUS_CACHE_TTL = Duration.ofMinutes(30);
    
    private volatile boolean scheduledSyncEnabled = true;
    
    // 配置支持 LocalDateTime 的 ObjectMapper
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Override
    public LogisticsStatusResponse queryStatus(String trackingNumber) {
        try {
            log.info("查询物流状态，运单号: {}", trackingNumber);
            
            // 先检查缓存
            LogisticsStatusResponse cachedStatus = getCachedStatus(trackingNumber);
            if (cachedStatus != null && isStatusFresh(cachedStatus)) {
                log.info("从缓存获取物流状态，运单号: {}", trackingNumber);
                return cachedStatus;
            }
            
            // 调用物流适配器查询
            LogisticsStatusResponse response = logisticsAdapter.queryStatus(trackingNumber);
            
            if (response.isSuccess()) {
                // 缓存状态
                cacheStatus(trackingNumber, response);
                
                // 检测异常
                if (detectAbnormalStatus(response)) {
                    markAsAbnormal(trackingNumber);
                    sendAbnormalNotification(trackingNumber, response);
                }
                
                // 异步同步到订单服务
                CompletableFuture.runAsync(() -> syncStatusToOrder(trackingNumber), executorService);
                
                log.info("物流状态查询成功，运单号: {}, 状态: {}", trackingNumber, response.getCurrentStatus());
            } else {
                log.error("物流状态查询失败，运单号: {}, 错误: {}", trackingNumber, response.getErrorMessage());
            }
            
            return response;
            
        } catch (Exception e) {
            log.error("查询物流状态异常，运单号: {}", trackingNumber, e);
            return LogisticsStatusResponse.failure("QUERY_ERROR", "查询物流状态异常: " + e.getMessage());
        }
    }

    @Override
    public Map<String, LogisticsStatusResponse> batchQueryStatus(List<String> trackingNumbers) {
        log.info("批量查询物流状态，数量: {}", trackingNumbers.size());
        
        Map<String, LogisticsStatusResponse> results = new HashMap<>();
        
        // 使用CompletableFuture并行处理
        List<CompletableFuture<Void>> futures = trackingNumbers.stream()
                .map(trackingNumber -> CompletableFuture.runAsync(() -> {
                    try {
                        LogisticsStatusResponse response = queryStatus(trackingNumber);
                        synchronized (results) {
                            results.put(trackingNumber, response);
                        }
                    } catch (Exception e) {
                        log.error("批量查询物流状态失败，运单号: {}", trackingNumber, e);
                        synchronized (results) {
                            results.put(trackingNumber, 
                                LogisticsStatusResponse.failure("BATCH_QUERY_ERROR", "批量查询失败: " + e.getMessage()));
                        }
                    }
                }, executorService))
                .toList();
        
        // 等待所有任务完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        log.info("批量查询物流状态完成，成功: {}, 失败: {}", 
                results.values().stream().mapToLong(r -> r.isSuccess() ? 1 : 0).sum(),
                results.values().stream().mapToLong(r -> r.isSuccess() ? 0 : 1).sum());
        
        return results;
    }

    @Override
    public boolean syncStatusToOrder(String trackingNumber) {
        try {
            log.info("同步物流状态到订单服务，运单号: {}", trackingNumber);
            
            LogisticsStatusResponse status = queryStatus(trackingNumber);
            if (!status.isSuccess()) {
                log.error("无法获取物流状态，同步失败，运单号: {}", trackingNumber);
                return false;
            }
            
            // 发送Kafka消息到订单服务
            Map<String, Object> message = new HashMap<>();
            message.put("trackingNumber", trackingNumber);
            message.put("status", status.getCurrentStatus());
            message.put("statusDescription", status.getStatusDescription());
            message.put("lastUpdateTime", status.getLastUpdateTime());
            message.put("trackingEvents", status.getTrackingEvents());
            
            kafkaTemplate.send("logistics-status-update", trackingNumber, 
                    objectMapper.writeValueAsString(message));
            
            log.info("物流状态同步消息已发送，运单号: {}", trackingNumber);
            return true;
            
        } catch (Exception e) {
            log.error("同步物流状态到订单服务异常，运单号: {}", trackingNumber, e);
            return false;
        }
    }

    @Override
    public Map<String, Boolean> batchSyncStatus(List<String> trackingNumbers) {
        log.info("批量同步物流状态，数量: {}", trackingNumbers.size());
        
        Map<String, Boolean> results = new HashMap<>();
        
        for (String trackingNumber : trackingNumbers) {
            boolean success = syncStatusToOrder(trackingNumber);
            results.put(trackingNumber, success);
        }
        
        long successCount = results.values().stream().mapToLong(r -> r ? 1 : 0).sum();
        log.info("批量同步物流状态完成，成功: {}, 失败: {}", successCount, trackingNumbers.size() - successCount);
        
        return results;
    }

    @Override
    public boolean detectAbnormal(String trackingNumber) {
        try {
            LogisticsStatusResponse status = queryStatus(trackingNumber);
            return status.isSuccess() && detectAbnormalStatus(status);
        } catch (Exception e) {
            log.error("检测物流异常失败，运单号: {}", trackingNumber, e);
            return false;
        }
    }

    @Override
    public List<String> getAbnormalTrackings() {
        try {
            Set<String> abnormalSet = redisTemplate.opsForSet().members(ABNORMAL_SET_KEY);
            return abnormalSet != null ? new ArrayList<>(abnormalSet) : new ArrayList<>();
        } catch (Exception e) {
            log.error("获取异常物流列表失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public boolean handleAbnormal(String trackingNumber, String action) {
        try {
            log.info("处理物流异常，运单号: {}, 动作: {}", trackingNumber, action);
            
            switch (action.toLowerCase()) {
                case "resolve":
                    // 标记为已解决
                    redisTemplate.opsForSet().remove(ABNORMAL_SET_KEY, trackingNumber);
                    sendAbnormalResolvedNotification(trackingNumber);
                    break;
                case "escalate":
                    // 升级处理
                    sendEscalationNotification(trackingNumber);
                    break;
                case "ignore":
                    // 忽略异常
                    redisTemplate.opsForSet().remove(ABNORMAL_SET_KEY, trackingNumber);
                    break;
                default:
                    log.warn("未知的异常处理动作: {}", action);
                    return false;
            }
            
            log.info("物流异常处理完成，运单号: {}, 动作: {}", trackingNumber, action);
            return true;
            
        } catch (Exception e) {
            log.error("处理物流异常失败，运单号: {}, 动作: {}", trackingNumber, action, e);
            return false;
        }
    }

    @Override
    public void startScheduledSync() {
        scheduledSyncEnabled = true;
        log.info("定时同步任务已启动");
    }

    @Override
    public void stopScheduledSync() {
        scheduledSyncEnabled = false;
        log.info("定时同步任务已停止");
    }

    /**
     * 定时同步物流状态
     * 每5分钟执行一次
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void scheduledStatusSync() {
        if (!scheduledSyncEnabled) {
            return;
        }
        
        try {
            log.info("开始定时同步物流状态");
            
            // 获取需要同步的运单号列表
            List<String> trackingNumbers = getPendingSyncTrackings();
            
            if (trackingNumbers.isEmpty()) {
                log.info("没有需要同步的物流状态");
                return;
            }
            
            log.info("定时同步物流状态，数量: {}", trackingNumbers.size());
            
            // 批量查询和同步
            batchQueryStatus(trackingNumbers);
            
            log.info("定时同步物流状态完成");
            
        } catch (Exception e) {
            log.error("定时同步物流状态异常", e);
        }
    }

    /**
     * 定时检测异常物流
     * 每10分钟执行一次
     */
    @Scheduled(fixedRate = 600000) // 10分钟
    public void scheduledAbnormalDetection() {
        if (!scheduledSyncEnabled) {
            return;
        }
        
        try {
            log.info("开始定时检测异常物流");
            
            List<String> trackingNumbers = getActiveTrackings();
            
            for (String trackingNumber : trackingNumbers) {
                CompletableFuture.runAsync(() -> {
                    try {
                        detectAbnormal(trackingNumber);
                    } catch (Exception e) {
                        log.error("检测异常物流失败，运单号: {}", trackingNumber, e);
                    }
                }, executorService);
            }
            
            log.info("定时检测异常物流完成，检测数量: {}", trackingNumbers.size());
            
        } catch (Exception e) {
            log.error("定时检测异常物流异常", e);
        }
    }

    /**
     * 检测异常状态
     */
    private boolean detectAbnormalStatus(LogisticsStatusResponse status) {
        if (status.getLastUpdateTime() == null) {
            return false;
        }
        
        // 检测长时间无更新
        LocalDateTime lastUpdate = status.getLastUpdateTime();
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(lastUpdate, now);
        
        // 超过3天无更新视为异常
        if (duration.toDays() > 3) {
            return true;
        }
        
        // 检测异常状态
        String currentStatus = status.getCurrentStatus();
        if (currentStatus != null) {
            String statusLower = currentStatus.toLowerCase();
            if (statusLower.contains("exception") || 
                statusLower.contains("error") || 
                statusLower.contains("failed") ||
                statusLower.contains("returned") ||
                statusLower.contains("lost")) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * 标记为异常
     */
    private void markAsAbnormal(String trackingNumber) {
        try {
            redisTemplate.opsForSet().add(ABNORMAL_SET_KEY, trackingNumber);
            redisTemplate.expire(ABNORMAL_SET_KEY, Duration.ofDays(30));
        } catch (Exception e) {
            log.error("标记异常物流失败，运单号: {}", trackingNumber, e);
        }
    }

    /**
     * 发送异常通知
     */
    private void sendAbnormalNotification(String trackingNumber, LogisticsStatusResponse status) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "LOGISTICS_ABNORMAL");
            notification.put("trackingNumber", trackingNumber);
            notification.put("status", status.getCurrentStatus());
            notification.put("statusDescription", status.getStatusDescription());
            notification.put("lastUpdateTime", status.getLastUpdateTime());
            notification.put("timestamp", LocalDateTime.now());
            
            kafkaTemplate.send("logistics-abnormal-notification", trackingNumber,
                    objectMapper.writeValueAsString(notification));
            
            log.info("异常物流通知已发送，运单号: {}", trackingNumber);
        } catch (Exception e) {
            log.error("发送异常物流通知失败，运单号: {}", trackingNumber, e);
        }
    }

    /**
     * 发送异常解决通知
     */
    private void sendAbnormalResolvedNotification(String trackingNumber) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "LOGISTICS_ABNORMAL_RESOLVED");
            notification.put("trackingNumber", trackingNumber);
            notification.put("timestamp", LocalDateTime.now());
            
            kafkaTemplate.send("logistics-abnormal-resolved", trackingNumber,
                    objectMapper.writeValueAsString(notification));
            
            log.info("异常解决通知已发送，运单号: {}", trackingNumber);
        } catch (Exception e) {
            log.error("发送异常解决通知失败，运单号: {}", trackingNumber, e);
        }
    }

    /**
     * 发送升级通知
     */
    private void sendEscalationNotification(String trackingNumber) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "LOGISTICS_ESCALATION");
            notification.put("trackingNumber", trackingNumber);
            notification.put("timestamp", LocalDateTime.now());
            
            kafkaTemplate.send("logistics-escalation", trackingNumber,
                    objectMapper.writeValueAsString(notification));
            
            log.info("升级通知已发送，运单号: {}", trackingNumber);
        } catch (Exception e) {
            log.error("发送升级通知失败，运单号: {}", trackingNumber, e);
        }
    }

    /**
     * 获取缓存的状态
     */
    private LogisticsStatusResponse getCachedStatus(String trackingNumber) {
        try {
            String cacheKey = STATUS_CACHE_PREFIX + trackingNumber;
            String cachedJson = redisTemplate.opsForValue().get(cacheKey);
            if (cachedJson != null) {
                return objectMapper.readValue(cachedJson, LogisticsStatusResponse.class);
            }
        } catch (Exception e) {
            log.warn("获取缓存物流状态异常，运单号: {}", trackingNumber, e);
        }
        return null;
    }

    /**
     * 缓存状态
     */
    private void cacheStatus(String trackingNumber, LogisticsStatusResponse status) {
        try {
            String cacheKey = STATUS_CACHE_PREFIX + trackingNumber;
            String statusJson = objectMapper.writeValueAsString(status);
            redisTemplate.opsForValue().set(cacheKey, statusJson, STATUS_CACHE_TTL);
        } catch (Exception e) {
            log.warn("缓存物流状态异常，运单号: {}", trackingNumber, e);
        }
    }

    /**
     * 检查状态是否新鲜
     */
    private boolean isStatusFresh(LogisticsStatusResponse status) {
        if (status.getLastUpdateTime() == null) {
            return false;
        }
        
        Duration age = Duration.between(status.getLastUpdateTime(), LocalDateTime.now());
        return age.toMinutes() < 30; // 30分钟内的状态认为是新鲜的
    }

    /**
     * 获取待同步的运单号列表
     */
    private List<String> getPendingSyncTrackings() {
        try {
            // 这里应该从数据库或缓存中获取需要同步的运单号
            // 为了演示，返回一个模拟的列表
            List<String> trackings = redisTemplate.opsForList().range(SYNC_QUEUE_KEY, 0, 100);
            return trackings != null ? trackings : new ArrayList<>();
        } catch (Exception e) {
            log.error("获取待同步运单号列表失败", e);
            return new ArrayList<>();
        }
    }

    /**
     * 获取活跃的运单号列表
     */
    private List<String> getActiveTrackings() {
        try {
            // 这里应该从数据库中获取活跃的运单号
            // 为了演示，返回一个模拟的列表
            return Arrays.asList("YE123456789", "YE987654321", "YE456789123");
        } catch (Exception e) {
            log.error("获取活跃运单号列表失败", e);
            return new ArrayList<>();
        }
    }
}