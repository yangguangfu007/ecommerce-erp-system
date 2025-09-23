package com.erp.notification.service.impl;

import com.erp.notification.dto.NotificationRequest;
import com.erp.notification.entity.NotificationRecord;
import com.erp.notification.entity.NotificationTemplate;
import com.erp.notification.mapper.NotificationRecordMapper;
import com.erp.notification.mapper.NotificationTemplateMapper;
import com.erp.notification.service.NotificationService;
import com.erp.notification.service.EmailService;
import com.erp.notification.service.SmsService;
import com.erp.notification.service.SystemNotificationService;
import com.erp.notification.service.TemplateService;
import com.erp.notification.service.NotificationConfigService;
import com.erp.notification.service.NotificationStatisticsService;
import com.erp.notification.service.NotificationFrequencyService;
import com.erp.common.exception.BusinessException;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cn.hutool.core.util.StrUtil;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 通知服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRecordMapper notificationRecordMapper;
    private final NotificationTemplateMapper notificationTemplateMapper;
    private final EmailService emailService;
    private final SmsService smsService;
    private final SystemNotificationService systemNotificationService;
    private final TemplateService templateService;
    private final NotificationConfigService configService;
    private final NotificationStatisticsService statisticsService;
    private final NotificationFrequencyService frequencyService;

    @Override
    @Transactional
    public Long sendNotification(NotificationRequest request) {
        log.info("发送通知请求: {}", request);

        // 检查全局频率限制
        if (!frequencyService.checkGlobalFrequencyLimit(request.getNotificationType())) {
            log.info("全局频率限制: type={}", request.getNotificationType());
            return null;
        }

        // 检查接收者频率限制
        if (!frequencyService.checkRecipientFrequencyLimit(request.getRecipient(), request.getNotificationType())) {
            log.info("接收者频率限制: recipient={}, type={}", request.getRecipient(), request.getNotificationType());
            return null;
        }

        // 检查业务频率限制
        if (!frequencyService.checkBusinessFrequencyLimit(request.getBusinessType(), request.getBusinessId())) {
            log.info("业务频率限制: businessType={}, businessId={}", request.getBusinessType(), request.getBusinessId());
            return null;
        }

        // 检查是否为垃圾通知
        if (frequencyService.isSpamNotification(request.getRecipient(), request.getContent())) {
            log.info("检测到垃圾通知: recipient={}", request.getRecipient());
            return null;
        }

        // 检查通知配置（如果有用户ID）
        if (request.getExtParams() != null && request.getExtParams().containsKey("userId")) {
            Long userId = Long.valueOf(request.getExtParams().get("userId").toString());
            
            // 检查是否启用通知
            if (!configService.isNotificationEnabled(userId, request.getNotificationType(), request.getBusinessType())) {
                log.info("用户已禁用此类型通知: userId={}, type={}, businessType={}", 
                        userId, request.getNotificationType(), request.getBusinessType());
                return null;
            }
            
            // 检查频率限制
            if (!configService.checkFrequencyLimit(userId, request.getNotificationType(), request.getBusinessType())) {
                log.info("通知频率限制: userId={}, type={}, businessType={}", 
                        userId, request.getNotificationType(), request.getBusinessType());
                return null;
            }
            
            // 检查静默时间
            if (configService.isInSilentTime(userId, request.getNotificationType(), request.getBusinessType())) {
                log.info("当前处于静默时间: userId={}, type={}, businessType={}", 
                        userId, request.getNotificationType(), request.getBusinessType());
                return null;
            }
            
            // 获取配置的接收地址
            String configuredRecipient = configService.getRecipientAddress(userId, request.getNotificationType(), request.getBusinessType());
            if (StrUtil.isNotBlank(configuredRecipient)) {
                request.setRecipient(configuredRecipient);
            }
        }

        // 创建通知记录
        NotificationRecord record = createNotificationRecord(request);
        notificationRecordMapper.insert(record);

        // 记录发送频率
        frequencyService.recordSendFrequency(request.getRecipient(), request.getNotificationType(), 
                                           request.getBusinessType(), request.getBusinessId());

        // 异步发送通知
        sendNotificationAsync(record);

        return record.getId();
    }

    @Override
    @Transactional
    public List<Long> batchSendNotification(List<NotificationRequest> requests) {
        log.info("批量发送通知，数量: {}", requests.size());

        List<Long> recordIds = new ArrayList<>();
        for (NotificationRequest request : requests) {
            try {
                Long recordId = sendNotification(request);
                recordIds.add(recordId);
            } catch (Exception e) {
                log.error("批量发送通知失败: {}", request, e);
            }
        }

        return recordIds;
    }

    @Override
    @Transactional
    public Long sendNotificationByTemplate(String templateCode, String recipient, 
                                         Map<String, Object> variables, 
                                         String businessType, String businessId) {
        log.info("根据模板发送通知: templateCode={}, recipient={}", templateCode, recipient);

        // 获取模板
        NotificationTemplate template = getTemplate(templateCode);
        if (template == null) {
            throw new BusinessException("通知模板不存在: " + templateCode);
        }

        // 渲染模板
        String title = templateService.renderTemplate(template.getTitle(), variables);
        String content = templateService.renderTemplate(template.getContent(), variables);

        // 创建通知请求
        NotificationRequest request = new NotificationRequest();
        request.setNotificationType(template.getNotificationType().getCode());
        request.setRecipient(recipient);
        request.setTitle(title);
        request.setContent(content);
        request.setTemplateCode(templateCode);
        request.setVariables(variables);
        request.setBusinessType(businessType);
        request.setBusinessId(businessId);
        request.setMaxRetryCount(3);

        return sendNotification(request);
    }

    @Override
    public boolean retryNotification(Long recordId) {
        log.info("重试通知: recordId={}", recordId);

        NotificationRecord record = notificationRecordMapper.selectById(recordId);
        if (record == null) {
            log.warn("通知记录不存在: {}", recordId);
            return false;
        }

        if (record.getRetryCount() >= record.getMaxRetryCount()) {
            log.warn("通知重试次数已达上限: recordId={}, retryCount={}", recordId, record.getRetryCount());
            return false;
        }

        // 更新重试次数
        record.setRetryCount(record.getRetryCount() + 1);
        record.setStatus("SENDING");
        notificationRecordMapper.updateById(record);

        // 异步重新发送
        sendNotificationAsync(record);

        return true;
    }

    @Override
    public NotificationRecord getNotificationRecord(Long recordId) {
        return notificationRecordMapper.selectById(recordId);
    }

    @Override
    public List<NotificationRecord> getNotificationRecords(String businessType, String businessId) {
        QueryWrapper<NotificationRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("business_type", businessType)
                   .eq("business_id", businessId)
                   .orderByDesc("created_at");
        return notificationRecordMapper.selectList(queryWrapper);
    }

    @Override
    public NotificationTemplate getTemplate(String templateCode) {
        QueryWrapper<NotificationTemplate> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("template_code", templateCode)
                   .eq("status", "ACTIVE");
        return notificationTemplateMapper.selectOne(queryWrapper);
    }

    @Override
    @Scheduled(fixedDelay = 300000) // 每5分钟执行一次
    public void processFailedNotifications() {
        log.info("处理失败的通知重试");

        QueryWrapper<NotificationRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", "FAILED")
                   .lt("retry_count", "max_retry_count")
                   .le("created_at", LocalDateTime.now().minusMinutes(5));

        List<NotificationRecord> failedRecords = notificationRecordMapper.selectList(queryWrapper);
        log.info("找到需要重试的通知数量: {}", failedRecords.size());

        for (NotificationRecord record : failedRecords) {
            try {
                retryNotification(record.getId());
            } catch (Exception e) {
                log.error("重试通知失败: recordId={}", record.getId(), e);
            }
        }
    }

    @Async
    private void sendNotificationAsync(NotificationRecord record) {
        long startTime = System.currentTimeMillis();
        boolean success = false;
        
        try {
            log.info("异步发送通知: recordId={}, type={}", record.getId(), record.getNotificationType());

            // 更新状态为发送中
            record.setStatus("SENDING");
            record.setSendTime(LocalDateTime.now());
            notificationRecordMapper.updateById(record);

            String errorMessage = null;

            // 根据通知类型发送
            switch (record.getNotificationType()) {
                case "EMAIL":
                    success = emailService.sendEmail(record.getRecipient(), record.getTitle(), record.getContent());
                    break;
                case "SMS":
                    success = smsService.sendSms(record.getRecipient(), record.getContent());
                    break;
                case "SYSTEM":
                    success = systemNotificationService.sendSystemNotification(record.getRecipient(), 
                                                                              record.getTitle(), 
                                                                              record.getContent());
                    break;
                default:
                    errorMessage = "不支持的通知类型: " + record.getNotificationType();
                    break;
            }

            // 更新发送结果
            if (success) {
                record.setStatus("SUCCESS");
                log.info("通知发送成功: recordId={}", record.getId());
            } else {
                record.setStatus("FAILED");
                record.setErrorMessage(errorMessage != null ? errorMessage : "发送失败");
                log.warn("通知发送失败: recordId={}, error={}", record.getId(), record.getErrorMessage());
            }

        } catch (Exception e) {
            log.error("发送通知异常: recordId={}", record.getId(), e);
            record.setStatus("FAILED");
            record.setErrorMessage(e.getMessage());
        } finally {
            // 记录性能指标
            long duration = System.currentTimeMillis() - startTime;
            statisticsService.recordPerformanceMetrics(record.getNotificationType(), duration, success);
            
            notificationRecordMapper.updateById(record);
        }
    }

    private NotificationRecord createNotificationRecord(NotificationRequest request) {
        NotificationRecord record = new NotificationRecord();
        record.setNotificationType(request.getNotificationType());
        record.setRecipient(request.getRecipient());
        record.setTitle(request.getTitle());
        record.setContent(request.getContent());
        record.setStatus("PENDING");
        record.setRetryCount(0);
        record.setMaxRetryCount(request.getMaxRetryCount() != null ? request.getMaxRetryCount() : 3);
        record.setBusinessType(request.getBusinessType());
        record.setBusinessId(request.getBusinessId());
        
        if (StrUtil.isNotBlank(request.getTemplateCode())) {
            NotificationTemplate template = getTemplate(request.getTemplateCode());
            if (template != null) {
                record.setTemplateId(template.getId());
            }
        }

        return record;
    }
}