package com.erp.inventory.service;

/**
 * 库存同步服务接口
 *
 * @author ERP System
 */
public interface InventorySyncService {

    /**
     * 定时同步库存数据
     */
    void scheduledSyncInventory();

    /**
     * 验证库存数据一致性
     */
    void validateInventoryConsistency();

    /**
     * 修复库存数据不一致问题
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     * @return 是否修复成功
     */
    boolean repairInventoryInconsistency(String sku, Long storeId);

    /**
     * 同步外部平台库存
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     * @return 是否成功
     */
    boolean syncExternalPlatformInventory(String sku, Long storeId);

    /**
     * 批量同步库存
     */
    void batchSyncInventory();
}