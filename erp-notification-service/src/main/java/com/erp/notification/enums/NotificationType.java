package com.erp.notification.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 通知类型枚举
 *
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum NotificationType {

    /**
     * 系统通知
     */
    SYSTEM("SYSTEM", "系统通知"),

    /**
     * 邮件通知
     */
    EMAIL("EMAIL", "邮件通知"),

    /**
     * 短信通知
     */
    SMS("SMS", "短信通知"),

    /**
     * 推送通知
     */
    PUSH("PUSH", "推送通知");

    /**
     * 数据库存储值
     */
    @EnumValue
    @JsonValue
    private final String code;

    /**
     * 显示名称
     */
    private final String description;

    /**
     * 根据代码获取枚举
     *
     * @param code 代码
     * @return 枚举值
     */
    public static NotificationType fromCode(String code) {
        for (NotificationType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("未知的通知类型: " + code);
    }
}