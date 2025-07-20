package com.erp.logistics.yunexpress.service;

import com.erp.logistics.yunexpress.config.YunExpressConfig;
import com.erp.logistics.yunexpress.dto.YunExpressOrderRequest;
import com.erp.logistics.yunexpress.dto.YunExpressOrderResponse;
import com.erp.logistics.yunexpress.dto.YunExpressTrackingResponse;
import com.erp.logistics.yunexpress.service.impl.YunExpressApiServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;



import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * YunExpressApiService unit tests
 *
 * @author ERP System
 */
@ExtendWith(MockitoExtension.class)
class YunExpressApiServiceTest {

    @Mock
    private YunExpressConfig yunExpressConfig;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private YunExpressApiServiceImpl yunExpressApiService;

    private static final String BASE_URL = "https://api.yunexpress.com";
    private static final String API_KEY = "test-api-key";
    private static final String CUSTOMER_CODE = "test-customer";
    private static final String TEST_TRACKING_NUMBER = "YE123456789";

    @BeforeEach
    void setUp() {
        lenient().when(yunExpressConfig.getActualBaseUrl()).thenReturn(BASE_URL);
        lenient().when(yunExpressConfig.getApiKey()).thenReturn(API_KEY);
        lenient().when(yunExpressConfig.getCustomerCode()).thenReturn(CUSTOMER_CODE);
    }

    @Test
    void shouldCreateOrder_whenValidRequest() {
        // Given
        YunExpressOrderRequest request = createOrderRequest();
        String successResponseJson = createSuccessfulOrderResponseJson();
        ResponseEntity<String> responseEntity = new ResponseEntity<>(successResponseJson, HttpStatus.OK);
        
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // When
        YunExpressOrderResponse result = yunExpressApiService.createOrder(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTrackingNumber()).isEqualTo(TEST_TRACKING_NUMBER);
        assertThat(result.getOrderId()).isEqualTo("ORDER123");

        ArgumentCaptor<HttpEntity<?>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(
                eq(BASE_URL + "/api/order/create"),
                eq(HttpMethod.POST),
                entityCaptor.capture(),
                eq(String.class)
        );

        HttpEntity<?> capturedEntity = entityCaptor.getValue();
        HttpHeaders headers = capturedEntity.getHeaders();
        assertThat(headers.get("Authorization")).containsExactly("Bearer " + API_KEY);
        assertThat(headers.get("Customer-Code")).containsExactly(CUSTOMER_CODE);
        assertThat(headers.getContentType()).isEqualTo(MediaType.APPLICATION_JSON);
    }

    @Test
    void shouldReturnFailure_whenCreateOrderApiCallFails() {
        // Given
        YunExpressOrderRequest request = createOrderRequest();
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RestClientException("Connection timeout"));

        // When
        YunExpressOrderResponse result = yunExpressApiService.createOrder(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("API_ERROR");
        assertThat(result.getErrorMessage()).contains("API调用异常");
    }

    @Test
    void shouldReturnFailure_whenCreateOrderResponseIndicatesFailure() {
        // Given
        YunExpressOrderRequest request = createOrderRequest();
        String failureResponseJson = createFailureOrderResponseJson();
        ResponseEntity<String> responseEntity = new ResponseEntity<>(failureResponseJson, HttpStatus.OK);
        
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // When
        YunExpressOrderResponse result = yunExpressApiService.createOrder(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("INVALID_ADDRESS");
        assertThat(result.getErrorMessage()).isEqualTo("Invalid recipient address");
    }

    @Test
    void shouldGenerateLabel_whenValidTrackingNumber() {
        // Given
        String successResponseJson = createSuccessfulLabelResponseJson();
        ResponseEntity<String> responseEntity = new ResponseEntity<>(successResponseJson, HttpStatus.OK);
        
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // When
        String result = yunExpressApiService.generateLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo("JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KQNC=");

        verify(restTemplate).exchange(
                eq(BASE_URL + "/api/label/generate"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)
        );
    }

    @Test
    void shouldReturnNull_whenGenerateLabelFails() {
        // Given
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RestClientException("API error"));

        // When
        String result = yunExpressApiService.generateLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNull();
    }

    @Test
    void shouldReturnNull_whenGenerateLabelResponseIndicatesFailure() {
        // Given
        String failureResponseJson = createFailureLabelResponseJson();
        ResponseEntity<String> responseEntity = new ResponseEntity<>(failureResponseJson, HttpStatus.OK);
        
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // When
        String result = yunExpressApiService.generateLabel(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNull();
    }

    @Test
    void shouldQueryTracking_whenValidTrackingNumber() {
        // Given
        String successResponseJson = createSuccessfulTrackingResponseJson();
        ResponseEntity<String> responseEntity = new ResponseEntity<>(successResponseJson, HttpStatus.OK);
        
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // When
        YunExpressTrackingResponse result = yunExpressApiService.queryTracking(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTrackingNumber()).isEqualTo(TEST_TRACKING_NUMBER);
        assertThat(result.getCurrentStatus()).isEqualTo("IN_TRANSIT");

        verify(restTemplate).exchange(
                eq(BASE_URL + "/api/tracking/query?trackingNumber=" + TEST_TRACKING_NUMBER),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(String.class)
        );
    }

    @Test
    void shouldReturnFailure_whenQueryTrackingApiCallFails() {
        // Given
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RestClientException("Network error"));

        // When
        YunExpressTrackingResponse result = yunExpressApiService.queryTracking(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getErrorCode()).isEqualTo("API_ERROR");
        assertThat(result.getErrorMessage()).contains("API调用异常");
    }

    @Test
    void shouldCancelOrder_whenValidTrackingNumber() {
        // Given
        String successResponseJson = "{\"success\": true}";
        ResponseEntity<String> responseEntity = new ResponseEntity<>(successResponseJson, HttpStatus.OK);
        
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // When
        boolean result = yunExpressApiService.cancelOrder(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isTrue();

        verify(restTemplate).exchange(
                eq(BASE_URL + "/api/order/cancel"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)
        );
    }

    @Test
    void shouldReturnFalse_whenCancelOrderFails() {
        // Given
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RestClientException("API error"));

        // When
        boolean result = yunExpressApiService.cancelOrder(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldReturnFalse_whenCancelOrderResponseIndicatesFailure() {
        // Given
        String failureResponseJson = "{\"success\": false}";
        ResponseEntity<String> responseEntity = new ResponseEntity<>(failureResponseJson, HttpStatus.OK);
        
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // When
        boolean result = yunExpressApiService.cancelOrder(TEST_TRACKING_NUMBER);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldTestConnection_whenApiIsHealthy() {
        // Given
        ResponseEntity<String> responseEntity = new ResponseEntity<>("OK", HttpStatus.OK);
        
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // When
        boolean result = yunExpressApiService.testConnection();

        // Then
        assertThat(result).isTrue();

        verify(restTemplate).exchange(
                eq(BASE_URL + "/api/health"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(String.class)
        );
    }

    @Test
    void shouldReturnFalse_whenTestConnectionFails() {
        // Given
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RestClientException("Connection failed"));

        // When
        boolean result = yunExpressApiService.testConnection();

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void shouldReturnFalse_whenTestConnectionReturnsNonOkStatus() {
        // Given
        ResponseEntity<String> responseEntity = new ResponseEntity<>("Service Unavailable", HttpStatus.SERVICE_UNAVAILABLE);
        
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // When
        boolean result = yunExpressApiService.testConnection();

        // Then
        assertThat(result).isFalse();
    }

    private YunExpressOrderRequest createOrderRequest() {
        YunExpressOrderRequest request = new YunExpressOrderRequest();
        request.setOrderNumber("ORDER123");
        request.setServiceType("STANDARD");
        request.setRemark("Test order");
        
        // 收件人信息
        YunExpressOrderRequest.RecipientInfo recipient = new YunExpressOrderRequest.RecipientInfo();
        recipient.setName("John Doe");
        recipient.setPhone("+1234567890");
        recipient.setEmail("john@example.com");
        recipient.setAddress("123 Main St");
        recipient.setCity("New York");
        recipient.setState("NY");
        recipient.setZipCode("10001");
        recipient.setCountryCode("US");
        request.setRecipient(recipient);
        
        // 发件人信息
        YunExpressOrderRequest.SenderInfo sender = new YunExpressOrderRequest.SenderInfo();
        sender.setName("Company ABC");
        sender.setPhone("+0987654321");
        sender.setEmail("sender@company.com");
        sender.setAddress("456 Business Ave");
        sender.setCity("Los Angeles");
        sender.setState("CA");
        sender.setZipCode("90001");
        sender.setCountryCode("US");
        request.setSender(sender);
        
        // 包裹信息
        YunExpressOrderRequest.PackageInfo packageInfo = new YunExpressOrderRequest.PackageInfo();
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

    private String createSuccessfulOrderResponseJson() {
        return """
                {
                    "success": true,
                    "data": {
                        "trackingNumber": "YE123456789",
                        "orderId": "ORDER123",
                        "serviceType": "STANDARD",
                        "shippingCost": "15.50",
                        "currency": "USD"
                    }
                }
                """;
    }

    private String createFailureOrderResponseJson() {
        return """
                {
                    "success": false,
                    "errorCode": "INVALID_ADDRESS",
                    "errorMessage": "Invalid recipient address"
                }
                """;
    }

    private String createSuccessfulLabelResponseJson() {
        return """
                {
                    "success": true,
                    "data": {
                        "labelPdfBase64": "JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KQNC="
                    }
                }
                """;
    }

    private String createFailureLabelResponseJson() {
        return """
                {
                    "success": false,
                    "errorCode": "LABEL_ERROR",
                    "errorMessage": "Unable to generate label"
                }
                """;
    }

    private String createSuccessfulTrackingResponseJson() {
        return """
                {
                    "success": true,
                    "data": {
                        "trackingNumber": "YE123456789",
                        "currentStatus": "IN_TRANSIT",
                        "statusDescription": "Package is in transit",
                        "lastUpdateTime": "2024-01-15T10:30:00",
                        "trackingEvents": [
                            {
                                "eventTime": "2024-01-15T08:00:00",
                                "status": "PICKED_UP",
                                "description": "Package picked up from sender",
                                "location": "Warehouse A"
                            },
                            {
                                "eventTime": "2024-01-15T10:30:00",
                                "status": "IN_TRANSIT",
                                "description": "Package is in transit",
                                "location": "Sorting Center B"
                            }
                        ]
                    }
                }
                """;
    }
}