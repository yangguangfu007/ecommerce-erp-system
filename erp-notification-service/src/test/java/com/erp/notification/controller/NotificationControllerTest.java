package com.erp.notification.controller;

import com.erp.common.response.PageResult;
import com.erp.common.response.Result;
import com.erp.notification.entity.Notification;
import com.erp.notification.enums.NotificationStatus;
import com.erp.notification.enums.NotificationType;
import com.erp.notification.service.NotificationServicePlus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 通知控制器单元测试
 * 使用@WebMvcTest注解测试Controller层
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("通知控制器单元测试")
class NotificationControllerTest {

    @Mock
    private NotificationServicePlus notificationService;

    @InjectMocks
    private NotificationController notificationController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    private Notification testNotification;
    private PageResult<Notification> testPageResult;

    @BeforeEach
    void setUp() {
        // 初始化MockMvc
        mockMvc = MockMvcBuilders.standaloneSetup(notificationController).build();
        
        // 准备测试数据
        testNotification = new Notification();
        testNotification.setId(1L);
        testNotification.setTitle("测试通知");
        testNotification.setContent("这是一个测试通知");
        testNotification.setType(NotificationType.SYSTEM);
        testNotification.setStatus(NotificationStatus.UNREAD);
        testNotification.setRecipientId(100L);
        testNotification.setRecipientName("测试用户");
        testNotification.setCreateTime(LocalDateTime.now());

        // 准备分页结果
        testPageResult = new PageResult<>();
        testPageResult.setContent(Arrays.asList(testNotification));
        testPageResult.setPage(1L);
        testPageResult.setSize(10L);
        testPageResult.setTotal(1L);
        testPageResult.setTotalPages(1L);
    }

    @Test
    @DisplayName("测试分页查询通知列表")
    void testGetNotificationPage() throws Exception {
        // Mock service方法
        when(notificationService.getNotificationPage(anyLong(), anyLong(), anyLong(), any(), any()))
                .thenReturn(testPageResult);

        // 执行请求并验证结果
        mockMvc.perform(get("/api/notifications")
                        .param("recipientId", "100")
                        .param("page", "1")
                        .param("size", "10")
                        .param("status", "UNREAD")
                        .param("type", "SYSTEM"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].title").value("测试通知"))
                .andExpect(jsonPath("$.data.total").value(1));
    }

    @Test
    @DisplayName("测试获取未读通知数量")
    void testGetUnreadCount() throws Exception {
        // Mock service方法
        when(notificationService.getUnreadCount(100L)).thenReturn(5L);

        // 执行请求并验证结果
        mockMvc.perform(get("/api/notifications/unread-count")
                        .param("recipientId", "100"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(5));
    }

    @Test
    @DisplayName("测试获取最近通知")
    void testGetRecentNotifications() throws Exception {
        // Mock service方法
        when(notificationService.getRecentNotifications(100L, 10))
                .thenReturn(Arrays.asList(testNotification));

        // 执行请求并验证结果
        mockMvc.perform(get("/api/notifications/recent")
                        .param("recipientId", "100")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("测试通知"));
    }

    @Test
    @DisplayName("测试标记通知为已读")
    void testMarkAsRead() throws Exception {
        // Mock service方法
        when(notificationService.markAsRead(1L, 100L)).thenReturn(true);

        // 执行请求并验证结果
        mockMvc.perform(put("/api/notifications/1/read")
                        .param("recipientId", "100"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("测试标记通知为已读失败")
    void testMarkAsReadFailed() throws Exception {
        // Mock service方法返回false
        when(notificationService.markAsRead(1L, 100L)).thenReturn(false);

        // 执行请求并验证结果
        mockMvc.perform(put("/api/notifications/1/read")
                        .param("recipientId", "100"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("标记通知已读失败，通知不存在或已是已读状态"));
    }

    @Test
    @DisplayName("测试批量标记通知为已读")
    void testBatchMarkAsRead() throws Exception {
        // Mock service方法
        when(notificationService.batchMarkAsRead(anyList(), eq(100L))).thenReturn(3);

        // 准备请求数据
        List<Long> notificationIds = Arrays.asList(1L, 2L, 3L);

        // 执行请求并验证结果
        mockMvc.perform(put("/api/notifications/batch-read")
                        .param("recipientId", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notificationIds)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(3));
    }

    @Test
    @DisplayName("测试删除通知")
    void testDeleteNotification() throws Exception {
        // Mock service方法
        when(notificationService.deleteNotification(1L, 100L)).thenReturn(true);

        // 执行请求并验证结果
        mockMvc.perform(delete("/api/notifications/1")
                        .param("recipientId", "100"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("测试批量删除通知")
    void testBatchDeleteNotifications() throws Exception {
        // Mock service方法
        when(notificationService.batchDeleteNotifications(anyList(), eq(100L))).thenReturn(2);

        // 准备请求数据
        List<Long> notificationIds = Arrays.asList(1L, 2L);

        // 执行请求并验证结果
        mockMvc.perform(delete("/api/notifications/batch")
                        .param("recipientId", "100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notificationIds)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(2));
    }

    @Test
    @DisplayName("测试创建系统通知")
    void testCreateSystemNotification() throws Exception {
        // Mock service方法
        when(notificationService.createSystemNotification(
                eq("系统通知"), eq("系统维护通知"), eq(100L), eq("测试用户"), 
                eq("SYSTEM"), eq("MAINTENANCE")))
                .thenReturn(testNotification);

        // 执行请求并验证结果
        mockMvc.perform(post("/api/notifications/system")
                        .param("title", "系统通知")
                        .param("content", "系统维护通知")
                        .param("recipientId", "100")
                        .param("recipientName", "测试用户")
                        .param("businessType", "SYSTEM")
                        .param("businessId", "MAINTENANCE"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.title").value("测试通知"));
    }

    @Test
    @DisplayName("测试根据业务查询通知")
    void testGetNotificationsByBusiness() throws Exception {
        // Mock service方法
        when(notificationService.getNotificationsByBusiness("ORDER", "12345"))
                .thenReturn(Arrays.asList(testNotification));

        // 执行请求并验证结果
        mockMvc.perform(get("/api/notifications/business")
                        .param("businessType", "ORDER")
                        .param("businessId", "12345"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("测试通知"));
    }

    @Test
    @DisplayName("测试获取通知统计信息")
    void testGetNotificationStats() throws Exception {
        // 准备统计数据
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", 10);
        stats.put("unreadCount", 3);
        stats.put("readCount", 7);

        // Mock service方法
        when(notificationService.getNotificationStats(100L)).thenReturn(stats);

        // 执行请求并验证结果
        mockMvc.perform(get("/api/notifications/stats")
                        .param("recipientId", "100"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.totalCount").value(10))
                .andExpect(jsonPath("$.data.unreadCount").value(3))
                .andExpect(jsonPath("$.data.readCount").value(7));
    }

    @Test
    @DisplayName("测试清理过期通知")
    void testCleanExpiredNotifications() throws Exception {
        // Mock service方法
        when(notificationService.cleanExpiredNotifications()).thenReturn(5);

        // 执行请求并验证结果
        mockMvc.perform(post("/api/notifications/cleanup-expired"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value(5));
    }

    @Test
    @DisplayName("测试参数验证失败")
    void testValidationFailure() throws Exception {
        // 测试缺少必需参数的情况
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("测试服务异常处理")
    void testServiceException() throws Exception {
        // Mock service方法抛出异常
        when(notificationService.getUnreadCount(100L))
                .thenThrow(new RuntimeException("数据库连接失败"));

        // 执行请求并验证结果
        mockMvc.perform(get("/api/notifications/unread-count")
                        .param("recipientId", "100"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("获取未读通知数量失败：数据库连接失败"));
    }
}