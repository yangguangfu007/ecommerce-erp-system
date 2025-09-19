package com.erp.platform.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

/**
 * 平台类型枚举
 * 定义支持的电商平台类型
 *
 * @author ERP System
 */
public enum PlatformType {
    
    /**
     * 沃尔玛平台
     */
    WALMART("沃尔玛", "walmart"),
    
    /**
     * 亚马逊平台
     */
    AMAZON("亚马逊", "amazon"),
    
    /**
     * eBay平台
     */
    EBAY("eBay", "ebay"),
    
    /**
     * 阿里巴巴平台
     */
    ALIBABA("阿里巴巴", "alibaba"),
    
    /**
     * 速卖通平台
     */
    ALIEXPRESS("速卖通", "aliexpress"),
    
    /**
     * Shopify平台
     */
    SHOPIFY("Shopify", "shopify"),
    
    /**
     * 其他平台
     */
    OTHER("其他", "other");
    
    /**
     * 平台显示名称
     */
    private final String displayName;
    
    /**
     * 平台代码 - 用于MyBatis Plus枚举值存储
     */
    @EnumValue
    private final String code;
    
    /**
     * 构造函数
     *
     * @param displayName 显示名称
     * @param code 平台代码
     */
    PlatformType(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
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
     * 获取平台代码
     *
     * @return 平台代码
     */
    public String getCode() {
        return code;
    }
    
    /**
     * 根据代码获取平台类型
     *
     * @param code 平台代码
     * @return 平台类型
     */
    public static PlatformType fromCode(String code) {
        for (PlatformType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("未知的平台代码: " + code);
    }
}