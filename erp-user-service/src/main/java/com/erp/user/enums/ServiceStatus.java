package com.erp.user.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 服务状态枚举
 * 
 * @author ERP System
 */
@Getter
@AllArgsConstructor
public enum ServiceStatus {
    
    /**
     * 服务正常
     */
    UP("UP", "正常"),
    
    /**
     * 服务异常
     */
    DOWN("DOWN", "异常"),
    
    /**
     * 服务降级
     */
    DEGRADED("DEGRADED", "降级");
    
    /**
     * 服务状态代码
     */
    @EnumValue
    @JsonValue
    private final String code;
    
    /**
     * 服务状态描述
     */
    private final String description;
    
    /**
     * 根据代码获取服务状态
     * 
     * @param code 服务状态代码
     * @return 服务状态枚举
     */
    public static ServiceStatus fromCode(String code) {
        for (ServiceStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("未知的服务状态代码: " + code);
    }
}