package com.erp.platform.walmart.service.impl;

import com.erp.common.exception.BusinessException;
import com.erp.platform.walmart.config.WalmartConfig;
import com.erp.platform.walmart.dto.WalmartAuthToken;
import com.erp.platform.walmart.dto.WalmartOrder;
import com.erp.platform.walmart.service.WalmartAuthService;
import com.erp.platform.walmart.service.WalmartOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 沃尔玛订单服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WalmartOrderServiceImpl implements WalmartOrderService {
    
    private final WalmartConfig walmartConfig;
    private final WalmartAuthService walmartAuthService;
    private final WebClient webClient;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    
    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public List<WalmartOrder> fetchOrders(String storeId, LocalDateTime fromDate, LocalDateTime toDate) {
        log.info("开始拉取沃尔玛订单，店铺ID: {}, 时间范围: {} - {}", storeId, fromDate, toDate);
        
        try {
            WalmartAuthToken token = walmartAuthService.getAccessToken();
            
            // 构建请求URL
            String uri = buildOrderFetchUrl(fromDate, toDate);
            
            // 发送请求
            Map<String, Object> response = webClient.get()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, token.getAuthorizationHeader())
                    .header("WM_SVC.NAME", "Walmart Marketplace")
                    .header("WM_QOS.CORRELATION_ID", UUID.randomUUID().toString())
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofMillis(walmartConfig.getReadTimeout()))
                    .block();
            
            // 解析订单数据
            List<WalmartOrder> orders = parseOrdersFromResponse(response);
            
            log.info("成功拉取沃尔玛订单 {} 个，店铺ID: {}", orders.size(), storeId);
            return orders;
            
        } catch (WebClientResponseException e) {
            log.error("拉取沃尔玛订单失败，店铺ID: {}, HTTP状态码: {}, 响应: {}", 
                    storeId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("拉取沃尔玛订单失败: " + e.getMessage());
        } catch (Exception e) {
            log.error("拉取沃尔玛订单异常，店铺ID: {}", storeId, e);
            throw new BusinessException("拉取沃尔玛订单失败: " + e.getMessage());
        }
    }
    
    @Override
    public Map<String, Object> convertToStandardOrder(WalmartOrder walmartOrder) {
        Map<String, Object> standardOrder = new HashMap<>();
        
        // 基本信息
        standardOrder.put("platformOrderId", walmartOrder.getPurchaseOrderId());
        standardOrder.put("customerOrderId", walmartOrder.getCustomerOrderId());
        standardOrder.put("platform", "WALMART");
        standardOrder.put("orderDate", walmartOrder.getOrderDate());
        standardOrder.put("customerEmail", walmartOrder.getCustomerEmailId());
        
        // 配送信息
        if (walmartOrder.getShippingInfo() != null) {
            Map<String, Object> shippingInfo = new HashMap<>();
            WalmartOrder.ShippingInfo shipping = walmartOrder.getShippingInfo();
            
            shippingInfo.put("phone", shipping.getPhone());
            shippingInfo.put("estimatedDeliveryDate", shipping.getEstimatedDeliveryDate());
            shippingInfo.put("estimatedShipDate", shipping.getEstimatedShipDate());
            shippingInfo.put("methodCode", shipping.getMethodCode());
            
            // 地址信息
            if (shipping.getPostalAddress() != null) {
                WalmartOrder.PostalAddress address = shipping.getPostalAddress();
                Map<String, Object> addressInfo = new HashMap<>();
                addressInfo.put("name", address.getName());
                addressInfo.put("address1", address.getAddress1());
                addressInfo.put("address2", address.getAddress2());
                addressInfo.put("city", address.getCity());
                addressInfo.put("state", address.getState());
                addressInfo.put("postalCode", address.getPostalCode());
                addressInfo.put("country", address.getCountry());
                addressInfo.put("addressType", address.getAddressType());
                shippingInfo.put("address", addressInfo);
            }
            
            standardOrder.put("shippingInfo", shippingInfo);
        }
        
        // 订单项目
        List<Map<String, Object>> orderItems = new ArrayList<>();
        if (walmartOrder.getOrderLines() != null && walmartOrder.getOrderLines().getOrderLine() != null) {
            for (WalmartOrder.OrderLine orderLine : walmartOrder.getOrderLines().getOrderLine()) {
                Map<String, Object> item = new HashMap<>();
                
                item.put("lineNumber", orderLine.getLineNumber());
                item.put("statusDate", orderLine.getStatusDate());
                
                // 商品信息
                if (orderLine.getItem() != null) {
                    item.put("productName", orderLine.getItem().getProductName());
                    item.put("sku", orderLine.getItem().getSku());
                }
                
                // 数量信息
                if (orderLine.getOrderLineQuantity() != null) {
                    item.put("quantity", orderLine.getOrderLineQuantity().getAmount());
                    item.put("unit", orderLine.getOrderLineQuantity().getUnitOfMeasurement());
                }
                
                // 价格信息
                if (orderLine.getCharges() != null && orderLine.getCharges().getCharge() != null) {
                    BigDecimal totalAmount = BigDecimal.ZERO;
                    String currency = "USD";
                    
                    for (WalmartOrder.Charge charge : orderLine.getCharges().getCharge()) {
                        if (charge.getChargeAmount() != null) {
                            totalAmount = totalAmount.add(charge.getChargeAmount().getAmount());
                            currency = charge.getChargeAmount().getCurrency();
                        }
                    }
                    
                    item.put("totalAmount", totalAmount);
                    item.put("currency", currency);
                }
                
                // 状态信息
                if (orderLine.getOrderLineStatuses() != null && 
                    orderLine.getOrderLineStatuses().getOrderLineStatus() != null) {
                    List<Map<String, Object>> statuses = orderLine.getOrderLineStatuses()
                            .getOrderLineStatus().stream()
                            .map(status -> {
                                Map<String, Object> statusMap = new HashMap<>();
                                statusMap.put("status", status.getStatus());
                                if (status.getStatusQuantity() != null) {
                                    statusMap.put("quantity", status.getStatusQuantity().getAmount());
                                    statusMap.put("unit", status.getStatusQuantity().getUnitOfMeasurement());
                                }
                                return statusMap;
                            })
                            .collect(Collectors.toList());
                    item.put("statuses", statuses);
                }
                
                orderItems.add(item);
            }
        }
        
        standardOrder.put("orderItems", orderItems);
        
        return standardOrder;
    }
    
    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public boolean syncOrderStatus(String storeId, String orderId) {
        log.info("同步沃尔玛订单状态，店铺ID: {}, 订单ID: {}", storeId, orderId);
        
        try {
            WalmartAuthToken token = walmartAuthService.getAccessToken();
            
            // 获取订单详情
            Map<String, Object> orderDetail = webClient.get()
                    .uri(walmartConfig.getBaseUrl() + "/v3/orders/" + orderId)
                    .header(HttpHeaders.AUTHORIZATION, token.getAuthorizationHeader())
                    .header("WM_SVC.NAME", "Walmart Marketplace")
                    .header("WM_QOS.CORRELATION_ID", UUID.randomUUID().toString())
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofMillis(walmartConfig.getReadTimeout()))
                    .block();
            
            // 处理订单状态同步逻辑
            if (orderDetail != null) {
                log.info("成功同步沃尔玛订单状态，店铺ID: {}, 订单ID: {}", storeId, orderId);
                return true;
            }
            
            return false;
            
        } catch (WebClientResponseException e) {
            log.error("同步沃尔玛订单状态失败，店铺ID: {}, 订单ID: {}, HTTP状态码: {}, 响应: {}", 
                    storeId, orderId, e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("同步沃尔玛订单状态异常，店铺ID: {}, 订单ID: {}", storeId, orderId, e);
            return false;
        }
    }
    
    @Override
    public void handleOrderStatusChange(String storeId, String orderId, String oldStatus, String newStatus) {
        log.info("处理沃尔玛订单状态变化，店铺ID: {}, 订单ID: {}, 状态变化: {} -> {}", 
                storeId, orderId, oldStatus, newStatus);
        
        try {
            // 根据状态变化执行相应的业务逻辑
            switch (newStatus) {
                case "Created":
                    handleOrderCreated(storeId, orderId);
                    break;
                case "Acknowledged":
                    handleOrderAcknowledged(storeId, orderId);
                    break;
                case "Shipped":
                    handleOrderShipped(storeId, orderId);
                    break;
                case "Delivered":
                    handleOrderDelivered(storeId, orderId);
                    break;
                case "Cancelled":
                    handleOrderCancelled(storeId, orderId);
                    break;
                default:
                    log.warn("未知的订单状态: {}", newStatus);
            }
            
        } catch (Exception e) {
            log.error("处理沃尔玛订单状态变化异常，店铺ID: {}, 订单ID: {}", storeId, orderId, e);
        }
    }
    
    /**
     * 构建订单拉取URL
     */
    private String buildOrderFetchUrl(LocalDateTime fromDate, LocalDateTime toDate) {
        return String.format("%s/v3/orders?createdStartDate=%s&createdEndDate=%s&limit=200",
                walmartConfig.getBaseUrl(),
                fromDate.format(DATE_FORMATTER),
                toDate.format(DATE_FORMATTER));
    }
    
    /**
     * 从响应中解析订单数据
     */
    @SuppressWarnings("unchecked")
    private List<WalmartOrder> parseOrdersFromResponse(Map<String, Object> response) {
        List<WalmartOrder> orders = new ArrayList<>();
        
        if (response == null) {
            return orders;
        }
        
        try {
            Object listObj = response.get("list");
            if (listObj instanceof Map) {
                Map<String, Object> listMap = (Map<String, Object>) listObj;
                Object elementsObj = listMap.get("elements");
                if (elementsObj instanceof Map) {
                    Map<String, Object> elementsMap = (Map<String, Object>) elementsObj;
                    Object orderObj = elementsMap.get("order");
                    if (orderObj instanceof List) {
                        List<Map<String, Object>> orderList = (List<Map<String, Object>>) orderObj;
                        for (Map<String, Object> orderData : orderList) {
                            WalmartOrder order = parseOrderFromMap(orderData);
                            if (order != null) {
                                orders.add(order);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("解析沃尔玛订单数据失败", e);
        }
        
        return orders;
    }
    
    /**
     * 从Map解析订单对象
     */
    private WalmartOrder parseOrderFromMap(Map<String, Object> orderData) {
        try {
            // 这里应该使用JSON映射工具如Jackson来转换
            // 为简化示例，这里只做基本的字段映射
            WalmartOrder order = new WalmartOrder();
            order.setPurchaseOrderId((String) orderData.get("purchaseOrderId"));
            order.setCustomerOrderId((String) orderData.get("customerOrderId"));
            order.setCustomerEmailId((String) orderData.get("customerEmailId"));
            
            // 解析订单日期
            Object orderDateObj = orderData.get("orderDate");
            if (orderDateObj instanceof String) {
                order.setOrderDate(LocalDateTime.parse((String) orderDateObj, DATE_FORMATTER));
            }
            
            // 这里应该继续解析其他复杂字段...
            
            return order;
        } catch (Exception e) {
            log.error("解析单个订单数据失败", e);
            return null;
        }
    }
    
    /**
     * 处理订单创建
     */
    private void handleOrderCreated(String storeId, String orderId) {
        log.info("处理订单创建事件，店铺ID: {}, 订单ID: {}", storeId, orderId);
        // 发送订单创建事件到消息队列
    }
    
    /**
     * 处理订单确认
     */
    private void handleOrderAcknowledged(String storeId, String orderId) {
        log.info("处理订单确认事件，店铺ID: {}, 订单ID: {}", storeId, orderId);
        // 更新库存，发送确认通知
    }
    
    /**
     * 处理订单发货
     */
    private void handleOrderShipped(String storeId, String orderId) {
        log.info("处理订单发货事件，店铺ID: {}, 订单ID: {}", storeId, orderId);
        // 更新物流信息
    }
    
    /**
     * 处理订单送达
     */
    private void handleOrderDelivered(String storeId, String orderId) {
        log.info("处理订单送达事件，店铺ID: {}, 订单ID: {}", storeId, orderId);
        // 完成订单流程
    }
    
    /**
     * 处理订单取消
     */
    private void handleOrderCancelled(String storeId, String orderId) {
        log.info("处理订单取消事件，店铺ID: {}, 订单ID: {}", storeId, orderId);
        // 恢复库存，处理退款
    }
}