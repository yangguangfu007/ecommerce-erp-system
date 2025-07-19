package com.erp.inventory.dto;

/**
 * 库存操作DTO
 *
 * @author ERP System
 */
public class InventoryOperationDTO {

    /**
     * SKU编码
     */
    private String sku;

    /**
     * 店铺ID
     */
    private Long storeId;

    /**
     * 操作数量
     */
    private Integer quantity;

    /**
     * 关联业务ID
     */
    private String referenceId;

    /**
     * 关联业务类型
     */
    private String referenceType;

    /**
     * 操作原因
     */
    private String reason;

    /**
     * 操作人
     */
    private String operator;

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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    @Override
    public String toString() {
        return "InventoryOperationDTO{" +
                "sku='" + sku + '\'' +
                ", storeId=" + storeId +
                ", quantity=" + quantity +
                ", referenceId='" + referenceId + '\'' +
                ", referenceType='" + referenceType + '\'' +
                ", reason='" + reason + '\'' +
                ", operator='" + operator + '\'' +
                '}';
    }
}