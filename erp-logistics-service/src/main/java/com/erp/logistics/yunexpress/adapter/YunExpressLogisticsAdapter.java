package com.erp.logistics.yunexpress.adapter;

import com.erp.logistics.adapter.LogisticsAdapter;
import com.erp.logistics.dto.LogisticsOrderRequest;
import com.erp.logistics.dto.LogisticsOrderResponse;
import com.erp.logistics.dto.LogisticsStatusResponse;
import com.erp.logistics.dto.ShippingLabelResponse;
import com.erp.logistics.yunexpress.config.YunExpressConfig;
import com.erp.logistics.yunexpress.dto.YunExpressOrderRequest;
import com.erp.logistics.yunexpress.dto.YunExpressOrderResponse;
import com.erp.logistics.yunexpress.dto.YunExpressTrackingResponse;
import com.erp.logistics.yunexpress.service.YunExpressApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

/**
 * 云途物流适配器实现
 *
 * @author ERP System
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class YunExpressLogisticsAdapter implements LogisticsAdapter {

    private final YunExpressApiService yunExpressApiService;
    private final YunExpressConfig yunExpressConfig;

    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public LogisticsOrderResponse createShippingOrder(LogisticsOrderRequest request) {
        try {
            log.info("创建云途物流订单，订单号: {}", request.getOrderNumber());
            
            // 转换请求格式
            YunExpressOrderRequest yunExpressRequest = convertToYunExpressRequest(request);
            
            // 调用云途API
            YunExpressOrderResponse yunExpressResponse = yunExpressApiService.createOrder(yunExpressRequest);
            
            if (yunExpressResponse.isSuccess()) {
                log.info("云途物流订单创建成功，运单号: {}", yunExpressResponse.getTrackingNumber());
                return LogisticsOrderResponse.success(
                    yunExpressResponse.getTrackingNumber(),
                    yunExpressResponse.getOrderId()
                );
            } else {
                log.error("云途物流订单创建失败: {}", yunExpressResponse.getErrorMessage());
                return LogisticsOrderResponse.failure(
                    yunExpressResponse.getErrorCode(),
                    yunExpressResponse.getErrorMessage()
                );
            }
        } catch (Exception e) {
            log.error("创建云途物流订单异常", e);
            throw e;
        }
    }

    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public ShippingLabelResponse generateLabel(String trackingNumber) {
        try {
            log.info("生成云途物流面单，运单号: {}", trackingNumber);
            
            String labelPdfBase64 = yunExpressApiService.generateLabel(trackingNumber);
            
            if (labelPdfBase64 != null && !labelPdfBase64.isEmpty()) {
                log.info("云途物流面单生成成功，运单号: {}", trackingNumber);
                return ShippingLabelResponse.success(trackingNumber, labelPdfBase64);
            } else {
                log.error("云途物流面单生成失败，运单号: {}", trackingNumber);
                return ShippingLabelResponse.failure("LABEL_GENERATION_FAILED", "面单生成失败");
            }
        } catch (Exception e) {
            log.error("生成云途物流面单异常，运单号: {}", trackingNumber, e);
            throw e;
        }
    }

    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public LogisticsStatusResponse queryStatus(String trackingNumber) {
        try {
            log.info("查询云途物流状态，运单号: {}", trackingNumber);
            
            YunExpressTrackingResponse trackingResponse = yunExpressApiService.queryTracking(trackingNumber);
            
            if (trackingResponse.isSuccess()) {
                LogisticsStatusResponse response = LogisticsStatusResponse.success(
                    trackingNumber,
                    trackingResponse.getCurrentStatus()
                );
                response.setStatusDescription(trackingResponse.getStatusDescription());
                response.setTrackingEvents(trackingResponse.getTrackingEvents());
                response.setLastUpdateTime(trackingResponse.getLastUpdateTime());
                
                log.info("云途物流状态查询成功，运单号: {}, 状态: {}", trackingNumber, trackingResponse.getCurrentStatus());
                return response;
            } else {
                log.error("云途物流状态查询失败，运单号: {}, 错误: {}", trackingNumber, trackingResponse.getErrorMessage());
                return LogisticsStatusResponse.failure(
                    trackingResponse.getErrorCode(),
                    trackingResponse.getErrorMessage()
                );
            }
        } catch (Exception e) {
            log.error("查询云途物流状态异常，运单号: {}", trackingNumber, e);
            throw e;
        }
    }

    @Override
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public boolean cancelOrder(String trackingNumber) {
        try {
            log.info("取消云途物流订单，运单号: {}", trackingNumber);
            
            boolean result = yunExpressApiService.cancelOrder(trackingNumber);
            
            if (result) {
                log.info("云途物流订单取消成功，运单号: {}", trackingNumber);
            } else {
                log.error("云途物流订单取消失败，运单号: {}", trackingNumber);
            }
            
            return result;
        } catch (Exception e) {
            log.error("取消云途物流订单异常，运单号: {}", trackingNumber, e);
            throw e;
        }
    }

    @Override
    public boolean testConnection() {
        try {
            log.info("测试云途物流连接");
            return yunExpressApiService.testConnection();
        } catch (Exception e) {
            log.error("测试云途物流连接异常", e);
            return false;
        }
    }

    @Override
    public String getProviderName() {
        return "YunExpress";
    }

    /**
     * 重试失败后的恢复方法
     */
    @Recover
    public LogisticsOrderResponse recoverCreateOrder(Exception ex, LogisticsOrderRequest request) {
        log.error("创建云途物流订单重试失败，订单号: {}", request.getOrderNumber(), ex);
        return LogisticsOrderResponse.failure("RETRY_FAILED", "创建订单重试失败: " + ex.getMessage());
    }

    @Recover
    public ShippingLabelResponse recoverGenerateLabel(Exception ex, String trackingNumber) {
        log.error("生成云途物流面单重试失败，运单号: {}", trackingNumber, ex);
        return ShippingLabelResponse.failure("RETRY_FAILED", "生成面单重试失败: " + ex.getMessage());
    }

    @Recover
    public LogisticsStatusResponse recoverQueryStatus(Exception ex, String trackingNumber) {
        log.error("查询云途物流状态重试失败，运单号: {}", trackingNumber, ex);
        return LogisticsStatusResponse.failure("RETRY_FAILED", "查询状态重试失败: " + ex.getMessage());
    }

    @Recover
    public boolean recoverCancelOrder(Exception ex, String trackingNumber) {
        log.error("取消云途物流订单重试失败，运单号: {}", trackingNumber, ex);
        return false;
    }

    /**
     * 转换请求格式
     */
    private YunExpressOrderRequest convertToYunExpressRequest(LogisticsOrderRequest request) {
        YunExpressOrderRequest yunExpressRequest = new YunExpressOrderRequest();
        yunExpressRequest.setOrderNumber(request.getOrderNumber());
        yunExpressRequest.setServiceType(request.getServiceType());
        yunExpressRequest.setRemark(request.getRemark());
        
        // 转换收件人信息
        YunExpressOrderRequest.RecipientInfo recipient = new YunExpressOrderRequest.RecipientInfo();
        recipient.setName(request.getRecipient().getName());
        recipient.setPhone(request.getRecipient().getPhone());
        recipient.setEmail(request.getRecipient().getEmail());
        recipient.setAddress(request.getRecipient().getAddress());
        recipient.setCity(request.getRecipient().getCity());
        recipient.setState(request.getRecipient().getState());
        recipient.setZipCode(request.getRecipient().getZipCode());
        recipient.setCountryCode(request.getRecipient().getCountryCode());
        yunExpressRequest.setRecipient(recipient);
        
        // 转换发件人信息
        YunExpressOrderRequest.SenderInfo sender = new YunExpressOrderRequest.SenderInfo();
        sender.setName(request.getSender().getName());
        sender.setPhone(request.getSender().getPhone());
        sender.setEmail(request.getSender().getEmail());
        sender.setAddress(request.getSender().getAddress());
        sender.setCity(request.getSender().getCity());
        sender.setState(request.getSender().getState());
        sender.setZipCode(request.getSender().getZipCode());
        sender.setCountryCode(request.getSender().getCountryCode());
        yunExpressRequest.setSender(sender);
        
        // 转换包裹信息
        YunExpressOrderRequest.PackageInfo packageInfo = new YunExpressOrderRequest.PackageInfo();
        packageInfo.setWeight(request.getPackageInfo().getWeight());
        packageInfo.setLength(request.getPackageInfo().getLength());
        packageInfo.setWidth(request.getPackageInfo().getWidth());
        packageInfo.setHeight(request.getPackageInfo().getHeight());
        packageInfo.setDescription(request.getPackageInfo().getDescription());
        packageInfo.setDeclaredValue(request.getPackageInfo().getDeclaredValue());
        packageInfo.setCurrency(request.getPackageInfo().getCurrency());
        yunExpressRequest.setPackageInfo(packageInfo);
        
        return yunExpressRequest;
    }
}