package com.erp.logistics.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.erp.common.handler.EnumTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 面单格式枚举
 *
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum LabelFormat implements EnumTypeHandler.EnumValue {

    /**
     * PDF格式
     */
    PDF(1, "PDF"),

    /**
     * PNG图片格式
     */
    PNG(2, "PNG"),

    /**
     * JPG图片格式
     */
    JPG(3, "JPG"),

    /**
     * ZPL打印格式
     */
    ZPL(4, "ZPL"),

    /**
     * EPL打印格式
     */
    EPL(5, "EPL");

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
     * @param code 格式代码
     * @return 面单格式枚举
     */
    public static LabelFormat getByCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (LabelFormat format : values()) {
            if (format.getCode().equals(code)) {
                return format;
            }
        }
        return null;
    }

    /**
     * 检查是否为图片格式
     *
     * @return true-图片格式，false-非图片格式
     */
    public boolean isImageFormat() {
        return this == PNG || this == JPG;
    }

    /**
     * 检查是否为打印机格式
     *
     * @return true-打印机格式，false-非打印机格式
     */
    public boolean isPrinterFormat() {
        return this == ZPL || this == EPL;
    }
}