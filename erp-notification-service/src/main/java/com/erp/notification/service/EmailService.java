package com.erp.notification.service;

/**
 * 邮件服务接口
 *
 * @author ERP System
 */
public interface EmailService {

    /**
     * 发送邮件
     *
     * @param to 收件人
     * @param subject 主题
     * @param content 内容
     * @return 是否成功
     */
    boolean sendEmail(String to, String subject, String content);

    /**
     * 发送HTML邮件
     *
     * @param to 收件人
     * @param subject 主题
     * @param htmlContent HTML内容
     * @return 是否成功
     */
    boolean sendHtmlEmail(String to, String subject, String htmlContent);

    /**
     * 发送带附件的邮件
     *
     * @param to 收件人
     * @param subject 主题
     * @param content 内容
     * @param attachmentPath 附件路径
     * @return 是否成功
     */
    boolean sendEmailWithAttachment(String to, String subject, String content, String attachmentPath);
}