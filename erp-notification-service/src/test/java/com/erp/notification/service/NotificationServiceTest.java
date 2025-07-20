package com.erp.notification.service;

import com.erp.notification.dto.NotificationRequest;
import com.erp.notification.entity.NotificationRecord;
import com.erp.notification.entity.NotificationTemplate;
import com.erp.notification.mapper.NotificationRecordMapper;
import com.erp.notification.mapper.NotificationTemplateMapper;
import com.erp.notification.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 通知服务测试
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRecordMapper notificationRecordMapper;

    @Mock
    private NotificationTemplateMapper notificationTemplateMapper;

    @Mock
    private EmailService emailService;

    @Mock
    private SmsService smsService;

    @Mock
    private SystemNotificationService systemNotificationService;

    @Mock
    private TemplateService templateService;

    @Mock
    private NotificationConfigService configService;

    @Mock
    private NotificationStatisticsService statisticsService;

    @Mock
    private NotificationFrequencyService frequencyService;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private NotificationRequest testRequest;
    private NotificationTemplate testTemplate;

    @BeforeEach
    void setUp() {
        testRequest = new NotificationRequest();
        testRequest.setNotificationType("EMAIL");
        testRequest.setRecipient("test@example.com");
        testRequest.setTitle("测试通知");
        testRequest.setContent("这是一个测试通知");
        testRequest.setBusinessType("TEST");
        testRequest.setBusinessId("TEST001");
        testRequest.setMaxRetryCount(3);

        testTemplate = new NotificationTemplate();
        testTemplate.setId(1L);
        testTemplate.setTemplateCode("TEST_TEMPLATE");
        testTemplate.setTemplateName("测试模板");
        testTemplate.setNotificationType("EMAIL");
        testTemplate.setTitle("测试标题：${title}");
        testTemplate.setContent("测试内容：${content}");
        testTemplate.setStatus("ACTIVE");
    }

    @Test
    void testSendNotification() {
        // Given
        when(frequencyService.checkGlobalFrequencyLimit(anyString())).thenReturn(true);
        when(frequencyService.checkRecipientFrequencyLimit(anyString(), anyString())).thenReturn(true);
        when(frequencyService.checkBusinessFrequencyLimit(anyString(), anyString())).thenReturn(true);
        when(frequencyService.isSpamNotification(anyString(), anyString())).thenReturn(false);
        doNothing().when(frequencyService).recordSendFrequency(anyString(), anyString(), anyString(), anyString());
        
        when(notificationRecordMapper.insert(any(NotificationRecord.class))).thenAnswer(invocation -> {
            NotificationRecord record = invocation.getArgument(0);
            record.setId(1L); // Set ID to simulate database insert
            return 1;
        });
        when(emailService.sendEmail(anyString(), anyString(), anyString())).thenReturn(true);
        when(notificationRecordMapper.updateById(any(NotificationRecord.class))).thenReturn(1);
        doNothing().when(statisticsService).recordPerformanceMetrics(anyString(), anyLong(), anyBoolean());

        // When
        Long recordId = notificationService.sendNotification(testRequest);

        // Then
        assertNotNull(recordId);
        assertEquals(1L, recordId);
        verify(notificationRecordMapper, times(1)).insert(any(NotificationRecord.class));
    }

    @Test
    void testSendNotificationByTemplate() {
        // Given
        Map<String, Object> variables = new HashMap<>();
        variables.put("title", "测试标题");
        variables.put("content", "测试内容");

        when(frequencyService.checkGlobalFrequencyLimit(anyString())).thenReturn(true);
        when(frequencyService.checkRecipientFrequencyLimit(anyString(), anyString())).thenReturn(true);
        when(frequencyService.checkBusinessFrequencyLimit(anyString(), anyString())).thenReturn(true);
        when(frequencyService.isSpamNotification(anyString(), anyString())).thenReturn(false);
        doNothing().when(frequencyService).recordSendFrequency(anyString(), anyString(), anyString(), anyString());
        
        when(notificationTemplateMapper.selectOne(any())).thenReturn(testTemplate);
        when(templateService.renderTemplate("测试标题：${title}", variables)).thenReturn("测试标题：测试标题");
        when(templateService.renderTemplate("测试内容：${content}", variables)).thenReturn("测试内容：测试内容");
        when(notificationRecordMapper.insert(any(NotificationRecord.class))).thenAnswer(invocation -> {
            NotificationRecord record = invocation.getArgument(0);
            record.setId(1L); // Set ID to simulate database insert
            return 1;
        });
        when(emailService.sendEmail(anyString(), anyString(), anyString())).thenReturn(true);
        when(notificationRecordMapper.updateById(any(NotificationRecord.class))).thenReturn(1);
        doNothing().when(statisticsService).recordPerformanceMetrics(anyString(), anyLong(), anyBoolean());

        // When
        Long recordId = notificationService.sendNotificationByTemplate(
                "TEST_TEMPLATE", "test@example.com", variables, "TEST", "TEST001");

        // Then
        assertNotNull(recordId);
        assertEquals(1L, recordId);
        verify(templateService).renderTemplate("测试标题：${title}", variables);
        verify(templateService).renderTemplate("测试内容：${content}", variables);
    }

    @Test
    void testGetTemplate() {
        // Given
        when(notificationTemplateMapper.selectOne(any())).thenReturn(testTemplate);

        // When
        NotificationTemplate result = notificationService.getTemplate("TEST_TEMPLATE");

        // Then
        assertNotNull(result);
        assertEquals("TEST_TEMPLATE", result.getTemplateCode());
        assertEquals("测试模板", result.getTemplateName());
    }

    @Test
    void testRetryNotification() {
        // Given
        NotificationRecord record = new NotificationRecord();
        record.setId(1L);
        record.setNotificationType("EMAIL");
        record.setRecipient("test@example.com");
        record.setTitle("测试通知");
        record.setContent("测试内容");
        record.setStatus("FAILED");
        record.setRetryCount(1);
        record.setMaxRetryCount(3);

        when(notificationRecordMapper.selectById(1L)).thenReturn(record);
        when(notificationRecordMapper.updateById(any(NotificationRecord.class))).thenReturn(1);
        when(emailService.sendEmail(anyString(), anyString(), anyString())).thenReturn(true);
        doNothing().when(statisticsService).recordPerformanceMetrics(anyString(), anyLong(), anyBoolean());

        // When
        boolean result = notificationService.retryNotification(1L);

        // Then
        assertTrue(result);
        verify(notificationRecordMapper, atLeastOnce()).updateById(any(NotificationRecord.class));
    }

    @Test
    void testRetryNotificationExceedsMaxRetry() {
        // Given
        NotificationRecord record = new NotificationRecord();
        record.setId(1L);
        record.setRetryCount(3);
        record.setMaxRetryCount(3);

        when(notificationRecordMapper.selectById(1L)).thenReturn(record);

        // When
        boolean result = notificationService.retryNotification(1L);

        // Then
        assertFalse(result);
        verify(notificationRecordMapper, never()).updateById(any(NotificationRecord.class));
    }
}