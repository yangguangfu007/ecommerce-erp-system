package com.erp.user.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.common.handler.JsonTypeHandler;
import com.erp.user.enums.ConfigType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Map;

/**
 * 系统配置实体类
 * 继承BaseEntity获得id、createTime、updateTime、deleted等通用字段
 * 
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("system_configs")
public class SystemConfig extends BaseEntity {
    
    /**
     * 配置分类
     */
    @TableField("category")
    private ConfigType category;
    
    /**
     * 配置键名
     */
    @TableField("config_key")
    private String configKey;
    
    /**
     * 配置值（字符串格式，支持各种类型的值）
     */
    @TableField("config_value")
    private String configValue;
    
    /**
     * 配置类型（string、number、boolean、json）
     */
    @TableField("value_type")
    private String valueType;
    
    /**
     * 配置描述
     */
    @TableField("description")
    private String description;
    
    /**
     * 是否可编辑
     */
    @TableField("editable")
    private Boolean editable;
    
    /**
     * 是否启用
     */
    @TableField("enabled")
    private Boolean enabled;
    
    /**
     * 排序顺序
     */
    @TableField("sort_order")
    private Integer sortOrder;
    
    /**
     * 获取实体描述信息
     * 
     * @return 实体描述
     */
    @Override
    public String getEntityDescription() {
        return "SystemConfig(configKey=" + configKey + ", category=" + category + ")";
    }
}