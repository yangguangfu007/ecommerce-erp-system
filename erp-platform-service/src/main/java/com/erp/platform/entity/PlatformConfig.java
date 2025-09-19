package com.erp.platform.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.platform.enums.ConfigType;
import com.erp.platform.enums.ValidationStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 平台配置实体类
 * 用于管理平台的具体配置信息
 * 继承BaseEntity获得id、createTime、updateTime、createBy、updateBy、deleted、version等通用字段
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("platform_configs")
public class PlatformConfig extends BaseEntity {
    
    /**
     * 平台ID
     */
    @TableField("platform_id")
    private Long platformId;
    
    /**
     * 配置名称
     */
    @TableField("config_name")
    private String configName;
    
    /**
     * 配置键
     */
    @TableField("config_key")
    private String configKey;
    
    /**
     * 配置值
     */
    @TableField("config_value")
    private String configValue;
    
    /**
     * 配置类型
     */
    @TableField("config_type")
    private ConfigType configType;
    
    /**
     * 是否加密存储
     */
    @TableField("encrypted")
    private Boolean encrypted = false;
    
    /**
     * 是否必填
     */
    @TableField("required")
    private Boolean required = false;
    
    /**
     * 配置描述
     */
    @TableField("description")
    private String description;
    
    /**
     * 默认值
     */
    @TableField("default_value")
    private String defaultValue;
    
    /**
     * 验证规则（正则表达式）
     */
    @TableField("validation_rule")
    private String validationRule;
    
    /**
     * 配置分组
     */
    @TableField("config_group")
    private String configGroup;
    
    /**
     * 排序顺序
     */
    @TableField("sort_order")
    private Integer sortOrder = 0;
    
    /**
     * 是否启用
     */
    @TableField("enabled")
    private Boolean enabled = true;
    
    /**
     * 最后验证时间
     */
    @TableField("last_validated")
    private LocalDateTime lastValidated;
    
    /**
     * 验证状态
     */
    @TableField("validation_status")
    private ValidationStatus validationStatus;
    
    /**
     * 验证错误信息
     */
    @TableField("validation_error")
    private String validationError;
    
    /**
     * 检查配置是否有效
     *
     * @return 是否有效
     */
    public boolean isValid() {
        return validationStatus == ValidationStatus.VALID;
    }
    
    /**
     * 检查配置是否为必填项
     *
     * @return 是否必填
     */
    public boolean checkRequired() {
        return required != null && required;
    }
    
    /**
     * 检查配置是否为加密存储
     *
     * @return 是否加密
     */
    public boolean checkEncrypted() {
        return encrypted != null && encrypted;
    }
    
    /**
     * 获取显示值（如果是加密字段则返回掩码）
     *
     * @return 显示值
     */
    public String getDisplayValue() {
        if (checkEncrypted() && configValue != null && !configValue.isEmpty()) {
            return "******";
        }
        return configValue;
    }
}