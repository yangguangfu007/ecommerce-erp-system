package com.erp.notification.event;

import com.erp.notification.dto.NotificationRequest;
import com.erp.notification.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 通知事件监听器
 *
 * @author ERP System
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    /**
     * 监听订单状态变更事件
     */
    @KafkaListener(topics = "order-status-change", groupId = "notification-service")
    public void handleOrderStatusChange(String message) {
        try {
            log.info("接收到订单状态变更事件: {}", message);

            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(message, Map.class);
            
            String orderId = (String) event.get("orderId");
            String orderNumber = (String) event.get("orderNumber");
            String oldStatus = (String) event.get("oldStatus");
            String newStatus = (String) event.get("newStatus");
            String customerEmail = (String) event.get("customerEmail");
            String productName = (String) event.get("productName");
            Integer quantity = (Integer) event.get("quantity");
            String amount = (String) event.get("amount");

            // 准备模板变量
            Map<String, Object> variables = new HashMap<>();
            variables.put("orderNumber", orderNumber);
            variables.put("orderStatus", newStatus);
            variables.put("productName", productName);
            variables.put("quantity", quantity);
            variables.put("amount", amount);

            // 发送邮件通知给客户
            if (customerEmail != null && !customerEmail.isEmpty()) {
                notificationService.sendNotificationByTemplate(
                    "ORDER_STATUS_CHANGE_EMAIL",
                    customerEmail,
                    variables,
                    "ORDER_STATUS_CHANGE",
                    orderId
                );
            }

            // 发送系统内通知给管理员
            notificationService.sendNotificationByTemplate(
                "ORDER_STATUS_CHANGE_SYSTEM",
                "1", // 管理员用户ID
                variables,
                "ORDER_STATUS_CHANGE",
                orderId
            );

            log.info("订单状态变更通知发送完成: orderId={}, status={}", orderId, newStatus);

        } catch (Exception e) {
            log.error("处理订单状态变更事件失败: {}", message, e);
        }
    }

    /**
     * 监听库存预警事件
     */
    @KafkaListener(topics = "inventory-alert", groupId = "notification-service")
    public void handleInventoryAlert(String message) {
        try {
            log.info("接收到库存预警事件: {}", message);

            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(message, Map.class);
            
            String sku = (String) event.get("sku");
            String productName = (String) event.get("productName");
            Integer currentStock = (Integer) event.get("currentStock");
            Integer safetyStock = (Integer) event.get("safetyStock");
            String storeId = (String) event.get("storeId");

            // 准备模板变量
            Map<String, Object> variables = new HashMap<>();
            variables.put("sku", sku);
            variables.put("productName", productName);
            variables.put("currentStock", currentStock);
            variables.put("safetyStock", safetyStock);

            // 发送邮件预警给管理员
            notificationService.sendNotificationByTemplate(
                "INVENTORY_ALERT_EMAIL",
                "admin@example.com",
                variables,
                "INVENTORY_ALERT",
                sku
            );

            // 发送系统内预警
            notificationService.sendNotificationByTemplate(
                "INVENTORY_ALERT_SYSTEM",
                "1", // 管理员用户ID
                variables,
                "INVENTORY_ALERT",
                sku
            );

            log.info("库存预警通知发送完成: sku={}, currentStock={}", sku, currentStock);

        } catch (Exception e) {
            log.error("处理库存预警事件失败: {}", message, e);
        }
    }

    /**
     * 监听系统异常事件
     */
    @KafkaListener(topics = "system-error", groupId = "notification-service")
    public void handleSystemError(String message) {
        try {
            log.info("接收到系统异常事件: {}", message);

            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(message, Map.class);
            
            String errorType = (String) event.get("errorType");
            String errorMessage = (String) event.get("errorMessage");
            String occurTime = (String) event.get("occurTime");
            String serviceName = (String) event.get("serviceName");

            // 准备模板变量
            Map<String, Object> variables = new HashMap<>();
            variables.put("errorType", errorType);
            variables.put("errorMessage", errorMessage);
            variables.put("occurTime", occurTime);
            variables.put("serviceName", serviceName);

            // 发送邮件告警给管理员
            notificationService.sendNotificationByTemplate(
                "SYSTEM_ERROR_EMAIL",
                "admin@example.com",
                variables,
                "SYSTEM_ERROR",
                serviceName + "_" + System.currentTimeMillis()
            );

            log.info("系统异常告警发送完成: errorType={}, serviceName={}", errorType, serviceName);

        } catch (Exception e) {
            log.error("处理系统异常事件失败: {}", message, e);
        }
    }

    /**
     * 监听安全事件
     */
    @KafkaListener(topics = "security-alert", groupId = "notification-service")
    public void handleSecurityAlert(String message) {
        try {
            log.info("接收到安全事件: {}", message);

            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(message, Map.class);
            
            String eventType = (String) event.get("eventType");
            String eventDescription = (String) event.get("eventDescription");
            String occurTime = (String) event.get("occurTime");
            String username = (String) event.get("username");
            String ipAddress = (String) event.get("ipAddress");

            // 准备模板变量
            Map<String, Object> variables = new HashMap<>();
            variables.put("eventType", eventType);
            variables.put("eventDescription", eventDescription);
            variables.put("occurTime", occurTime);
            variables.put("username", username);
            variables.put("ipAddress", ipAddress);

            // 发送邮件告警给管理员
            notificationService.sendNotificationByTemplate(
                "SECURITY_ALERT_EMAIL",
                "admin@example.com",
                variables,
                "SECURITY_ALERT",
                username + "_" + System.currentTimeMillis()
            );

            // 发送系统内告警
            notificationService.sendNotificationByTemplate(
                "SECURITY_ALERT_SYSTEM",
                "1", // 管理员用户ID
                variables,
                "SECURITY_ALERT",
                username + "_" + System.currentTimeMillis()
            );

            log.info("安全事件告警发送完成: eventType={}, username={}", eventType, username);

        } catch (Exception e) {
            log.error("处理安全事件失败: {}", message, e);
        }
    }
}