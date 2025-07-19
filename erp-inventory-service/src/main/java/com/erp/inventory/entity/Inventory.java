package com.erp.inventory.entity;

import com.erp.common.entity.BaseEntity;
import com.baomidou.mybatisplus.annotation.*;

/**
 * 库存实体类
 *
 * @author ERP System
 */
@TableName("inventory")
public class Inventory extends BaseEntity {

    /**
     * SKU编码
     */
    @TableField("sku")
    private String sku;

    /**
     * 店铺ID
     */
    @TableField("store_id")
    private Long storeId;

    /**
     * 可用库存数量
     */
    @TableField("available_quantity")
    private Integer availableQuantity;

    /**
     * 预留库存数量
     */
    @TableField("reserved_quantity")
    private Integer reservedQuantity;

    /**
     * 总库存数量
     */
    @TableField("total_quantity")
    private Integer totalQuantity;

    /**
     * 安全库存
     */
    @TableField("safety_stock")
    private Integer safetyStock;

    /**
     * 仓库位置
     */
    @TableField("warehouse_location")
    private String warehouseLocation;

    /**
     * 乐观锁版本号
     */
    @Version
    @TableField("version")
    private Integer version;

    /**
     * 检查库存是否充足
     *
     * @param quantity 需要的数量
     * @return 是否充足
     */
    public boolean isAvailable(Integer quantity) {
        return this.availableQuantity != null && this.availableQuantity >= quantity;
    }

    /**
     * 检查是否需要库存预警
     *
     * @return 是否需要预警
     */
    public boolean needsAlert() {
        return this.availableQuantity != null && this.safetyStock != null 
               && this.availableQuantity <= this.safetyStock;
    }

    /**
     * 扣减可用库存
     *
     * @param quantity 扣减数量
     */
    public void deductAvailable(Integer quantity) {
        if (this.availableQuantity == null) {
            this.availableQuantity = 0;
        }
        this.availableQuantity -= quantity;
    }

    /**
     * 增加可用库存
     *
     * @param quantity 增加数量
     */
    public void addAvailable(Integer quantity) {
        if (this.availableQuantity == null) {
            this.availableQuantity = 0;
        }
        this.availableQuantity += quantity;
    }

    /**
     * 预留库存
     *
     * @param quantity 预留数量
     */
    public void reserve(Integer quantity) {
        if (this.availableQuantity == null) {
            this.availableQuantity = 0;
        }
        if (this.reservedQuantity == null) {
            this.reservedQuantity = 0;
        }
        this.availableQuantity -= quantity;
        this.reservedQuantity += quantity;
    }

    /**
     * 释放预留库存
     *
     * @param quantity 释放数量
     */
    public void release(Integer quantity) {
        if (this.availableQuantity == null) {
            this.availableQuantity = 0;
        }
        if (this.reservedQuantity == null) {
            this.reservedQuantity = 0;
        }
        this.availableQuantity += quantity;
        this.reservedQuantity -= quantity;
    }

    /**
     * 更新总库存
     */
    public void updateTotalQuantity() {
        int available = this.availableQuantity != null ? this.availableQuantity : 0;
        int reserved = this.reservedQuantity != null ? this.reservedQuantity : 0;
        this.totalQuantity = available + reserved;
    }

    // Getters and Setters
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

    @Override
    public String toString() {
        return "Inventory{" +
                "sku='" + sku + '\'' +
                ", storeId=" + storeId +
                ", availableQuantity=" + availableQuantity +
                ", reservedQuantity=" + reservedQuantity +
                ", totalQuantity=" + totalQuantity +
                ", safetyStock=" + safetyStock +
                ", warehouseLocation='" + warehouseLocation + '\'' +
                ", version=" + version +
                "} " + super.toString();
    }
}