package com.erp.logistics.yunexpress.adapter;

import com.erp.logistics.dto.LogisticsOrderRequest;
import com.erp.logistics.dto.LogisticsOrderResponse;
import com.erp.logistics.dto.LogisticsStatusResponse;
import com.erp.logistics.dto.ShippingLabelResponse;
import com.erp.logistics.yunexpress.config.YunExpressConfig;
import com.erp.logistics.yunexpress.dto.YunExpressOrderRequest;
import com.erp.logistics.yunexpress.dto.YunExpressOrderResponse;
import com.erp.logistics.yunexpress.dto.YunExpressTrackingResponse;
import com.erp.logistics.yunexpress.service.YunExpressApiService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * YunExpressLogisticsAdapter unit tests
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class YunExpressLogisticsAdapterTest {

    @Mock
    private YunExpressApiService yunExpressApiService;

    @Mock
    private YunExpressConfig yunExpressConfig;

    @InjectMocks
    private YunExpressLogisticsAdapter yunExpressLogisticsAdapter;

    private static final String TEST_TRACKING_NUMBER = "YE123456789";
    private static final String TEST_ORDER_NUMBER = "ORDER123";

    @Test
    void shouldCreateShippingOrder_whenValidRequest() {
        // Given
        LogisticsOrderRequest request = createLogisticsOrderRequest();
        YunExpressOrderResponse yunExpressResponse = createSuccessfulYunExpressOrderResponse();
        
        when(yunExpressApiService.createOrder(any(YunExpressOrderRequest.class)))
                .thenReturn(yunExpressResponse);

        // When
        LogisticsOrderResponse result = yunExpressLogisticsAdapter.createShippingOrder(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTrackingNumber()).isEqualTo(TEST_TRACKING_NUMBER);
        assertThat(result.getProviderOrderId()).isEqualTo("ORDER123");

        ArgumentCaptor<YunExpressOrderRequest> requestCaptor = ArgumentCaptor.forClass(YunExpressOrderRequest.class);
        verify(yunExpressApiService).createOrder(requestCaptor.capture());
        
        YunExpressOrderRequest capturedRequest = requestCaptor.getValue();
        assertThat(capturedRequest.getOrderNumber()).isEqualTo(TEST_ORDER_NUMBER);
        assertThat(capturedRequest.getServiceType()).isEqualTo("STANDARD");
    }

    @Test
    void shouldReturnFailure_whenCreateShippingOrderFails() {
        // Given
        LogisticsOrderRequest request = createLogisticsOrderRequest();
        YunExpressOrderResponse yunExpressResponse = createFailedYunExpressOrderResponse();
        
        when(yunExpressApiService.createOrder(any(YunExpressOrderRequest.class)))
                .thenReturn(yunExpressResponse);

        // When
        LogisticsOrderResponse result = yunExpressLogisticsAdapter.createShippingOrder(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("INVALID_ADDRESS");
        assertThat(result.getErrorMessage()).isEqualTo("Invalid recipient address");
    }

    @Test
    void shouldThrowException_whenCreateShippingOrderThrowsException() {
        // Given
        LogisticsOrderRequest request = createLogisticsOrderRequest();
        when(yunExpressApiService.createOrder(any(YunExpressOrderRequest.class)))
                .thenThrow(new RuntimeException("API connection failed"));

        // When & Then
        assertThatThrownBy(() -> yunExpressLogisticsAdapter.createShippingOrder(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("API connection failed");
    }

    @Test
    void shouldGenerateLabel_whenValidTrackingNumber() {
        // Given
        String labelPdfBase64 = "JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KQNC=";
        when(yunExpressApiService.generateLabel(TEST_TRACKING_NUMBER)).thenReturn(labelPdfBase64);

        // When
        ShippingLabelResponse result = yunExpressLogisticsAdapter.generateLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTrackingNumber()).isEqualTo(TEST_TRACKING_NUMBER);
        assertThat(result.getLabelPdfBase64()).isEqualTo(labelPdfBase64);

        verify(yunExpressApiService).generateLabel(TEST_TRACKING_NUMBER);
    }

    @Test
    void shouldReturnFailure_whenGenerateLabelReturnsNull() {
        // Given
        when(yunExpressApiService.generateLabel(TEST_TRACKING_NUMBER)).thenReturn(null);

        // When
        ShippingLabelResponse result = yunExpressLogisticsAdapter.generateLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("LABEL_GENERATION_FAILED");
        assertThat(result.getErrorMessage()).isEqualTo("面单生成失败");
    }

    @Test
    void shouldReturnFailure_whenGenerateLabelReturnsEmptyString() {
        // Given
        when(yunExpressApiService.generateLabel(TEST_TRACKING_NUMBER)).thenReturn("");

        // When
        ShippingLabelResponse result = yunExpressLogisticsAdapter.generateLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("LABEL_GENERATION_FAILED");
    }

    @Test
    void shouldThrowException_whenGenerateLabelThrowsException() {
        // Given
        when(yunExpressApiService.generateLabel(TEST_TRACKING_NUMBER))
                .thenThrow(new RuntimeException("Label generation failed"));

        // When & Then
        assertThatThrownBy(() -> yunExpressLogisticsAdapter.generateLabel(TEST_TRACKING_NUMBER))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Label generation failed");
    }

    @Test
    void shouldQueryStatus_whenValidTrackingNumber() {
        // Given
        YunExpressTrackingResponse trackingResponse = createSuccessfulTrackingResponse();
        when(yunExpressApiService.queryTracking(TEST_TRACKING_NUMBER)).thenReturn(trackingResponse);

        // When
        LogisticsStatusResponse result = yunExpressLogisticsAdapter.queryStatus(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTrackingNumber()).isEqualTo(TEST_TRACKING_NUMBER);
        assertThat(result.getCurrentStatus()).isEqualTo("IN_TRANSIT");
        assertThat(result.getStatusDescription()).isEqualTo("Package is in transit");
        assertThat(result.getTrackingEvents()).hasSize(1);

        verify(yunExpressApiService).queryTracking(TEST_TRACKING_NUMBER);
    }

    @Test
    void shouldReturnFailure_whenQueryStatusFails() {
        // Given
        YunExpressTrackingResponse trackingResponse = createFailedTrackingResponse();
        when(yunExpressApiService.queryTracking(TEST_TRACKING_NUMBER)).thenReturn(trackingResponse);

        // When
        LogisticsStatusResponse result = yunExpressLogisticsAdapter.queryStatus(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("TRACKING_NOT_FOUND");
        assertThat(result.getErrorMessage()).isEqualTo("Tracking number not found");
    }

    @Test
    void shouldThrowException_whenQueryStatusThrowsException() {
        // Given
        when(yunExpressApiService.queryTracking(TEST_TRACKING_NUMBER))
                .thenThrow(new RuntimeException("Query failed"));

        // When & Then
        assertThatThrownBy(() -> yunExpressLogisticsAdapter.queryStatus(TEST_TRACKING_NUMBER))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Query failed");
    }

    @Test
    void shouldCancelOrder_whenValidTrackingNumber() {
        // Given
        when(yunExpressApiService.cancelOrder(TEST_TRACKING_NUMBER)).thenReturn(true);

        // When
        boolean result = yunExpressLogisticsAdapter.cancelOrder(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isTrue();
        verify(yunExpressApiService).cancelOrder(TEST_TRACKING_NUMBER);
    }

    @Test
    void shouldReturnFalse_whenCancelOrderFails() {
        // Given
        when(yunExpressApiService.cancelOrder(TEST_TRACKING_NUMBER)).thenReturn(false);

        // When
        boolean result = yunExpressLogisticsAdapter.cancelOrder(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldThrowException_whenCancelOrderThrowsException() {
        // Given
        when(yunExpressApiService.cancelOrder(TEST_TRACKING_NUMBER))
                .thenThrow(new RuntimeException("Cancel failed"));

        // When & Then
        assertThatThrownBy(() -> yunExpressLogisticsAdapter.cancelOrder(TEST_TRACKING_NUMBER))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cancel failed");
    }

    @Test
    void shouldTestConnection_whenConnectionIsHealthy() {
        // Given
        when(yunExpressApiService.testConnection()).thenReturn(true);

        // When
        boolean result = yunExpressLogisticsAdapter.testConnection();

        // Then
        assertThat(result).isTrue();
        verify(yunExpressApiService).testConnection();
    }

    @Test
    void shouldReturnFalse_whenTestConnectionFails() {
        // Given
        when(yunExpressApiService.testConnection()).thenReturn(false);

        // When
        boolean result = yunExpressLogisticsAdapter.testConnection();

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldReturnFalse_whenTestConnectionThrowsException() {
        // Given
        when(yunExpressApiService.testConnection()).thenThrow(new RuntimeException("Connection error"));

        // When
        boolean result = yunExpressLogisticsAdapter.testConnection();

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldReturnProviderName_whenCalled() {
        // When
        String result = yunExpressLogisticsAdapter.getProviderName();

        // Then
        assertThat(result).isEqualTo("YunExpress");
    }

    private LogisticsOrderRequest createLogisticsOrderRequest() {
        LogisticsOrderRequest request = new LogisticsOrderRequest();
        request.setOrderNumber(TEST_ORDER_NUMBER);
        request.setServiceType("STANDARD");
        request.setRemark("Test order");
        
        // Create recipient info
        LogisticsOrderRequest.RecipientInfo recipient = new LogisticsOrderRequest.RecipientInfo();
        recipient.setName("John Doe");
        recipient.setPhone("+1234567890");
        recipient.setEmail("john@example.com");
        recipient.setAddress("123 Main St");
        recipient.setCity("New York");
        recipient.setState("NY");
        recipient.setZipCode("10001");
        recipient.setCountryCode("US");
        request.setRecipient(recipient);
        
        // Create sender info
        LogisticsOrderRequest.SenderInfo sender = new LogisticsOrderRequest.SenderInfo();
        sender.setName("Company ABC");
        sender.setPhone("+0987654321");
        sender.setEmail("sender@company.com");
        sender.setAddress("456 Business Ave");
        sender.setCity("Los Angeles");
        sender.setState("CA");
        sender.setZipCode("90001");
        sender.setCountryCode("US");
        request.setSender(sender);
        
        // Create package info
        LogisticsOrderRequest.PackageInfo packageInfo = new LogisticsOrderRequest.PackageInfo();
        packageInfo.setWeight(new java.math.BigDecimal("1.5"));
        packageInfo.setLength(new java.math.BigDecimal("20.0"));
        packageInfo.setWidth(new java.math.BigDecimal("15.0"));
        packageInfo.setHeight(new java.math.BigDecimal("10.0"));
        packageInfo.setDescription("Test package");
        packageInfo.setDeclaredValue(new java.math.BigDecimal("50.0"));
        packageInfo.setCurrency("USD");
        request.setPackageInfo(packageInfo);
        
        return request;
    }

    private YunExpressOrderResponse createSuccessfulYunExpressOrderResponse() {
        YunExpressOrderResponse response = new YunExpressOrderResponse();
        response.setSuccess(true);
        response.setTrackingNumber(TEST_TRACKING_NUMBER);
        response.setOrderId("ORDER123");
        response.setServiceType("STANDARD");
        response.setShippingCost("15.50");
        response.setCurrency("USD");
        response.setResponseTime(LocalDateTime.now());
        return response;
    }

    private YunExpressOrderResponse createFailedYunExpressOrderResponse() {
        YunExpressOrderResponse response = new YunExpressOrderResponse();
        response.setSuccess(false);
        response.setErrorCode("INVALID_ADDRESS");
        response.setErrorMessage("Invalid recipient address");
        response.setResponseTime(LocalDateTime.now());
        return response;
    }

    private YunExpressTrackingResponse createSuccessfulTrackingResponse() {
        YunExpressTrackingResponse response = new YunExpressTrackingResponse();
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
        response.setResponseTime(LocalDateTime.now());
        return response;
    }

    private YunExpressTrackingResponse createFailedTrackingResponse() {
        YunExpressTrackingResponse response = new YunExpressTrackingResponse();
        response.setSuccess(false);
        response.setErrorCode("TRACKING_NOT_FOUND");
        response.setErrorMessage("Tracking number not found");
        response.setResponseTime(LocalDateTime.now());
        return response;
    }
}