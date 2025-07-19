package com.erp.inventory.service;

import com.erp.inventory.entity.InventoryCheck;

import java.util.List;

/**
 * 库存盘点服务接口
 *
 * @author ERP System
 */
public interface InventoryCheckService {

    /**
     * 创建盘点记录
     *
     * @param inventoryCheck 盘点记录
     * @return 盘点记录
     */
    InventoryCheck createInventoryCheck(InventoryCheck inventoryCheck);

    /**
     * 批量创建盘点记录
     *
     * @param inventoryChecks 盘点记录列表
     * @return 是否成功
     */
    boolean batchCreateInventoryCheck(List<InventoryCheck> inventoryChecks);

    /**
     * 审批盘点记录
     *
     * @param checkId  盘点单号
     * @param approver 审批人
     * @param approved 是否通过
     * @param reason   审批原因
     * @return 是否成功
     */
    boolean approveInventoryCheck(String checkId, String approver, boolean approved, String reason);

    /**
     * 批量审批盘点记录
     *
     * @param checkIds 盘点单号列表
     * @param approver 审批人
     * @param approved 是否通过
     * @param reason   审批原因
     * @return 是否成功
     */
    boolean batchApproveInventoryCheck(List<String> checkIds, String approver, boolean approved, String reason);

    /**
     * 获取盘点记录
     *
     * @param checkId 盘点单号
     * @return 盘点记录列表
     */
    List<InventoryCheck> getInventoryCheckByCheckId(String checkId);

    /**
     * 根据SKU和店铺ID获取盘点记录
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     * @return 盘点记录列表
     */
    List<InventoryCheck> getInventoryCheckBySkuAndStore(String sku, Long storeId);

    /**
     * 获取待审批的盘点记录
     *
     * @return 盘点记录列表
     */
    List<InventoryCheck> getPendingInventoryChecks();

    /**
     * 获取有差异的盘点记录
     *
     * @return 盘点记录列表
     */
    List<InventoryCheck> getDifferenceInventoryChecks();

    /**
     * 执行库存盘点调整
     *
     * @param inventoryCheck 盘点记录
     * @return 是否成功
     */
    boolean executeInventoryAdjustment(InventoryCheck inventoryCheck);

    /**
     * 生成盘点单号
     *
     * @return 盘点单号
     */
    String generateCheckId();
}