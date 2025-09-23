package com.erp.logistics.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.erp.common.handler.EnumTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 地址类型枚举
 *
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum AddressType implements EnumTypeHandler.EnumValue {

    /**
     * 发件人地址
     */
    SENDER(1, "发件人地址"),

    /**
     * 收件人地址
     */
    RECIPIENT(2, "收件人地址"),

    /**
     * 退货地址
     */
    RETURN(3, "退货地址"),

    /**
     * 仓库地址
     */
    WAREHOUSE(4, "仓库地址"),

    /**
     * 门店地址
     */
    STORE(5, "门店地址");

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
     * @param code 类型代码
     * @return 地址类型枚举
     */
    public static AddressType getByCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (AddressType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }
}