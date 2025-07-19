package com.erp.order.service;

import com.erp.order.dto.OrderQueryDTO;
import com.erp.order.entity.Order;

import java.util.List;
import java.util.Map;

/**
 * 订单批量处理服务接口
 *
 * @author ERP System
 */
public interface OrderBatchService {

    /**
     * 批量确认订单
     *
     * @param orderIds 订单ID列表
     * @param operator 操作人
     * @return 处理结果
     */
    BatchProcessResult batchConfirmOrders(List<Long> orderIds, String operator);

    /**
     * 批量发货订单
     *
     * @param orderShippingMap 订单发货信息映射 (订单ID -> 物流信息)
     * @param operator 操作人
     * @return 处理结果
     */
    BatchProcessResult batchShipOrders(Map<Long, ShippingInfo> orderShippingMap, String operator);

    /**
     * 批量取消订单
     *
     * @param orderIds 订单ID列表
     * @param reason 取消原因
     * @param operator 操作人
     * @return 处理结果
     */
    BatchProcessResult batchCancelOrders(List<Long> orderIds, String reason, String operator);

    /**
     * 批量更新订单状态
     *
     * @param orderIds 订单ID列表
     * @param status 新状态
     * @param reason 变更原因
     * @param operator 操作人
     * @return 处理结果
     */
    BatchProcessResult batchUpdateOrderStatus(List<Long> orderIds, Order.OrderStatus status, String reason, String operator);

    /**
     * 批量导出订单数据
     *
     * @param query 查询条件
     * @param exportFormat 导出格式 (EXCEL, CSV)
     * @return 导出文件路径
     */
    String batchExportOrders(OrderQueryDTO query, ExportFormat exportFormat);

    /**
     * 批量打印订单
     *
     * @param orderIds 订单ID列表
     * @param printTemplate 打印模板
     * @return 打印任务ID
     */
    String batchPrintOrders(List<Long> orderIds, String printTemplate);

    /**
     * 获取批量处理任务状态
     *
     * @param taskId 任务ID
     * @return 任务状态
     */
    BatchTaskStatus getBatchTaskStatus(String taskId);

    /**
     * 取消批量处理任务
     *
     * @param taskId 任务ID
     * @return 是否成功
     */
    boolean cancelBatchTask(String taskId);

    /**
     * 批量处理结果
     */
    class BatchProcessResult {
        private String taskId;
        private int totalCount;
        private int successCount;
        private int failureCount;
        private List<String> errorMessages;
        private String status;

        // Constructors
        public BatchProcessResult() {}

        public BatchProcessResult(String taskId, int totalCount) {
            this.taskId = taskId;
            this.totalCount = totalCount;
            this.successCount = 0;
            this.failureCount = 0;
            this.status = "PROCESSING";
        }

        // Getters and Setters
        public String getTaskId() { return taskId; }
        public void setTaskId(String taskId) { this.taskId = taskId; }
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
        public int getSuccessCount() { return successCount; }
        public void setSuccessCount(int successCount) { this.successCount = successCount; }
        public int getFailureCount() { return failureCount; }
        public void setFailureCount(int failureCount) { this.failureCount = failureCount; }
        public List<String> getErrorMessages() { return errorMessages; }
        public void setErrorMessages(List<String> errorMessages) { this.errorMessages = errorMessages; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    /**
     * 发货信息
     */
    class ShippingInfo {
        private String trackingNumber;
        private String shippingMethod;

        public ShippingInfo() {}

        public ShippingInfo(String trackingNumber, String shippingMethod) {
            this.trackingNumber = trackingNumber;
            this.shippingMethod = shippingMethod;
        }

        // Getters and Setters
        public String getTrackingNumber() { return trackingNumber; }
        public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
        public String getShippingMethod() { return shippingMethod; }
        public void setShippingMethod(String shippingMethod) { this.shippingMethod = shippingMethod; }
    }

    /**
     * 导出格式枚举
     */
    enum ExportFormat {
        EXCEL, CSV, PDF
    }

    /**
     * 批量任务状态
     */
    class BatchTaskStatus {
        private String taskId;
        private String status;
        private int totalCount;
        private int processedCount;
        private int successCount;
        private int failureCount;
        private String startTime;
        private String endTime;
        private String errorMessage;

        // Getters and Setters
        public String getTaskId() { return taskId; }
        public void setTaskId(String taskId) { this.taskId = taskId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
        public int getProcessedCount() { return processedCount; }
        public void setProcessedCount(int processedCount) { this.processedCount = processedCount; }
        public int getSuccessCount() { return successCount; }
        public void setSuccessCount(int successCount) { this.successCount = successCount; }
        public int getFailureCount() { return failureCount; }
        public void setFailureCount(int failureCount) { this.failureCount = failureCount; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }
}