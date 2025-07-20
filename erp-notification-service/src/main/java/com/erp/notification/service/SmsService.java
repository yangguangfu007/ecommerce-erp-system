package com.erp.notification.service;

/**
 * 短信服务接口
 *
 * @author ERP System
 */
public interface SmsService {

    /**
     * 发送短信
     *
     * @param phoneNumber 手机号
     * @param content 内容
     * @return 是否成功
     */
    boolean sendSms(String phoneNumber, String content);

    /**
     * 发送验证码短信
     *
     * @param phoneNumber 手机号
     * @param code 验证码
     * @return 是否成功
     */
    boolean sendVerificationCode(String phoneNumber, String code);

    /**
     * 批量发送短信
     *
     * @param phoneNumbers 手机号列表
     * @param content 内容
     * @return 成功数量
     */
    int batchSendSms(String[] phoneNumbers, String content);
}