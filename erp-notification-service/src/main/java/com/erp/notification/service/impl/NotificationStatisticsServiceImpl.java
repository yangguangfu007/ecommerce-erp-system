package com.erp.notification.service.impl;

import com.erp.notification.entity.NotificationRecord;
import com.erp.notification.mapper.NotificationRecordMapper;
import com.erp.notification.service.NotificationStatisticsService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 通知统计服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationStatisticsServiceImpl implements NotificationStatisticsService {

    private final NotificationRecordMapper recordMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String PERFORMANCE_KEY_PREFIX = "notification_performance:";
    private static final String DAILY_STATS_KEY_PREFIX = "notification_daily_stats:";

    @Override
    public Map<String, Object> getNotificationStatistics(LocalDate startDate, LocalDate endDate) {
        log.info("获取通知统计: startDate={}, endDate={}", startDate, endDate);

        QueryWrapper<NotificationRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.between("created_at", startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        List<NotificationRecord> records = recordMapper.selectList(queryWrapper);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalCount", records.size());
        statistics.put("successCount", records.stream().filter(r -> "SUCCESS".equals(r.getStatus())).count());
        statistics.put("failedCount", records.stream().filter(r -> "FAILED".equals(r.getStatus())).count());
        statistics.put("pendingCount", records.stream().filter(r -> "PENDING".equals(r.getStatus())).count());
        statistics.put("sendingCount", records.stream().filter(r -> "SENDING".equals(r.getStatus())).count());

        // 计算成功率
        long totalCount = records.size();
        long successCount = (Long) statistics.get("successCount");
        double successRate = totalCount > 0 ? (double) successCount / totalCount * 100 : 0.0;
        statistics.put("successRate", Math.round(successRate * 100.0) / 100.0);

        return statistics;
    }

    @Override
    public Map<String, Long> getNotificationTypeStatistics(LocalDate startDate, LocalDate endDate) {
        QueryWrapper<NotificationRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.between("created_at", startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        List<NotificationRecord> records = recordMapper.selectList(queryWrapper);

        return records.stream()
                .collect(Collectors.groupingBy(
                        NotificationRecord::getNotificationType,
                        Collectors.counting()
                ));
    }

    @Override
    public Map<String, Long> getNotificationStatusStatistics(LocalDate startDate, LocalDate endDate) {
        QueryWrapper<NotificationRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.between("created_at", startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        List<NotificationRecord> records = recordMapper.selectList(queryWrapper);

        return records.stream()
                .collect(Collectors.groupingBy(
                        NotificationRecord::getStatus,
                        Collectors.counting()
                ));
    }

    @Override
    public Map<String, Long> getBusinessTypeStatistics(LocalDate startDate, LocalDate endDate) {
        QueryWrapper<NotificationRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.between("created_at", startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay())
                   .isNotNull("business_type");

        List<NotificationRecord> records = recordMapper.selectList(queryWrapper);

        return records.stream()
                .filter(r -> r.getBusinessType() != null)
                .collect(Collectors.groupingBy(
                        NotificationRecord::getBusinessType,
                        Collectors.counting()
                ));
    }

    @Override
    public Double getNotificationSuccessRate(LocalDate startDate, LocalDate endDate) {
        QueryWrapper<NotificationRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.between("created_at", startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        List<NotificationRecord> records = recordMapper.selectList(queryWrapper);

        if (records.isEmpty()) {
            return 0.0;
        }

        long successCount = records.stream()
                .filter(r -> "SUCCESS".equals(r.getStatus()))
                .count();

        return (double) successCount / records.size() * 100;
    }

    @Override
    public Map<String, Map<String, Long>> getDailyNotificationTrend(LocalDate startDate, LocalDate endDate) {
        QueryWrapper<NotificationRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.between("created_at", startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        List<NotificationRecord> records = recordMapper.selectList(queryWrapper);

        Map<String, Map<String, Long>> dailyTrend = new LinkedHashMap<>();

        // 初始化所有日期
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            String dateStr = currentDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            dailyTrend.put(dateStr, new HashMap<>());
            currentDate = currentDate.plusDays(1);
        }

        // 统计每日数据
        for (NotificationRecord record : records) {
            String dateStr = record.getCreateTime().toLocalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            Map<String, Long> dayStats = dailyTrend.get(dateStr);
            if (dayStats != null) {
                dayStats.put("total", dayStats.getOrDefault("total", 0L) + 1);
                dayStats.put(record.getStatus().toLowerCase(), 
                           dayStats.getOrDefault(record.getStatus().toLowerCase(), 0L) + 1);
            }
        }

        return dailyTrend;
    }

    @Override
    public Map<String, Object> getFailedNotificationStatistics(LocalDate startDate, LocalDate endDate) {
        QueryWrapper<NotificationRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.between("created_at", startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay())
                   .eq("status", "FAILED");

        List<NotificationRecord> failedRecords = recordMapper.selectList(queryWrapper);

        Map<String, Object> failedStats = new HashMap<>();
        failedStats.put("totalFailedCount", failedRecords.size());

        // 按通知类型统计失败数量
        Map<String, Long> failedByType = failedRecords.stream()
                .collect(Collectors.groupingBy(
                        NotificationRecord::getNotificationType,
                        Collectors.counting()
                ));
        failedStats.put("failedByType", failedByType);

        // 按业务类型统计失败数量
        Map<String, Long> failedByBusiness = failedRecords.stream()
                .filter(r -> r.getBusinessType() != null)
                .collect(Collectors.groupingBy(
                        NotificationRecord::getBusinessType,
                        Collectors.counting()
                ));
        failedStats.put("failedByBusiness", failedByBusiness);

        // 统计常见错误信息
        Map<String, Long> errorMessages = failedRecords.stream()
                .filter(r -> r.getErrorMessage() != null)
                .collect(Collectors.groupingBy(
                        NotificationRecord::getErrorMessage,
                        Collectors.counting()
                ));
        failedStats.put("commonErrors", errorMessages);

        return failedStats;
    }

    @Override
    public Map<String, Long> getTemplateUsageStatistics(LocalDate startDate, LocalDate endDate) {
        QueryWrapper<NotificationRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.between("created_at", startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay())
                   .isNotNull("template_id");

        List<NotificationRecord> records = recordMapper.selectList(queryWrapper);

        return records.stream()
                .filter(r -> r.getTemplateId() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getTemplateId().toString(),
                        Collectors.counting()
                ));
    }

    @Override
    public void recordPerformanceMetrics(String notificationType, long sendDuration, boolean success) {
        try {
            String key = PERFORMANCE_KEY_PREFIX + notificationType + ":" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            
            // 记录发送耗时
            redisTemplate.opsForList().rightPush(key + ":durations", sendDuration);
            redisTemplate.expire(key + ":durations", 7, TimeUnit.DAYS);
            
            // 记录成功/失败次数
            if (success) {
                redisTemplate.opsForValue().increment(key + ":success");
            } else {
                redisTemplate.opsForValue().increment(key + ":failed");
            }
            redisTemplate.expire(key + ":success", 7, TimeUnit.DAYS);
            redisTemplate.expire(key + ":failed", 7, TimeUnit.DAYS);
            
        } catch (Exception e) {
            log.error("记录性能指标失败: type={}, duration={}, success={}", notificationType, sendDuration, success, e);
        }
    }

    @Override
    public Map<String, Object> getPerformanceStatistics(String notificationType, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> performanceStats = new HashMap<>();
        
        List<Long> allDurations = new ArrayList<>();
        long totalSuccess = 0;
        long totalFailed = 0;
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            String dateKey = currentDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String key = PERFORMANCE_KEY_PREFIX + notificationType + ":" + dateKey;
            
            // 获取耗时数据
            List<Object> durations = redisTemplate.opsForList().range(key + ":durations", 0, -1);
            if (durations != null) {
                allDurations.addAll(durations.stream()
                        .map(d -> Long.valueOf(d.toString()))
                        .collect(Collectors.toList()));
            }
            
            // 获取成功/失败次数
            Object successCount = redisTemplate.opsForValue().get(key + ":success");
            Object failedCount = redisTemplate.opsForValue().get(key + ":failed");
            
            if (successCount != null) {
                totalSuccess += Long.parseLong(successCount.toString());
            }
            if (failedCount != null) {
                totalFailed += Long.parseLong(failedCount.toString());
            }
            
            currentDate = currentDate.plusDays(1);
        }
        
        performanceStats.put("totalSuccess", totalSuccess);
        performanceStats.put("totalFailed", totalFailed);
        performanceStats.put("totalRequests", totalSuccess + totalFailed);
        
        if (!allDurations.isEmpty()) {
            Collections.sort(allDurations);
            performanceStats.put("avgDuration", allDurations.stream().mapToLong(Long::longValue).average().orElse(0.0));
            performanceStats.put("minDuration", allDurations.get(0));
            performanceStats.put("maxDuration", allDurations.get(allDurations.size() - 1));
            performanceStats.put("p50Duration", allDurations.get(allDurations.size() / 2));
            performanceStats.put("p95Duration", allDurations.get((int) (allDurations.size() * 0.95)));
            performanceStats.put("p99Duration", allDurations.get((int) (allDurations.size() * 0.99)));
        }
        
        return performanceStats;
    }
}