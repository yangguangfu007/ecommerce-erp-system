package com.erp.logistics.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.erp.common.handler.EnumTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 物流类型枚举
 *
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum LogisticsType implements EnumTypeHandler.EnumValue {

    /**
     * 标准快递
     */
    STANDARD(1, "标准快递"),

    /**
     * 特快专递
     */
    EXPRESS(2, "特快专递"),

    /**
     * 经济快递
     */
    ECONOMY(3, "经济快递"),

    /**
     * 国际快递
     */
    INTERNATIONAL(4, "国际快递"),

    /**
     * 海运
     */
    SEA_FREIGHT(5, "海运"),

    /**
     * 空运
     */
    AIR_FREIGHT(6, "空运"),

    /**
     * 陆运
     */
    LAND_FREIGHT(7, "陆运"),

    /**
     * 同城配送
     */
    LOCAL_DELIVERY(8, "同城配送");

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
     * @return 物流类型枚举
     */
    public static LogisticsType getByCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (LogisticsType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }

    /**
     * 检查是否为国际物流
     *
     * @return true-国际物流，false-国内物流
     */
    public boolean isInternational() {
        return this == INTERNATIONAL || this == SEA_FREIGHT || this == AIR_FREIGHT;
    }
}