package com.erp.platform.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

/**
 * 配置类型枚举
 * 定义平台配置的数据类型
 *
 * @author ERP System
 */
public enum ConfigType {
    /**
     * 字符串类型
     */
    STRING("STRING", "字符串"),
    
    /**
     * 数字类型
     */
    NUMBER("NUMBER", "数字"),
    
    /**
     * 布尔类型
     */
    BOOLEAN("BOOLEAN", "布尔值"),
    
    /**
     * JSON类型
     */
    JSON("JSON", "JSON对象"),
    
    /**
     * 密码类型
     */
    PASSWORD("PASSWORD", "密码"),
    
    /**
     * URL类型
     */
    URL("URL", "网址"),
    
    /**
     * 邮箱类型
     */
    EMAIL("EMAIL", "邮箱");
    
    /**
     * 类型代码 - 用于MyBatis Plus枚举值存储
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
     * @param code 类型代码
     * @param displayName 显示名称
     */
    ConfigType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
    
    /**
     * 获取类型代码
     *
     * @return 类型代码
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
     * 根据代码获取配置类型
     *
     * @param code 类型代码
     * @return 配置类型
     */
    public static ConfigType fromCode(String code) {
        for (ConfigType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("未知的配置类型代码: " + code);
    }
}