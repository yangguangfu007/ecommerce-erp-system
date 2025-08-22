package com.erp.user.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 店铺DTO
 *
 * @author ERP System
 */
public class StoreDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 店铺ID
     */
    private Long id;

    /**
     * 店铺名称
     */
    private String storeName;

    /**
     * 平台名称
     */
    private String platform;

    /**
     * 平台店铺ID
     */
    private String platformStoreId;

    /**
     * 店铺状态
     */
    private String status;

    /**
     * 最后同步时间
     */
    private LocalDateTime lastSyncTime;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getPlatformStoreId() {
        return platformStoreId;
    }

    public void setPlatformStoreId(String platformStoreId) {
        this.platformStoreId = platformStoreId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastSyncTime() {
        return lastSyncTime;
    }

    public void setLastSyncTime(LocalDateTime lastSyncTime) {
        this.lastSyncTime = lastSyncTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "StoreDTO{" +
                "id=" + id +
                ", storeName='" + storeName + '\'' +
                ", platform='" + platform + '\'' +
                ", platformStoreId='" + platformStoreId + '\'' +
                ", status='" + status + '\'' +
                ", lastSyncTime=" + lastSyncTime +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}