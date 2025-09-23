package com.erp.logistics.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

/**
 * 物流异常状态枚举
 *
 * @author ERP System
 */
@Getter
public enum ExceptionStatus {

    /**
     * 待处理
     */
    PENDING(1, "待处理"),

    /**
     * 处理中
     */
    PROCESSING(2, "处理中"),

    /**
     * 已解决
     */
    RESOLVED(3, "已解决"),

    /**
     * 已关闭
     */
    CLOSED(4, "已关闭");

    @EnumValue
    private final Integer code;
    private final String description;

    ExceptionStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }
}