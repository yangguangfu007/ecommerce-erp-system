package com.erp.logistics.service;

import com.erp.logistics.adapter.LogisticsAdapter;
import com.erp.logistics.dto.LogisticsStatusResponse;
import com.erp.logistics.service.impl.LogisticsTrackingServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

/**
 * LogisticsTrackingService unit tests
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class LogisticsTrackingServiceTest {

    @Mock
    private LogisticsAdapter logisticsAdapter;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private SetOperations<String, String> setOperations;

    @InjectMocks
    private LogisticsTrackingServiceImpl logisticsTrackingService;

    private static final String TEST_TRACKING_NUMBER = "YE123456789";
    private static final String STATUS_CACHE_PREFIX = "logistics_status:";
    private static final String ABNORMAL_SET_KEY = "abnormal_trackings";

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(redisTemplate.opsForSet()).thenReturn(setOperations);
    }

    @Test
    void shouldReturnSuccessfulStatus_whenQueryStatusWithValidTrackingNumber() {
        // Given
        LogisticsStatusResponse expectedResponse = createSuccessfulStatusResponse();
        when(logisticsAdapter.queryStatus(TEST_TRACKING_NUMBER)).thenReturn(expectedResponse);
        when(valueOperations.get(STATUS_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);

        // When
        LogisticsStatusResponse result = logisticsTrackingService.queryStatus(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTrackingNumber()).isEqualTo(TEST_TRACKING_NUMBER);
        assertThat(result.getCurrentStatus()).isEqualTo("IN_TRANSIT");

        // 等待异步任务完成
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        verify(logisticsAdapter, atLeastOnce()).queryStatus(TEST_TRACKING_NUMBER);
        verify(valueOperations, atLeastOnce()).set(eq(STATUS_CACHE_PREFIX + TEST_TRACKING_NUMBER), anyString(), eq(Duration.ofMinutes(30)));
    }

    @Test
    void shouldReturnCachedStatus_whenStatusExistsInCache() throws Exception {
        // Given
        LogisticsStatusResponse cachedResponse = createSuccessfulStatusResponse();
        cachedResponse.setLastUpdateTime(LocalDateTime.now().minusMinutes(10)); // Fresh status
        
        ObjectMapper objectMapper = new ObjectMapper()
                .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
                .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        String cachedJson = objectMapper.writeValueAsString(cachedResponse);
        when(valueOperations.get(STATUS_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(cachedJson);

        // When
        LogisticsStatusResponse result = logisticsTrackingService.queryStatus(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTrackingNumber()).isEqualTo(TEST_TRACKING_NUMBER);

        verify(logisticsAdapter, never()).queryStatus(TEST_TRACKING_NUMBER);
    }

    @Test
    void shouldReturnFailureResponse_whenAdapterThrowsException() {
        // Given
        when(logisticsAdapter.queryStatus(TEST_TRACKING_NUMBER))
                .thenThrow(new RuntimeException("API connection failed"));

        // When
        LogisticsStatusResponse result = logisticsTrackingService.queryStatus(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorMessage()).contains("查询物流状态异常");
    }

    @Test
    void shouldDetectAbnormalStatus_whenStatusHasLongNoUpdate() {
        // Given
        LogisticsStatusResponse response = createSuccessfulStatusResponse();
        response.setLastUpdateTime(LocalDateTime.now().minusDays(5)); // 5 days old
        when(logisticsAdapter.queryStatus(TEST_TRACKING_NUMBER)).thenReturn(response);
        when(valueOperations.get(STATUS_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);

        // When
        LogisticsStatusResponse result = logisticsTrackingService.queryStatus(TEST_TRACKING_NUMBER);

        // 等待异步任务完成
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then
        assertThat(result).isNotNull();
        verify(setOperations, atLeastOnce()).add(ABNORMAL_SET_KEY, TEST_TRACKING_NUMBER);
        verify(kafkaTemplate, atLeastOnce()).send(eq("logistics-abnormal-notification"), eq(TEST_TRACKING_NUMBER), anyString());
    }

    @Test
    void shouldDetectAbnormalStatus_whenStatusContainsErrorKeywords() {
        // Given
        LogisticsStatusResponse response = createSuccessfulStatusResponse();
        response.setCurrentStatus("EXCEPTION_OCCURRED");
        response.setLastUpdateTime(LocalDateTime.now().minusHours(1));
        when(logisticsAdapter.queryStatus(TEST_TRACKING_NUMBER)).thenReturn(response);
        when(valueOperations.get(STATUS_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);

        // When
        LogisticsStatusResponse result = logisticsTrackingService.queryStatus(TEST_TRACKING_NUMBER);

        // 等待异步任务完成
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then
        assertThat(result).isNotNull();
        verify(setOperations, atLeastOnce()).add(ABNORMAL_SET_KEY, TEST_TRACKING_NUMBER);
        verify(kafkaTemplate, atLeastOnce()).send(eq("logistics-abnormal-notification"), eq(TEST_TRACKING_NUMBER), anyString());
    }

    @Test
    void shouldBatchQueryStatus_whenMultipleTrackingNumbers() {
        // Given
        List<String> trackingNumbers = Arrays.asList("YE123456789", "YE987654321", "YE456789123");
        LogisticsStatusResponse successResponse = createSuccessfulStatusResponse();
        
        when(logisticsAdapter.queryStatus(anyString())).thenReturn(successResponse);
        when(valueOperations.get(anyString())).thenReturn(null);

        // When
        Map<String, LogisticsStatusResponse> results = logisticsTrackingService.batchQueryStatus(trackingNumbers);

        // Then
        assertThat(results).hasSize(3);
        assertThat(results.values()).allMatch(LogisticsStatusResponse::isSuccess);
        
        // 等待异步任务完成
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        verify(logisticsAdapter, atLeast(3)).queryStatus(anyString());
    }

    @Test
    void shouldSyncStatusToOrder_whenValidTrackingNumber() throws Exception {
        // Given
        LogisticsStatusResponse response = createSuccessfulStatusResponse();
        when(logisticsAdapter.queryStatus(TEST_TRACKING_NUMBER)).thenReturn(response);
        when(valueOperations.get(STATUS_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);

        // When
        boolean result = logisticsTrackingService.syncStatusToOrder(TEST_TRACKING_NUMBER);

        // 等待异步任务完成
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then
        assertThat(result).isTrue();
        
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> messageCaptor = ArgumentCaptor.forClass(String.class);
        
        verify(kafkaTemplate, atLeastOnce()).send(topicCaptor.capture(), keyCaptor.capture(), messageCaptor.capture());
        
        assertThat(topicCaptor.getValue()).isEqualTo("logistics-status-update");
        assertThat(keyCaptor.getValue()).isEqualTo(TEST_TRACKING_NUMBER);
        assertThat(messageCaptor.getValue()).contains(TEST_TRACKING_NUMBER);
    }

    @Test
    void shouldReturnFalse_whenSyncStatusToOrderFails() {
        // Given
        LogisticsStatusResponse failureResponse = LogisticsStatusResponse.failure("API_ERROR", "API failed");
        when(logisticsAdapter.queryStatus(TEST_TRACKING_NUMBER)).thenReturn(failureResponse);
        when(valueOperations.get(STATUS_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);

        // When
        boolean result = logisticsTrackingService.syncStatusToOrder(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isFalse();
        verify(kafkaTemplate, never()).send(anyString(), anyString(), anyString());
    }

    @Test
    void shouldBatchSyncStatus_whenMultipleTrackingNumbers() {
        // Given
        List<String> trackingNumbers = Arrays.asList("YE123456789", "YE987654321");
        LogisticsStatusResponse response = createSuccessfulStatusResponse();
        when(logisticsAdapter.queryStatus(anyString())).thenReturn(response);
        when(valueOperations.get(anyString())).thenReturn(null);

        // When
        Map<String, Boolean> results = logisticsTrackingService.batchSyncStatus(trackingNumbers);

        // 等待异步任务完成
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then
        assertThat(results).hasSize(2);
        assertThat(results.values()).allMatch(result -> result);
        verify(kafkaTemplate, atLeast(2)).send(anyString(), anyString(), anyString());
    }

    @Test
    void shouldDetectAbnormal_whenTrackingNumberHasAbnormalStatus() {
        // Given
        LogisticsStatusResponse response = createSuccessfulStatusResponse();
        response.setCurrentStatus("LOST");
        response.setLastUpdateTime(LocalDateTime.now().minusHours(1));
        when(logisticsAdapter.queryStatus(TEST_TRACKING_NUMBER)).thenReturn(response);
        when(valueOperations.get(STATUS_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);

        // When
        boolean result = logisticsTrackingService.detectAbnormal(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void shouldReturnFalse_whenDetectAbnormalThrowsException() {
        // Given
        when(logisticsAdapter.queryStatus(TEST_TRACKING_NUMBER))
                .thenThrow(new RuntimeException("Connection failed"));

        // When
        boolean result = logisticsTrackingService.detectAbnormal(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldReturnAbnormalTrackings_whenAbnormalTrackingsExist() {
        // Given
        Set<String> abnormalSet = Set.of("YE123456789", "YE987654321");
        when(setOperations.members(ABNORMAL_SET_KEY)).thenReturn(abnormalSet);

        // When
        List<String> result = logisticsTrackingService.getAbnormalTrackings();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyInAnyOrder("YE123456789", "YE987654321");
    }

    @Test
    void shouldReturnEmptyList_whenGetAbnormalTrackingsThrowsException() {
        // Given
        when(setOperations.members(ABNORMAL_SET_KEY)).thenThrow(new RuntimeException("Redis error"));

        // When
        List<String> result = logisticsTrackingService.getAbnormalTrackings();

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void shouldHandleAbnormalResolve_whenActionIsResolve() {
        // Given
        String action = "resolve";

        // When
        boolean result = logisticsTrackingService.handleAbnormal(TEST_TRACKING_NUMBER, action);

        // 等待异步任务完成
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then
        assertThat(result).isTrue();
        verify(setOperations, atLeastOnce()).remove(ABNORMAL_SET_KEY, TEST_TRACKING_NUMBER);
        verify(kafkaTemplate, atLeastOnce()).send(eq("logistics-abnormal-resolved"), eq(TEST_TRACKING_NUMBER), anyString());
    }

    @Test
    void shouldHandleAbnormalEscalate_whenActionIsEscalate() {
        // Given
        String action = "escalate";

        // When
        boolean result = logisticsTrackingService.handleAbnormal(TEST_TRACKING_NUMBER, action);

        // 等待异步任务完成
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then
        assertThat(result).isTrue();
        verify(kafkaTemplate, atLeastOnce()).send(eq("logistics-escalation"), eq(TEST_TRACKING_NUMBER), anyString());
    }

    @Test
    void shouldHandleAbnormalIgnore_whenActionIsIgnore() {
        // Given
        String action = "ignore";

        // When
        boolean result = logisticsTrackingService.handleAbnormal(TEST_TRACKING_NUMBER, action);

        // Then
        assertThat(result).isTrue();
        verify(setOperations).remove(ABNORMAL_SET_KEY, TEST_TRACKING_NUMBER);
        verify(kafkaTemplate, never()).send(anyString(), anyString(), anyString());
    }

    @Test
    void shouldReturnFalse_whenHandleAbnormalWithUnknownAction() {
        // Given
        String action = "unknown";

        // When
        boolean result = logisticsTrackingService.handleAbnormal(TEST_TRACKING_NUMBER, action);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldReturnFalse_whenHandleAbnormalThrowsException() {
        // Given
        String action = "resolve";
        doThrow(new RuntimeException("Redis error")).when(setOperations).remove(anyString(), anyString());

        // When
        boolean result = logisticsTrackingService.handleAbnormal(TEST_TRACKING_NUMBER, action);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldStartScheduledSync_whenCalled() {
        // When
        logisticsTrackingService.startScheduledSync();

        // Then - No exception should be thrown and method should complete successfully
        // This is mainly testing that the method executes without error
        assertThat(true).isTrue(); // Placeholder assertion
    }

    @Test
    void shouldStopScheduledSync_whenCalled() {
        // When
        logisticsTrackingService.stopScheduledSync();

        // Then - No exception should be thrown and method should complete successfully
        // This is mainly testing that the method executes without error
        assertThat(true).isTrue(); // Placeholder assertion
    }

    private LogisticsStatusResponse createSuccessfulStatusResponse() {
        LogisticsStatusResponse response = new LogisticsStatusResponse();
        response.setSuccess(true);
        response.setTrackingNumber(TEST_TRACKING_NUMBER);
        response.setCurrentStatus("IN_TRANSIT");
        response.setStatusDescription("Package is in transit");
        response.setLastUpdateTime(LocalDateTime.now().minusHours(1));
        
        LogisticsStatusResponse.TrackingEvent event = new LogisticsStatusResponse.TrackingEvent();
        event.setEventTime(LocalDateTime.now().minusHours(2));
        event.setStatus("PICKED_UP");
        event.setDescription("Package picked up");
        event.setLocation("Warehouse A");
        
        response.setTrackingEvents(List.of(event));
        return response;
    }
}