package com.erp.logistics.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

/**
 * 物流异常类型枚举
 *
 * @author ERP System
 */
@Getter
public enum ExceptionType {

    /**
     * 包裹丢失
     */
    PACKAGE_LOST(1, "包裹丢失"),

    /**
     * 包裹损坏
     */
    PACKAGE_DAMAGED(2, "包裹损坏"),

    /**
     * 地址错误
     */
    ADDRESS_ERROR(3, "地址错误"),

    /**
     * 收件人拒收
     */
    RECIPIENT_REFUSED(4, "收件人拒收"),

    /**
     * 派送失败
     */
    DELIVERY_FAILED(5, "派送失败"),

    /**
     * 运输延误
     */
    TRANSPORT_DELAYED(6, "运输延误"),

    /**
     * 清关异常
     */
    CUSTOMS_EXCEPTION(7, "清关异常"),

    /**
     * 其他异常
     */
    OTHER(99, "其他异常");

    @EnumValue
    private final Integer code;
    private final String description;

    ExceptionType(Integer code, String description) {
        this.code = code;
        this.description = description;
    }
}