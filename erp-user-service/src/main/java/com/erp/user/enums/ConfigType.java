package com.erp.user.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 系统配置类型枚举
 * 
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum ConfigType {
    
    /**
     * 系统配置
     */
    SYSTEM("SYSTEM", "系统配置"),
    
    /**
     * 业务配置
     */
    BUSINESS("BUSINESS", "业务配置"),
    
    /**
     * 安全配置
     */
    SECURITY("SECURITY", "安全配置"),
    
    /**
     * 通知配置
     */
    NOTIFICATION("NOTIFICATION", "通知配置"),
    
    /**
     * 集成配置
     */
    INTEGRATION("INTEGRATION", "集成配置");
    
    /**
     * 配置类型代码
     */
    @EnumValue
    @JsonValue
    private final String code;
    
    /**
     * 配置类型描述
     */
    private final String description;
    
    /**
     * 根据代码获取配置类型
     * 
     * @param code 配置类型代码
     * @return 配置类型枚举
     */
    public static ConfigType fromCode(String code) {
        for (ConfigType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("未知的配置类型代码: " + code);
    }
}