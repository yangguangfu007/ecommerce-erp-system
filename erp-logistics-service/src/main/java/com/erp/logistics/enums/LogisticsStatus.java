package com.erp.logistics.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.erp.common.handler.EnumTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 物流状态枚举
 *
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum LogisticsStatus implements EnumTypeHandler.EnumValue {

    /**
     * 待处理
     */
    PENDING(0, "待处理"),

    /**
     * 已创建
     */
    CREATED(1, "已创建"),

    /**
     * 已揽收
     */
    PICKED_UP(2, "已揽收"),

    /**
     * 运输中
     */
    IN_TRANSIT(3, "运输中"),

    /**
     * 到达目的地
     */
    ARRIVED(4, "到达目的地"),

    /**
     * 派送中
     */
    OUT_FOR_DELIVERY(5, "派送中"),

    /**
     * 已签收
     */
    DELIVERED(6, "已签收"),

    /**
     * 异常
     */
    EXCEPTION(7, "异常"),

    /**
     * 退回
     */
    RETURNED(8, "退回"),

    /**
     * 已取消
     */
    CANCELLED(9, "已取消");

    @EnumValue
    private final Integer code;

    private final String description;

    @Override
    public Object getValue() {
        return this.code;
    }

    /**
     * 根据代码获取枚举
     *
     * @param code 状态代码
     * @return 物流状态枚举
     */
    public static LogisticsStatus getByCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (LogisticsStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }

    /**
     * 检查是否为终态状态
     *
     * @return true-终态，false-非终态
     */
    public boolean isFinalStatus() {
        return this == DELIVERED || this == RETURNED || this == CANCELLED;
    }

    /**
     * 检查是否为异常状态
     *
     * @return true-异常，false-正常
     */
    public boolean isExceptionStatus() {
        return this == EXCEPTION || this == RETURNED;
    }
}