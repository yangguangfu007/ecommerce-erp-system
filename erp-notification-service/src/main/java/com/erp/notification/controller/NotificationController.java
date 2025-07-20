package com.erp.notification.controller;

import com.erp.notification.dto.NotificationRequest;
import com.erp.notification.entity.NotificationRecord;
import com.erp.notification.entity.NotificationTemplate;
import com.erp.notification.service.NotificationService;
import com.erp.notification.service.TemplateService;
import com.erp.common.response.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 通知控制器
 *
 * @author ERP System
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final TemplateService templateService;

    /**
     * 发送通知
     */
    @PostMapping("/send")
    public Result<Long> sendNotification(@RequestBody NotificationRequest request) {
        log.info("接收发送通知请求: {}", request);
        Long recordId = notificationService.sendNotification(request);
        return Result.success(recordId);
    }

    /**
     * 批量发送通知
     */
    @PostMapping("/batch-send")
    public Result<List<Long>> batchSendNotification(@RequestBody List<NotificationRequest> requests) {
        log.info("接收批量发送通知请求，数量: {}", requests.size());
        List<Long> recordIds = notificationService.batchSendNotification(requests);
        return Result.success(recordIds);
    }

    /**
     * 根据模板发送通知
     */
    @PostMapping("/send-by-template")
    public Result<Long> sendNotificationByTemplate(
            @RequestParam String templateCode,
            @RequestParam String recipient,
            @RequestBody Map<String, Object> variables,
            @RequestParam(required = false) String businessType,
            @RequestParam(required = false) String businessId) {
        
        log.info("根据模板发送通知: templateCode={}, recipient={}", templateCode, recipient);
        Long recordId = notificationService.sendNotificationByTemplate(
                templateCode, recipient, variables, businessType, businessId);
        return Result.success(recordId);
    }

    /**
     * 重试通知
     */
    @PostMapping("/{recordId}/retry")
    public Result<Boolean> retryNotification(@PathVariable Long recordId) {
        log.info("重试通知: recordId={}", recordId);
        boolean success = notificationService.retryNotification(recordId);
        return Result.success(success);
    }

    /**
     * 获取通知记录
     */
    @GetMapping("/{recordId}")
    public Result<NotificationRecord> getNotificationRecord(@PathVariable Long recordId) {
        NotificationRecord record = notificationService.getNotificationRecord(recordId);
        return Result.success(record);
    }

    /**
     * 获取业务相关的通知记录
     */
    @GetMapping("/business/{businessType}/{businessId}")
    public Result<List<NotificationRecord>> getNotificationRecords(
            @PathVariable String businessType,
            @PathVariable String businessId) {
        
        List<NotificationRecord> records = notificationService.getNotificationRecords(businessType, businessId);
        return Result.success(records);
    }

    /**
     * 创建通知模板
     */
    @PostMapping("/templates")
    public Result<Long> createTemplate(@RequestBody NotificationTemplate template) {
        log.info("创建通知模板: {}", template.getTemplateCode());
        Long templateId = templateService.createTemplate(template);
        return Result.success(templateId);
    }

    /**
     * 更新通知模板
     */
    @PutMapping("/templates/{templateId}")
    public Result<Boolean> updateTemplate(@PathVariable Long templateId, 
                                        @RequestBody NotificationTemplate template) {
        log.info("更新通知模板: templateId={}", templateId);
        template.setId(templateId);
        boolean success = templateService.updateTemplate(template);
        return Result.success(success);
    }

    /**
     * 删除通知模板
     */
    @DeleteMapping("/templates/{templateId}")
    public Result<Boolean> deleteTemplate(@PathVariable Long templateId) {
        log.info("删除通知模板: templateId={}", templateId);
        boolean success = templateService.deleteTemplate(templateId);
        return Result.success(success);
    }

    /**
     * 获取通知模板列表
     */
    @GetMapping("/templates")
    public Result<List<NotificationTemplate>> getTemplates(
            @RequestParam(required = false) String notificationType) {
        List<NotificationTemplate> templates = templateService.getTemplates(notificationType);
        return Result.success(templates);
    }

    /**
     * 获取通知模板
     */
    @GetMapping("/templates/{templateCode}")
    public Result<NotificationTemplate> getTemplate(@PathVariable String templateCode) {
        NotificationTemplate template = notificationService.getTemplate(templateCode);
        return Result.success(template);
    }

    /**
     * 验证模板语法
     */
    @PostMapping("/templates/validate")
    public Result<Boolean> validateTemplate(@RequestBody String template) {
        boolean valid = templateService.validateTemplate(template);
        return Result.success(valid);
    }
}