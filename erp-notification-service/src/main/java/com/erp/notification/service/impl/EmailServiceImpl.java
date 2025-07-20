package com.erp.notification.service.impl;

import com.erp.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.io.File;

/**
 * 邮件服务实现
 *
 * @author ERP System
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    @Override
    public boolean sendEmail(String to, String subject, String content) {
        try {
            log.info("发送邮件: to={}, subject={}", to, subject);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);

            mailSender.send(message);
            log.info("邮件发送成功: to={}", to);
            return true;

        } catch (Exception e) {
            log.error("邮件发送失败: to={}, subject={}", to, subject, e);
            return false;
        }
    }

    @Override
    public boolean sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            log.info("发送HTML邮件: to={}, subject={}", to, subject);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("HTML邮件发送成功: to={}", to);
            return true;

        } catch (Exception e) {
            log.error("HTML邮件发送失败: to={}, subject={}", to, subject, e);
            return false;
        }
    }

    @Override
    public boolean sendEmailWithAttachment(String to, String subject, String content, String attachmentPath) {
        try {
            log.info("发送带附件邮件: to={}, subject={}, attachment={}", to, subject, attachmentPath);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content);

            // 添加附件
            File attachment = new File(attachmentPath);
            if (attachment.exists()) {
                helper.addAttachment(attachment.getName(), attachment);
            }

            mailSender.send(message);
            log.info("带附件邮件发送成功: to={}", to);
            return true;

        } catch (Exception e) {
            log.error("带附件邮件发送失败: to={}, subject={}", to, subject, e);
            return false;
        }
    }
}