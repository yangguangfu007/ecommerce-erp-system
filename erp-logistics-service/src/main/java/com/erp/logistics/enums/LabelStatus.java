package com.erp.logistics.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.erp.common.handler.EnumTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 面单状态枚举
 *
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum LabelStatus implements EnumTypeHandler.EnumValue {

    /**
     * 待生成
     */
    PENDING(0, "待生成"),

    /**
     * 已生成
     */
    GENERATED(1, "已生成"),

    /**
     * 已打印
     */
    PRINTED(2, "已打印"),

    /**
     * 已使用
     */
    USED(3, "已使用"),

    /**
     * 已作废
     */
    CANCELLED(4, "已作废");

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
     * @return 面单状态枚举
     */
    public static LabelStatus getByCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (LabelStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return null;
    }

    /**
     * 检查是否可以打印
     *
     * @return true-可以打印，false-不可以打印
     */
    public boolean canPrint() {
        return this == GENERATED;
    }

    /**
     * 检查是否可以使用
     *
     * @return true-可以使用，false-不可以使用
     */
    public boolean canUse() {
        return this == GENERATED || this == PRINTED;
    }
}