package com.erp.order.service.impl;

import com.erp.order.dto.OrderDTO;
import com.erp.order.dto.OrderQueryDTO;
import com.erp.order.entity.Order;
import com.erp.order.service.OrderBatchService;
import com.erp.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * 订单批量处理服务实现类
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderBatchServiceImpl implements OrderBatchService {

    private final OrderService orderService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${order.batch-size:100}")
    private int batchSize;

    private static final String BATCH_TASK_PREFIX = "batch_task:";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public BatchProcessResult batchConfirmOrders(List<Long> orderIds, String operator) {
        log.info("开始批量确认订单，数量: {}, 操作人: {}", orderIds.size(), operator);

        String taskId = generateTaskId("CONFIRM");
        BatchProcessResult result = new BatchProcessResult(taskId, orderIds.size());

        // 保存任务状态到Redis
        saveBatchTaskStatus(taskId, "PROCESSING", orderIds.size(), 0, 0, 0);

        // 异步处理
        processBatchConfirmAsync(taskId, orderIds, operator);

        return result;
    }

    @Override
    public BatchProcessResult batchShipOrders(Map<Long, ShippingInfo> orderShippingMap, String operator) {
        log.info("开始批量发货订单，数量: {}, 操作人: {}", orderShippingMap.size(), operator);

        String taskId = generateTaskId("SHIP");
        BatchProcessResult result = new BatchProcessResult(taskId, orderShippingMap.size());

        // 保存任务状态到Redis
        saveBatchTaskStatus(taskId, "PROCESSING", orderShippingMap.size(), 0, 0, 0);

        // 异步处理
        processBatchShipAsync(taskId, orderShippingMap, operator);

        return result;
    }

    @Override
    public BatchProcessResult batchCancelOrders(List<Long> orderIds, String reason, String operator) {
        log.info("开始批量取消订单，数量: {}, 原因: {}, 操作人: {}", orderIds.size(), reason, operator);

        String taskId = generateTaskId("CANCEL");
        BatchProcessResult result = new BatchProcessResult(taskId, orderIds.size());

        // 保存任务状态到Redis
        saveBatchTaskStatus(taskId, "PROCESSING", orderIds.size(), 0, 0, 0);

        // 异步处理
        processBatchCancelAsync(taskId, orderIds, reason, operator);

        return result;
    }

    @Override
    public BatchProcessResult batchUpdateOrderStatus(List<Long> orderIds, Order.OrderStatus status, String reason, String operator) {
        log.info("开始批量更新订单状态，数量: {}, 新状态: {}, 操作人: {}", orderIds.size(), status, operator);

        String taskId = generateTaskId("UPDATE_STATUS");
        BatchProcessResult result = new BatchProcessResult(taskId, orderIds.size());

        // 保存任务状态到Redis
        saveBatchTaskStatus(taskId, "PROCESSING", orderIds.size(), 0, 0, 0);

        // 异步处理
        processBatchUpdateStatusAsync(taskId, orderIds, status, reason, operator);

        return result;
    }

    @Override
    public String batchExportOrders(OrderQueryDTO query, ExportFormat exportFormat) {
        log.info("开始批量导出订单，格式: {}", exportFormat);

        String taskId = generateTaskId("EXPORT");

        // 异步处理导出
        processBatchExportAsync(taskId, query, exportFormat);

        return taskId;
    }

    @Override
    public String batchPrintOrders(List<Long> orderIds, String printTemplate) {
        log.info("开始批量打印订单，数量: {}, 模板: {}", orderIds.size(), printTemplate);

        String taskId = generateTaskId("PRINT");

        // 保存任务状态到Redis
        saveBatchTaskStatus(taskId, "PROCESSING", orderIds.size(), 0, 0, 0);

        // 异步处理打印
        processBatchPrintAsync(taskId, orderIds, printTemplate);

        return taskId;
    }

    @Override
    public BatchTaskStatus getBatchTaskStatus(String taskId) {
        String key = BATCH_TASK_PREFIX + taskId;
        Map<Object, Object> taskData = redisTemplate.opsForHash().entries(key);

        if (taskData.isEmpty()) {
            return null;
        }

        BatchTaskStatus status = new BatchTaskStatus();
        status.setTaskId(taskId);
        status.setStatus((String) taskData.get("status"));
        status.setTotalCount(Integer.parseInt(taskData.get("totalCount").toString()));
        status.setProcessedCount(Integer.parseInt(taskData.get("processedCount").toString()));
        status.setSuccessCount(Integer.parseInt(taskData.get("successCount").toString()));
        status.setFailureCount(Integer.parseInt(taskData.get("failureCount").toString()));
        status.setStartTime((String) taskData.get("startTime"));
        status.setEndTime((String) taskData.get("endTime"));
        status.setErrorMessage((String) taskData.get("errorMessage"));

        return status;
    }

    @Override
    public boolean cancelBatchTask(String taskId) {
        log.info("取消批量处理任务: {}", taskId);

        String key = BATCH_TASK_PREFIX + taskId;
        if (!redisTemplate.hasKey(key)) {
            return false;
        }

        // 更新任务状态为已取消
        redisTemplate.opsForHash().put(key, "status", "CANCELLED");
        redisTemplate.opsForHash().put(key, "endTime", LocalDateTime.now().format(DATE_FORMATTER));

        return true;
    }

    /**
     * 异步处理批量确认
     */
    @Async
    public void processBatchConfirmAsync(String taskId, List<Long> orderIds, String operator) {
        log.info("异步处理批量确认订单，任务ID: {}", taskId);

        int successCount = 0;
        int failureCount = 0;
        List<String> errorMessages = new ArrayList<>();

        try {
            for (int i = 0; i < orderIds.size(); i++) {
                // 检查任务是否被取消
                if (isTaskCancelled(taskId)) {
                    log.info("批量确认任务被取消，任务ID: {}", taskId);
                    break;
                }

                Long orderId = orderIds.get(i);
                try {
                    boolean success = orderService.confirmOrder(orderId, operator);
                    if (success) {
                        successCount++;
                    } else {
                        failureCount++;
                        errorMessages.add("订单确认失败: " + orderId);
                    }
                } catch (Exception e) {
                    failureCount++;
                    errorMessages.add("订单确认异常: " + orderId + " - " + e.getMessage());
                    log.error("确认订单失败，订单ID: {}", orderId, e);
                }

                // 更新进度
                updateBatchTaskProgress(taskId, i + 1, successCount, failureCount);

                // 批量处理间隔，避免过载
                if ((i + 1) % batchSize == 0) {
                    Thread.sleep(100);
                }
            }

            // 完成任务
            completeBatchTask(taskId, successCount, failureCount, errorMessages);

        } catch (Exception e) {
            log.error("批量确认订单异常，任务ID: {}", taskId, e);
            failBatchTask(taskId, e.getMessage());
        }
    }

    /**
     * 异步处理批量发货
     */
    @Async
    public void processBatchShipAsync(String taskId, Map<Long, ShippingInfo> orderShippingMap, String operator) {
        log.info("异步处理批量发货订单，任务ID: {}", taskId);

        int successCount = 0;
        int failureCount = 0;
        List<String> errorMessages = new ArrayList<>();

        try {
            List<Long> orderIds = new ArrayList<>(orderShippingMap.keySet());
            for (int i = 0; i < orderIds.size(); i++) {
                // 检查任务是否被取消
                if (isTaskCancelled(taskId)) {
                    log.info("批量发货任务被取消，任务ID: {}", taskId);
                    break;
                }

                Long orderId = orderIds.get(i);
                ShippingInfo shippingInfo = orderShippingMap.get(orderId);

                try {
                    boolean success = orderService.shipOrder(orderId, 
                            shippingInfo.getTrackingNumber(), 
                            shippingInfo.getShippingMethod(), 
                            operator);
                    if (success) {
                        successCount++;
                    } else {
                        failureCount++;
                        errorMessages.add("订单发货失败: " + orderId);
                    }
                } catch (Exception e) {
                    failureCount++;
                    errorMessages.add("订单发货异常: " + orderId + " - " + e.getMessage());
                    log.error("发货订单失败，订单ID: {}", orderId, e);
                }

                // 更新进度
                updateBatchTaskProgress(taskId, i + 1, successCount, failureCount);

                // 批量处理间隔
                if ((i + 1) % batchSize == 0) {
                    Thread.sleep(100);
                }
            }

            // 完成任务
            completeBatchTask(taskId, successCount, failureCount, errorMessages);

        } catch (Exception e) {
            log.error("批量发货订单异常，任务ID: {}", taskId, e);
            failBatchTask(taskId, e.getMessage());
        }
    }

    /**
     * 异步处理批量取消
     */
    @Async
    public void processBatchCancelAsync(String taskId, List<Long> orderIds, String reason, String operator) {
        log.info("异步处理批量取消订单，任务ID: {}", taskId);

        int successCount = 0;
        int failureCount = 0;
        List<String> errorMessages = new ArrayList<>();

        try {
            for (int i = 0; i < orderIds.size(); i++) {
                // 检查任务是否被取消
                if (isTaskCancelled(taskId)) {
                    log.info("批量取消任务被取消，任务ID: {}", taskId);
                    break;
                }

                Long orderId = orderIds.get(i);
                try {
                    boolean success = orderService.cancelOrder(orderId, reason, operator);
                    if (success) {
                        successCount++;
                    } else {
                        failureCount++;
                        errorMessages.add("订单取消失败: " + orderId);
                    }
                } catch (Exception e) {
                    failureCount++;
                    errorMessages.add("订单取消异常: " + orderId + " - " + e.getMessage());
                    log.error("取消订单失败，订单ID: {}", orderId, e);
                }

                // 更新进度
                updateBatchTaskProgress(taskId, i + 1, successCount, failureCount);

                // 批量处理间隔
                if ((i + 1) % batchSize == 0) {
                    Thread.sleep(100);
                }
            }

            // 完成任务
            completeBatchTask(taskId, successCount, failureCount, errorMessages);

        } catch (Exception e) {
            log.error("批量取消订单异常，任务ID: {}", taskId, e);
            failBatchTask(taskId, e.getMessage());
        }
    }

    /**
     * 异步处理批量状态更新
     */
    @Async
    public void processBatchUpdateStatusAsync(String taskId, List<Long> orderIds, Order.OrderStatus status, String reason, String operator) {
        log.info("异步处理批量更新订单状态，任务ID: {}", taskId);

        int successCount = 0;
        int failureCount = 0;
        List<String> errorMessages = new ArrayList<>();

        try {
            for (int i = 0; i < orderIds.size(); i++) {
                // 检查任务是否被取消
                if (isTaskCancelled(taskId)) {
                    log.info("批量状态更新任务被取消，任务ID: {}", taskId);
                    break;
                }

                Long orderId = orderIds.get(i);
                try {
                    boolean success = orderService.updateOrderStatus(orderId, status, reason, operator);
                    if (success) {
                        successCount++;
                    } else {
                        failureCount++;
                        errorMessages.add("订单状态更新失败: " + orderId);
                    }
                } catch (Exception e) {
                    failureCount++;
                    errorMessages.add("订单状态更新异常: " + orderId + " - " + e.getMessage());
                    log.error("更新订单状态失败，订单ID: {}", orderId, e);
                }

                // 更新进度
                updateBatchTaskProgress(taskId, i + 1, successCount, failureCount);

                // 批量处理间隔
                if ((i + 1) % batchSize == 0) {
                    Thread.sleep(100);
                }
            }

            // 完成任务
            completeBatchTask(taskId, successCount, failureCount, errorMessages);

        } catch (Exception e) {
            log.error("批量更新订单状态异常，任务ID: {}", taskId, e);
            failBatchTask(taskId, e.getMessage());
        }
    }

    /**
     * 异步处理批量导出
     */
    @Async
    public void processBatchExportAsync(String taskId, OrderQueryDTO query, ExportFormat exportFormat) {
        log.info("异步处理批量导出订单，任务ID: {}, 格式: {}", taskId, exportFormat);

        try {
            // 查询订单数据
            List<OrderDTO> orders = orderService.getOrderList(query);
            
            // 保存任务状态
            saveBatchTaskStatus(taskId, "PROCESSING", orders.size(), 0, 0, 0);

            // 生成导出文件
            String filePath = generateExportFile(orders, exportFormat, taskId);

            // 更新任务状态为完成
            String key = BATCH_TASK_PREFIX + taskId;
            redisTemplate.opsForHash().put(key, "status", "COMPLETED");
            redisTemplate.opsForHash().put(key, "processedCount", orders.size());
            redisTemplate.opsForHash().put(key, "successCount", orders.size());
            redisTemplate.opsForHash().put(key, "endTime", LocalDateTime.now().format(DATE_FORMATTER));
            redisTemplate.opsForHash().put(key, "filePath", filePath);

            log.info("批量导出订单完成，任务ID: {}, 文件路径: {}", taskId, filePath);

        } catch (Exception e) {
            log.error("批量导出订单异常，任务ID: {}", taskId, e);
            failBatchTask(taskId, e.getMessage());
        }
    }

    /**
     * 异步处理批量打印
     */
    @Async
    public void processBatchPrintAsync(String taskId, List<Long> orderIds, String printTemplate) {
        log.info("异步处理批量打印订单，任务ID: {}", taskId);

        int successCount = 0;
        int failureCount = 0;

        try {
            for (int i = 0; i < orderIds.size(); i++) {
                if (isTaskCancelled(taskId)) {
                    break;
                }

                Long orderId = orderIds.get(i);
                try {
                    // 这里应该调用打印服务
                    boolean success = printOrder(orderId, printTemplate);
                    if (success) {
                        successCount++;
                    } else {
                        failureCount++;
                    }
                } catch (Exception e) {
                    failureCount++;
                    log.error("打印订单失败，订单ID: {}", orderId, e);
                }

                updateBatchTaskProgress(taskId, i + 1, successCount, failureCount);
            }

            completeBatchTask(taskId, successCount, failureCount, new ArrayList<>());

        } catch (Exception e) {
            log.error("批量打印订单异常，任务ID: {}", taskId, e);
            failBatchTask(taskId, e.getMessage());
        }
    }

    /**
     * 生成任务ID
     */
    private String generateTaskId(String operation) {
        return operation + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    /**
     * 保存批量任务状态
     */
    private void saveBatchTaskStatus(String taskId, String status, int totalCount, int processedCount, int successCount, int failureCount) {
        String key = BATCH_TASK_PREFIX + taskId;
        Map<String, Object> taskData = new HashMap<>();
        taskData.put("status", status);
        taskData.put("totalCount", totalCount);
        taskData.put("processedCount", processedCount);
        taskData.put("successCount", successCount);
        taskData.put("failureCount", failureCount);
        taskData.put("startTime", LocalDateTime.now().format(DATE_FORMATTER));

        redisTemplate.opsForHash().putAll(key, taskData);
        redisTemplate.expire(key, 24, TimeUnit.HOURS); // 24小时过期
    }

    /**
     * 更新批量任务进度
     */
    private void updateBatchTaskProgress(String taskId, int processedCount, int successCount, int failureCount) {
        String key = BATCH_TASK_PREFIX + taskId;
        redisTemplate.opsForHash().put(key, "processedCount", processedCount);
        redisTemplate.opsForHash().put(key, "successCount", successCount);
        redisTemplate.opsForHash().put(key, "failureCount", failureCount);
    }

    /**
     * 完成批量任务
     */
    private void completeBatchTask(String taskId, int successCount, int failureCount, List<String> errorMessages) {
        String key = BATCH_TASK_PREFIX + taskId;
        redisTemplate.opsForHash().put(key, "status", "COMPLETED");
        redisTemplate.opsForHash().put(key, "successCount", successCount);
        redisTemplate.opsForHash().put(key, "failureCount", failureCount);
        redisTemplate.opsForHash().put(key, "endTime", LocalDateTime.now().format(DATE_FORMATTER));
        
        if (!errorMessages.isEmpty()) {
            redisTemplate.opsForHash().put(key, "errorMessages", String.join("; ", errorMessages));
        }

        log.info("批量任务完成，任务ID: {}, 成功: {}, 失败: {}", taskId, successCount, failureCount);
    }

    /**
     * 任务失败
     */
    private void failBatchTask(String taskId, String errorMessage) {
        String key = BATCH_TASK_PREFIX + taskId;
        redisTemplate.opsForHash().put(key, "status", "FAILED");
        redisTemplate.opsForHash().put(key, "errorMessage", errorMessage);
        redisTemplate.opsForHash().put(key, "endTime", LocalDateTime.now().format(DATE_FORMATTER));
    }

    /**
     * 检查任务是否被取消
     */
    private boolean isTaskCancelled(String taskId) {
        String key = BATCH_TASK_PREFIX + taskId;
        Object status = redisTemplate.opsForHash().get(key, "status");
        return "CANCELLED".equals(status);
    }

    /**
     * 生成导出文件
     */
    private String generateExportFile(List<OrderDTO> orders, ExportFormat format, String taskId) {
        // 这里应该实现具体的文件生成逻辑
        String fileName = "orders_export_" + taskId + "." + format.name().toLowerCase();
        String filePath = "/tmp/exports/" + fileName;
        
        // 模拟文件生成
        log.info("生成导出文件: {}, 订单数量: {}", filePath, orders.size());
        
        return filePath;
    }

    /**
     * 打印订单
     */
    private boolean printOrder(Long orderId, String printTemplate) {
        // 这里应该调用打印服务
        log.debug("打印订单: {}, 模板: {}", orderId, printTemplate);
        return true;
    }
}