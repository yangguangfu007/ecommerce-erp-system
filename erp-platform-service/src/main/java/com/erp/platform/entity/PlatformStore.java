package com.erp.platform.entity;

import com.erp.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 平台店铺实体
 *
 * @author ERP System
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "platform_stores")
public class PlatformStore extends BaseEntity {
    
    /**
     * 店铺名称
     */
    @Column(name = "store_name", nullable = false, length = 100)
    private String storeName;
    
    /**
     * 平台类型
     */
    @Column(name = "platform_type", nullable = false, length = 50)
    private String platformType;
    
    /**
     * 平台店铺ID
     */
    @Column(name = "platform_store_id", length = 100)
    private String platformStoreId;
    
    /**
     * API凭证(JSON格式)
     */
    @Column(name = "api_credentials", columnDefinition = "TEXT")
    private String apiCredentials;
    
    /**
     * 状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StoreStatus status = StoreStatus.ACTIVE;
    
    /**
     * 最后同步时间
     */
    @Column(name = "last_sync_time")
    private LocalDateTime lastSyncTime;
    
    /**
     * 连接状态
     */
    @Column(name = "connection_status")
    private Boolean connectionStatus;
    
    /**
     * 最后连接检查时间
     */
    @Column(name = "last_connection_check")
    private LocalDateTime lastConnectionCheck;
    
    /**
     * 配置信息(JSON格式)
     */
    @Column(name = "config_data", columnDefinition = "TEXT")
    private String configData;
    
    /**
     * 店铺状态枚举
     */
    public enum StoreStatus {
        ACTIVE,     // 激活
        INACTIVE,   // 停用
        DELETED     // 已删除
    }
}