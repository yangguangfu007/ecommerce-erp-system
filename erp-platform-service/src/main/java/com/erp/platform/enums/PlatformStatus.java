package com.erp.platform.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

/**
 * 平台状态枚举
 * 定义平台的各种状态
 *
 * @author ERP System
 */
public enum PlatformStatus {
    
    /**
     * 激活状态 - 平台正常运行
     */
    ACTIVE("ACTIVE", "激活", "平台正常运行，可以进行所有操作"),
    
    /**
     * 停用状态 - 平台暂时停用
     */
    INACTIVE("INACTIVE", "停用", "平台暂时停用，不能进行操作"),
    
    /**
     * 维护状态 - 平台正在维护
     */
    MAINTENANCE("MAINTENANCE", "维护中", "平台正在维护，暂时不可用"),
    
    /**
     * 错误状态 - 平台连接异常
     */
    ERROR("ERROR", "异常", "平台连接异常，需要检查配置"),
    
    /**
     * 已删除状态 - 平台已被删除
     */
    DELETED("DELETED", "已删除", "平台已被删除，不再使用");
    
    /**
     * 状态代码 - 用于MyBatis Plus枚举值存储
     */
    @EnumValue
    private final String code;
    
    /**
     * 状态显示名称
     */
    private final String displayName;
    
    /**
     * 状态描述
     */
    private final String description;
    
    /**
     * 构造函数
     *
     * @param code 状态代码
     * @param displayName 显示名称
     * @param description 状态描述
     */
    PlatformStatus(String code, String displayName, String description) {
        this.code = code;
        this.displayName = displayName;
        this.description = description;
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
     * 获取状态描述
     *
     * @return 状态描述
     */
    public String getDescription() {
        return description;
    }
    
    /**
     * 判断是否为可用状态
     *
     * @return 是否可用
     */
    public boolean isAvailable() {
        return this == ACTIVE;
    }
    
    /**
     * 判断是否为错误状态
     *
     * @return 是否为错误状态
     */
    public boolean isError() {
        return this == ERROR;
    }
    
    /**
     * 判断是否为已删除状态
     *
     * @return 是否已删除
     */
    public boolean isDeleted() {
        return this == DELETED;
    }
    
    /**
     * 根据代码获取平台状态
     *
     * @param code 状态代码
     * @return 平台状态
     */
    public static PlatformStatus fromCode(String code) {
        for (PlatformStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("未知的平台状态代码: " + code);
    }
}