package com.erp.logistics.service;

import com.erp.logistics.adapter.LogisticsAdapter;
import com.erp.logistics.dto.ShippingLabelResponse;
import com.erp.logistics.service.impl.ShippingLabelServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

/**
 * ShippingLabelService unit tests
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class ShippingLabelServiceTest {

    @Mock
    private LogisticsAdapter logisticsAdapter;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private ListOperations<String, String> listOperations;

    @InjectMocks
    private ShippingLabelServiceImpl shippingLabelService;

    private static final String TEST_TRACKING_NUMBER = "YE123456789";
    private static final Long TEST_ORDER_ID = 12345L;
    private static final String LABEL_CACHE_PREFIX = "shipping_label:";
    private static final String TEST_LABEL_PDF = "JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KQNC=";

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(redisTemplate.opsForList()).thenReturn(listOperations);
    }

    @Test
    void shouldGenerateLabelForOrder_whenValidOrderId() {
        // Given
        ShippingLabelResponse expectedResponse = createSuccessfulLabelResponse();
        when(logisticsAdapter.generateLabel(anyString())).thenReturn(expectedResponse);
        when(valueOperations.get(anyString())).thenReturn(null);

        // When
        ShippingLabelResponse result = shippingLabelService.generateLabelForOrder(TEST_ORDER_ID);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getLabelPdfBase64()).isNotNull();
        
        verify(logisticsAdapter).generateLabel(anyString());
        verify(valueOperations).set(anyString(), eq(TEST_LABEL_PDF), eq(Duration.ofHours(24)));
    }

    @Test
    void shouldReturnFailure_whenOrderHasNoTrackingNumber() {
        // When
        ShippingLabelResponse result = shippingLabelService.generateLabelForOrder(999L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("NO_TRACKING_NUMBER");
        assertThat(result.getErrorMessage()).contains("订单没有关联的运单号");
    }

    @Test
    void shouldGenerateLabel_whenValidTrackingNumber() {
        // Given
        ShippingLabelResponse expectedResponse = createSuccessfulLabelResponse();
        when(logisticsAdapter.generateLabel(TEST_TRACKING_NUMBER)).thenReturn(expectedResponse);
        when(valueOperations.get(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);

        // When
        ShippingLabelResponse result = shippingLabelService.generateLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTrackingNumber()).isEqualTo(TEST_TRACKING_NUMBER);
        assertThat(result.getLabelPdfBase64()).isEqualTo(TEST_LABEL_PDF);

        verify(logisticsAdapter).generateLabel(TEST_TRACKING_NUMBER);
        verify(valueOperations).set(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER, TEST_LABEL_PDF, Duration.ofHours(24));
    }

    @Test
    void shouldReturnCachedLabel_whenLabelExistsInCache() {
        // Given
        when(valueOperations.get(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(TEST_LABEL_PDF);

        // When
        ShippingLabelResponse result = shippingLabelService.generateLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getLabelPdfBase64()).isEqualTo(TEST_LABEL_PDF);

        verify(logisticsAdapter, never()).generateLabel(TEST_TRACKING_NUMBER);
    }

    @Test
    void shouldThrowException_whenAdapterFails() {
        // Given
        when(valueOperations.get(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);
        when(logisticsAdapter.generateLabel(TEST_TRACKING_NUMBER))
                .thenThrow(new RuntimeException("API connection failed"));

        // When & Then
        assertThatThrownBy(() -> shippingLabelService.generateLabel(TEST_TRACKING_NUMBER))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("API connection failed");
    }

    @Test
    void shouldRegenerateLabel_whenValidTrackingNumber() {
        // Given
        ShippingLabelResponse expectedResponse = createSuccessfulLabelResponse();
        when(logisticsAdapter.generateLabel(TEST_TRACKING_NUMBER)).thenReturn(expectedResponse);

        // When
        ShippingLabelResponse result = shippingLabelService.regenerateLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTrackingNumber()).isEqualTo(TEST_TRACKING_NUMBER);

        verify(redisTemplate).delete(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER);
        verify(logisticsAdapter).generateLabel(TEST_TRACKING_NUMBER);
    }

    @Test
    void shouldReturnFailure_whenRegenerateLabelThrowsException() {
        // Given
        when(logisticsAdapter.generateLabel(TEST_TRACKING_NUMBER))
                .thenThrow(new RuntimeException("Generation failed"));

        // When
        ShippingLabelResponse result = shippingLabelService.regenerateLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("REGENERATION_ERROR");
        assertThat(result.getErrorMessage()).contains("重新生成面单异常");
    }

    @Test
    void shouldGetLabelPdf_whenLabelExistsInCache() {
        // Given
        when(valueOperations.get(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(TEST_LABEL_PDF);

        // When
        String result = shippingLabelService.getLabelPdf(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isEqualTo(TEST_LABEL_PDF);
        verify(logisticsAdapter, never()).generateLabel(TEST_TRACKING_NUMBER);
    }

    @Test
    void shouldGenerateAndReturnLabelPdf_whenLabelNotInCache() {
        // Given
        ShippingLabelResponse labelResponse = createSuccessfulLabelResponse();
        when(valueOperations.get(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);
        when(logisticsAdapter.generateLabel(TEST_TRACKING_NUMBER)).thenReturn(labelResponse);

        // When
        String result = shippingLabelService.getLabelPdf(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isEqualTo(TEST_LABEL_PDF);
        verify(logisticsAdapter).generateLabel(TEST_TRACKING_NUMBER);
    }

    @Test
    void shouldReturnNull_whenGetLabelPdfFails() {
        // Given
        when(valueOperations.get(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);
        when(logisticsAdapter.generateLabel(TEST_TRACKING_NUMBER))
                .thenReturn(ShippingLabelResponse.failure("API_ERROR", "Generation failed"));

        // When
        String result = shippingLabelService.getLabelPdf(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNull();
    }

    @Test
    void shouldReturnNull_whenGetLabelPdfThrowsException() {
        // Given
        when(valueOperations.get(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER))
                .thenThrow(new RuntimeException("Redis error"));

        // When
        String result = shippingLabelService.getLabelPdf(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNull();
    }

    @Test
    void shouldPrintLabel_whenLabelPdfExists() {
        // Given
        when(valueOperations.get(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(TEST_LABEL_PDF);

        // When
        boolean result = shippingLabelService.printLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isTrue();
        verify(listOperations).leftPush(eq("print_history:" + TEST_TRACKING_NUMBER), anyString());
        verify(redisTemplate).expire(eq("print_history:" + TEST_TRACKING_NUMBER), eq(Duration.ofDays(30)));
    }

    @Test
    void shouldReturnFalse_whenPrintLabelWithNoPdf() {
        // Given
        when(valueOperations.get(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER)).thenReturn(null);
        when(logisticsAdapter.generateLabel(TEST_TRACKING_NUMBER))
                .thenReturn(ShippingLabelResponse.failure("API_ERROR", "Generation failed"));

        // When
        boolean result = shippingLabelService.printLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isFalse();
        verify(listOperations, never()).leftPush(anyString(), anyString());
    }

    @Test
    void shouldReturnFalse_whenPrintLabelThrowsException() {
        // Given
        when(valueOperations.get(LABEL_CACHE_PREFIX + TEST_TRACKING_NUMBER))
                .thenThrow(new RuntimeException("Redis error"));

        // When
        boolean result = shippingLabelService.printLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldBatchGenerateLabels_whenMultipleTrackingNumbers() {
        // Given
        List<String> trackingNumbers = Arrays.asList("YE123456789", "YE987654321", "YE456789123");
        ShippingLabelResponse successResponse = createSuccessfulLabelResponse();
        
        when(logisticsAdapter.generateLabel(anyString())).thenReturn(successResponse);
        when(valueOperations.get(anyString())).thenReturn(null);

        // When
        Map<String, ShippingLabelResponse> results = shippingLabelService.batchGenerateLabels(trackingNumbers);

        // Then
        assertThat(results).hasSize(3);
        assertThat(results.values()).allMatch(ShippingLabelResponse::isSuccess);
        verify(logisticsAdapter, times(3)).generateLabel(anyString());
        verify(valueOperations, times(3)).set(anyString(), eq(TEST_LABEL_PDF), eq(Duration.ofHours(24)));
    }

    @Test
    void shouldHandlePartialFailures_whenBatchGenerateLabels() {
        // Given
        List<String> trackingNumbers = Arrays.asList("YE123456789", "YE987654321");
        ShippingLabelResponse successResponse = createSuccessfulLabelResponse();
        
        when(logisticsAdapter.generateLabel("YE123456789")).thenReturn(successResponse);
        when(logisticsAdapter.generateLabel("YE987654321"))
                .thenThrow(new RuntimeException("API error"));
        when(valueOperations.get(anyString())).thenReturn(null);

        // When
        Map<String, ShippingLabelResponse> results = shippingLabelService.batchGenerateLabels(trackingNumbers);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results.get("YE123456789").isSuccess()).isTrue();
        assertThat(results.get("YE987654321").isSuccess()).isFalse();
        assertThat(results.get("YE987654321").getErrorCode()).isEqualTo("BATCH_ERROR");
    }

    @Test
    void shouldReturnEmptyMap_whenBatchGenerateLabelsWithEmptyList() {
        // Given
        List<String> trackingNumbers = Arrays.asList();

        // When
        Map<String, ShippingLabelResponse> results = shippingLabelService.batchGenerateLabels(trackingNumbers);

        // Then
        assertThat(results).isEmpty();
        verify(logisticsAdapter, never()).generateLabel(anyString());
    }

    private ShippingLabelResponse createSuccessfulLabelResponse() {
        ShippingLabelResponse response = new ShippingLabelResponse();
        response.setSuccess(true);
        response.setTrackingNumber(TEST_TRACKING_NUMBER);
        response.setLabelPdfBase64(TEST_LABEL_PDF);
        response.setLabelFormat("PDF");
        response.setLabelSize("A4");
        response.setGeneratedTime(LocalDateTime.now());
        return response;
    }
}