package com.erp.platform.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.erp.common.entity.BaseEntity;
import com.erp.common.handler.JsonTypeHandler;
import com.erp.platform.enums.PlatformStatus;
import com.erp.platform.enums.PlatformType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 平台实体类
 * 用于管理电商平台的基本信息
 * 继承BaseEntity获得id、createTime、updateTime、createBy、updateBy、deleted、version等通用字段
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("platforms")
public class Platform extends BaseEntity {
    
    /**
     * 平台名称
     */
    @TableField("platform_name")
    private String platformName;
    
    /**
     * 平台类型
     */
    @TableField("platform_type")
    private PlatformType platformType;
    
    /**
     * 平台代码
     */
    @TableField("platform_code")
    private String platformCode;
    
    /**
     * 平台描述
     */
    @TableField("description")
    private String description;
    
    /**
     * 平台状态
     */
    @TableField("status")
    private PlatformStatus status = PlatformStatus.ACTIVE;
    
    /**
     * 平台官网地址
     */
    @TableField("official_url")
    private String officialUrl;
    
    /**
     * API基础地址
     */
    @TableField("api_base_url")
    private String apiBaseUrl;
    
    /**
     * 支持的功能列表（JSON字段，使用JsonTypeHandler处理）
     */
    @TableField(value = "supported_features", typeHandler = JsonTypeHandler.class)
    private List<String> supportedFeatures;
    
    /**
     * 平台配置模板（JSON字段，使用JsonTypeHandler处理）
     */
    @TableField(value = "config_template", typeHandler = JsonTypeHandler.class)
    private Map<String, Object> configTemplate;
    
    /**
     * 是否启用
     */
    @TableField("enabled")
    private Boolean enabled = true;
    
    /**
     * 排序顺序
     */
    @TableField("sort_order")
    private Integer sortOrder = 0;
    
    /**
     * 最后更新时间
     */
    @TableField("last_updated")
    private LocalDateTime lastUpdated;
    
    /**
     * 备注信息
     */
    @TableField("remarks")
    private String remarks;
    
    /**
     * 获取平台显示名称
     *
     * @return 平台显示名称
     */
    public String getDisplayName() {
        return platformType != null ? platformType.getDisplayName() : platformName;
    }
    
    /**
     * 检查平台是否可用
     *
     * @return 是否可用
     */
    public boolean isAvailable() {
        return enabled != null && enabled && status != null && status.isAvailable();
    }
    
    /**
     * 检查平台是否有错误
     *
     * @return 是否有错误
     */
    public boolean hasError() {
        return status != null && status.isError();
    }
}