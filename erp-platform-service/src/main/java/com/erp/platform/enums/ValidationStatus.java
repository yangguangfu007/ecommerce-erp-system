package com.erp.platform.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

/**
 * 验证状态枚举
 * 定义配置验证的状态
 *
 * @author ERP System
 */
public enum ValidationStatus {
    /**
     * 验证通过
     */
    VALID("VALID", "验证通过"),
    
    /**
     * 验证失败
     */
    INVALID("INVALID", "验证失败"),
    
    /**
     * 未验证
     */
    NOT_VALIDATED("NOT_VALIDATED", "未验证"),
    
    /**
     * 验证中
     */
    VALIDATING("VALIDATING", "验证中");
    
    /**
     * 状态代码 - 用于MyBatis Plus枚举值存储
     */
    @EnumValue
    private final String code;
    
    /**
     * 显示名称
     */
    private final String displayName;
    
    /**
     * 构造函数
     *
     * @param code 状态代码
     * @param displayName 显示名称
     */
    ValidationStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
    
    /**
     * 获取状态代码
     *
     * @return 状态代码
     */
    public String getCode() {
        return code;
    }
    
    /**
     * 获取显示名称
     *
     * @return 显示名称
     */
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * 根据代码获取验证状态
     *
     * @param code 状态代码
     * @return 验证状态
     */
    public static ValidationStatus fromCode(String code) {
        for (ValidationStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("未知的验证状态代码: " + code);
    }
}