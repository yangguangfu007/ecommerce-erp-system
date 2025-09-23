package com.erp.notification.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 通知状态枚举
 *
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum NotificationStatus {

    /**
     * 未读
     */
    UNREAD("UNREAD", "未读"),

    /**
     * 已读
     */
    READ("READ", "已读"),

    /**
     * 已删除
     */
    DELETED("DELETED", "已删除");

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
    public static NotificationStatus fromCode(String code) {
        for (NotificationStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("未知的通知状态: " + code);
    }
}