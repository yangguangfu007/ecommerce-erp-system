package com.erp.notification.service.impl;

import com.erp.notification.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * 短信服务实现
 * 这里使用模拟实现，实际项目中需要对接真实的短信服务商
 *
 * @author ERP System
 */
@Slf4j
@Service
public class SmsServiceImpl implements SmsService {

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${sms.api.url:}")
    private String smsApiUrl;

    @Value("${sms.api.key:}")
    private String smsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public boolean sendSms(String phoneNumber, String content) {
        try {
            log.info("发送短信: phoneNumber={}, content={}", phoneNumber, content);

            if (!smsEnabled) {
                log.info("短信服务未启用，模拟发送成功");
                return true;
            }

            // 这里应该调用真实的短信服务商API
            // 例如阿里云短信、腾讯云短信等
            boolean success = sendSmsViaProvider(phoneNumber, content);

            if (success) {
                log.info("短信发送成功: phoneNumber={}", phoneNumber);
            } else {
                log.warn("短信发送失败: phoneNumber={}", phoneNumber);
            }

            return success;

        } catch (Exception e) {
            log.error("短信发送异常: phoneNumber={}, content={}", phoneNumber, content, e);
            return false;
        }
    }

    @Override
    public boolean sendVerificationCode(String phoneNumber, String code) {
        String content = String.format("您的验证码是：%s，5分钟内有效，请勿泄露给他人。", code);
        return sendSms(phoneNumber, content);
    }

    @Override
    public int batchSendSms(String[] phoneNumbers, String content) {
        int successCount = 0;
        for (String phoneNumber : phoneNumbers) {
            try {
                if (sendSms(phoneNumber, content)) {
                    successCount++;
                }
            } catch (Exception e) {
                log.error("批量发送短信失败: phoneNumber={}", phoneNumber, e);
            }
        }
        log.info("批量发送短信完成: 总数={}, 成功={}", phoneNumbers.length, successCount);
        return successCount;
    }

    /**
     * 通过短信服务商发送短信
     * 这里是模拟实现，实际需要对接真实的短信服务商
     */
    private boolean sendSmsViaProvider(String phoneNumber, String content) {
        try {
            // 模拟短信发送
            if (!isValidPhoneNumber(phoneNumber)) {
                log.warn("无效的手机号: {}", phoneNumber);
                return false;
            }

            // 这里应该调用真实的短信API
            // 例如：
            // SmsRequest request = new SmsRequest();
            // request.setPhoneNumber(phoneNumber);
            // request.setContent(content);
            // request.setApiKey(smsApiKey);
            // 
            // SmsResponse response = restTemplate.postForObject(smsApiUrl, request, SmsResponse.class);
            // return response != null && response.isSuccess();

            // 模拟成功
            Thread.sleep(100); // 模拟网络延迟
            return true;

        } catch (Exception e) {
            log.error("调用短信服务商API失败", e);
            return false;
        }
    }

    /**
     * 验证手机号格式
     */
    private boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        // 简单的手机号验证，实际项目中可以使用更严格的正则表达式
        return phoneNumber.matches("^1[3-9]\\d{9}$");
    }
}