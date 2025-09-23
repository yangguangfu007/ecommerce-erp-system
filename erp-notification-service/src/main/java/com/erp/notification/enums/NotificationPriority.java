package com.erp.notification.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 通知优先级枚举
 *
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum NotificationPriority {

    /**
     * 低优先级
     */
    LOW("LOW", "低优先级", 1),

    /**
     * 普通优先级
     */
    NORMAL("NORMAL", "普通优先级", 2),

    /**
     * 高优先级
     */
    HIGH("HIGH", "高优先级", 3),

    /**
     * 紧急
     */
    URGENT("URGENT", "紧急", 4);

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
     * 优先级数值（数值越大优先级越高）
     */
    private final Integer level;

    /**
     * 根据代码获取枚举
     *
     * @param code 代码
     * @return 枚举值
     */
    public static NotificationPriority fromCode(String code) {
        for (NotificationPriority priority : values()) {
            if (priority.getCode().equals(code)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("未知的通知优先级: " + code);
    }
}