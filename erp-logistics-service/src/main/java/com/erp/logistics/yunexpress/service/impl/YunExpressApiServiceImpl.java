package com.erp.logistics.yunexpress.service.impl;

import com.erp.logistics.dto.LogisticsStatusResponse;
import com.erp.logistics.yunexpress.config.YunExpressConfig;
import com.erp.logistics.yunexpress.dto.YunExpressOrderRequest;
import com.erp.logistics.yunexpress.dto.YunExpressOrderResponse;
import com.erp.logistics.yunexpress.dto.YunExpressTrackingResponse;
import com.erp.logistics.yunexpress.service.YunExpressApiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 云途物流API服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class YunExpressApiServiceImpl implements YunExpressApiService {

    private final YunExpressConfig yunExpressConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Override
    public YunExpressOrderResponse createOrder(YunExpressOrderRequest request) {
        try {
            String url = yunExpressConfig.getActualBaseUrl() + "/api/order/create";
            
            // 构建请求体
            Map<String, Object> requestBody = buildCreateOrderRequest(request);
            
            // 设置请求头
            HttpHeaders headers = buildHeaders();
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("调用云途创建订单API: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            
            return parseCreateOrderResponse(response.getBody());
            
        } catch (Exception e) {
            log.error("调用云途创建订单API异常", e);
            YunExpressOrderResponse errorResponse = new YunExpressOrderResponse();
            errorResponse.setSuccess(false);
            errorResponse.setErrorCode("API_ERROR");
            errorResponse.setErrorMessage("API调用异常: " + e.getMessage());
            errorResponse.setResponseTime(LocalDateTime.now());
            return errorResponse;
        }
    }

    @Override
    public String generateLabel(String trackingNumber) {
        try {
            String url = yunExpressConfig.getActualBaseUrl() + "/api/label/generate";
            
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("trackingNumber", trackingNumber);
            requestBody.put("format", "PDF");
            requestBody.put("size", "A4");
            
            // 设置请求头
            HttpHeaders headers = buildHeaders();
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("调用云途生成面单API: {}, 运单号: {}", url, trackingNumber);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            
            return parseLabelResponse(response.getBody());
            
        } catch (Exception e) {
            log.error("调用云途生成面单API异常，运单号: {}", trackingNumber, e);
            return null;
        }
    }

    @Override
    public YunExpressTrackingResponse queryTracking(String trackingNumber) {
        try {
            String url = yunExpressConfig.getActualBaseUrl() + "/api/tracking/query?trackingNumber=" + trackingNumber;
            
            // 设置请求头
            HttpHeaders headers = buildHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            log.info("调用云途查询跟踪API: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            return parseTrackingResponse(response.getBody());
            
        } catch (Exception e) {
            log.error("调用云途查询跟踪API异常，运单号: {}", trackingNumber, e);
            YunExpressTrackingResponse errorResponse = new YunExpressTrackingResponse();
            errorResponse.setSuccess(false);
            errorResponse.setErrorCode("API_ERROR");
            errorResponse.setErrorMessage("API调用异常: " + e.getMessage());
            errorResponse.setResponseTime(LocalDateTime.now());
            return errorResponse;
        }
    }

    @Override
    public boolean cancelOrder(String trackingNumber) {
        try {
            String url = yunExpressConfig.getActualBaseUrl() + "/api/order/cancel";
            
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("trackingNumber", trackingNumber);
            
            // 设置请求头
            HttpHeaders headers = buildHeaders();
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("调用云途取消订单API: {}, 运单号: {}", url, trackingNumber);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            
            return parseCancelResponse(response.getBody());
            
        } catch (Exception e) {
            log.error("调用云途取消订单API异常，运单号: {}", trackingNumber, e);
            return false;
        }
    }

    @Override
    public boolean testConnection() {
        try {
            String url = yunExpressConfig.getActualBaseUrl() + "/api/health";
            
            // 设置请求头
            HttpHeaders headers = buildHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            log.info("测试云途API连接: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.error("测试云途API连接异常", e);
            return false;
        }
    }

    /**
     * 构建请求头
     */
    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + yunExpressConfig.getApiKey());
        headers.set("Customer-Code", yunExpressConfig.getCustomerCode());
        headers.set("User-Agent", "ERP-System/1.0");
        return headers;
    }

    /**
     * 构建创建订单请求
     */
    private Map<String, Object> buildCreateOrderRequest(YunExpressOrderRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("orderNumber", request.getOrderNumber());
        requestBody.put("serviceType", request.getServiceType());
        requestBody.put("remark", request.getRemark());
        
        // 收件人信息
        Map<String, Object> recipient = new HashMap<>();
        recipient.put("name", request.getRecipient().getName());
        recipient.put("phone", request.getRecipient().getPhone());
        recipient.put("email", request.getRecipient().getEmail());
        recipient.put("address", request.getRecipient().getAddress());
        recipient.put("city", request.getRecipient().getCity());
        recipient.put("state", request.getRecipient().getState());
        recipient.put("zipCode", request.getRecipient().getZipCode());
        recipient.put("countryCode", request.getRecipient().getCountryCode());
        requestBody.put("recipient", recipient);
        
        // 发件人信息
        Map<String, Object> sender = new HashMap<>();
        sender.put("name", request.getSender().getName());
        sender.put("phone", request.getSender().getPhone());
        sender.put("email", request.getSender().getEmail());
        sender.put("address", request.getSender().getAddress());
        sender.put("city", request.getSender().getCity());
        sender.put("state", request.getSender().getState());
        sender.put("zipCode", request.getSender().getZipCode());
        sender.put("countryCode", request.getSender().getCountryCode());
        requestBody.put("sender", sender);
        
        // 包裹信息
        Map<String, Object> packageInfo = new HashMap<>();
        packageInfo.put("weight", request.getPackageInfo().getWeight());
        packageInfo.put("length", request.getPackageInfo().getLength());
        packageInfo.put("width", request.getPackageInfo().getWidth());
        packageInfo.put("height", request.getPackageInfo().getHeight());
        packageInfo.put("description", request.getPackageInfo().getDescription());
        packageInfo.put("declaredValue", request.getPackageInfo().getDeclaredValue());
        packageInfo.put("currency", request.getPackageInfo().getCurrency());
        requestBody.put("packageInfo", packageInfo);
        
        return requestBody;
    }

    /**
     * 解析创建订单响应
     */
    private YunExpressOrderResponse parseCreateOrderResponse(String responseBody) {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            YunExpressOrderResponse response = new YunExpressOrderResponse();
            response.setResponseTime(LocalDateTime.now());
            
            if (jsonNode.has("success") && jsonNode.get("success").asBoolean()) {
                response.setSuccess(true);
                response.setTrackingNumber(jsonNode.get("data").get("trackingNumber").asText());
                response.setOrderId(jsonNode.get("data").get("orderId").asText());
                response.setServiceType(jsonNode.get("data").get("serviceType").asText());
                
                if (jsonNode.get("data").has("shippingCost")) {
                    response.setShippingCost(jsonNode.get("data").get("shippingCost").asText());
                }
                if (jsonNode.get("data").has("currency")) {
                    response.setCurrency(jsonNode.get("data").get("currency").asText());
                }
            } else {
                response.setSuccess(false);
                response.setErrorCode(jsonNode.get("errorCode").asText());
                response.setErrorMessage(jsonNode.get("errorMessage").asText());
            }
            
            return response;
        } catch (Exception e) {
            log.error("解析云途创建订单响应异常", e);
            YunExpressOrderResponse errorResponse = new YunExpressOrderResponse();
            errorResponse.setSuccess(false);
            errorResponse.setErrorCode("PARSE_ERROR");
            errorResponse.setErrorMessage("响应解析异常: " + e.getMessage());
            errorResponse.setResponseTime(LocalDateTime.now());
            return errorResponse;
        }
    }

    /**
     * 解析面单响应
     */
    private String parseLabelResponse(String responseBody) {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            if (jsonNode.has("success") && jsonNode.get("success").asBoolean()) {
                return jsonNode.get("data").get("labelPdfBase64").asText();
            } else {
                log.error("云途生成面单失败: {}", jsonNode.get("errorMessage").asText());
                return null;
            }
        } catch (Exception e) {
            log.error("解析云途面单响应异常", e);
            return null;
        }
    }

    /**
     * 解析跟踪响应
     */
    private YunExpressTrackingResponse parseTrackingResponse(String responseBody) {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            YunExpressTrackingResponse response = new YunExpressTrackingResponse();
            response.setResponseTime(LocalDateTime.now());
            
            if (jsonNode.has("success") && jsonNode.get("success").asBoolean()) {
                response.setSuccess(true);
                JsonNode data = jsonNode.get("data");
                response.setTrackingNumber(data.get("trackingNumber").asText());
                response.setCurrentStatus(data.get("currentStatus").asText());
                response.setStatusDescription(data.get("statusDescription").asText());
                
                if (data.has("lastUpdateTime")) {
                    String timeStr = data.get("lastUpdateTime").asText();
                    response.setLastUpdateTime(LocalDateTime.parse(timeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                }
                
                // 解析跟踪事件
                if (data.has("trackingEvents")) {
                    List<LogisticsStatusResponse.TrackingEvent> events = new ArrayList<>();
                    for (JsonNode eventNode : data.get("trackingEvents")) {
                        LogisticsStatusResponse.TrackingEvent event = new LogisticsStatusResponse.TrackingEvent();
                        event.setStatus(eventNode.get("status").asText());
                        event.setDescription(eventNode.get("description").asText());
                        event.setLocation(eventNode.get("location").asText());
                        
                        if (eventNode.has("eventTime")) {
                            String eventTimeStr = eventNode.get("eventTime").asText();
                            event.setEventTime(LocalDateTime.parse(eventTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                        }
                        
                        events.add(event);
                    }
                    response.setTrackingEvents(events);
                }
            } else {
                response.setSuccess(false);
                response.setErrorCode(jsonNode.get("errorCode").asText());
                response.setErrorMessage(jsonNode.get("errorMessage").asText());
            }
            
            return response;
        } catch (Exception e) {
            log.error("解析云途跟踪响应异常", e);
            YunExpressTrackingResponse errorResponse = new YunExpressTrackingResponse();
            errorResponse.setSuccess(false);
            errorResponse.setErrorCode("PARSE_ERROR");
            errorResponse.setErrorMessage("响应解析异常: " + e.getMessage());
            errorResponse.setResponseTime(LocalDateTime.now());
            return errorResponse;
        }
    }

    /**
     * 解析取消订单响应
     */
    private boolean parseCancelResponse(String responseBody) {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            return jsonNode.has("success") && jsonNode.get("success").asBoolean();
        } catch (Exception e) {
            log.error("解析云途取消订单响应异常", e);
            return false;
        }
    }
}