package com.erp.user.dto;

import com.erp.user.enums.ConfigType;
import lombok.Data;

/**
 * 系统配置查询DTO
 * 
 * @author ERP System
 */
@Data
public class SystemConfigQueryDTO {
    
    /**
     * 配置分类
     */
    private ConfigType category;
    
    /**
     * 配置键名（模糊查询）
     */
    private String configKey;
    
    /**
     * 配置描述（模糊查询）
     */
    private String description;
    
    /**
     * 是否启用
     */
    private Boolean enabled;
    
    /**
     * 是否可编辑
     */
    private Boolean editable;
    
    /**
     * 配置类型
     */
    private String valueType;
}