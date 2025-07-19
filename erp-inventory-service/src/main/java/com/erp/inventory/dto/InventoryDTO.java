package com.erp.inventory.dto;

import java.time.LocalDateTime;

/**
 * 库存DTO
 *
 * @author ERP System
 */
public class InventoryDTO {

    /**
     * 主键ID
     */
    private Long id;

    /**
     * SKU编码
     */
    private String sku;

    /**
     * 店铺ID
     */
    private Long storeId;

    /**
     * 可用库存数量
     */
    private Integer availableQuantity;

    /**
     * 预留库存数量
     */
    private Integer reservedQuantity;

    /**
     * 总库存数量
     */
    private Integer totalQuantity;

    /**
     * 安全库存
     */
    private Integer safetyStock;

    /**
     * 仓库位置
     */
    private String warehouseLocation;

    /**
     * 版本号
     */
    private Integer version;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 是否需要预警
     */
    private Boolean needsAlert;

    /**
     * 店铺名称（关联查询时使用）
     */
    private String storeName;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public Integer getReservedQuantity() {
        return reservedQuantity;
    }

    public void setReservedQuantity(Integer reservedQuantity) {
        this.reservedQuantity = reservedQuantity;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Integer getSafetyStock() {
        return safetyStock;
    }

    public void setSafetyStock(Integer safetyStock) {
        this.safetyStock = safetyStock;
    }

    public String getWarehouseLocation() {
        return warehouseLocation;
    }

    public void setWarehouseLocation(String warehouseLocation) {
        this.warehouseLocation = warehouseLocation;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
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

    public Boolean getNeedsAlert() {
        return needsAlert;
    }

    public void setNeedsAlert(Boolean needsAlert) {
        this.needsAlert = needsAlert;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    @Override
    public String toString() {
        return "InventoryDTO{" +
                "id=" + id +
                ", sku='" + sku + '\'' +
                ", storeId=" + storeId +
                ", availableQuantity=" + availableQuantity +
                ", reservedQuantity=" + reservedQuantity +
                ", totalQuantity=" + totalQuantity +
                ", safetyStock=" + safetyStock +
                ", warehouseLocation='" + warehouseLocation + '\'' +
                ", version=" + version +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", needsAlert=" + needsAlert +
                ", storeName='" + storeName + '\'' +
                '}';
    }
}