package com.erp.user.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 系统日志级别枚举
 * 
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum LogLevel {
    
    /**
     * 调试级别
     */
    DEBUG("DEBUG", "调试"),
    
    /**
     * 信息级别
     */
    INFO("INFO", "信息"),
    
    /**
     * 警告级别
     */
    WARN("WARN", "警告"),
    
    /**
     * 错误级别
     */
    ERROR("ERROR", "错误");
    
    /**
     * 日志级别代码
     */
    @EnumValue
    @JsonValue
    private final String code;
    
    /**
     * 日志级别描述
     */
    private final String description;
    
    /**
     * 根据代码获取日志级别
     * 
     * @param code 日志级别代码
     * @return 日志级别枚举
     */
    public static LogLevel fromCode(String code) {
        for (LogLevel level : values()) {
            if (level.getCode().equals(code)) {
                return level;
            }
        }
        throw new IllegalArgumentException("未知的日志级别代码: " + code);
    }
}