package com.erp.inventory.service;

import com.erp.inventory.dto.InventoryDTO;
import com.erp.inventory.dto.InventoryOperationDTO;
import com.erp.inventory.entity.Inventory;

import java.util.List;
import java.util.Map;

/**
 * 库存服务接口
 *
 * @author ERP System
 */
public interface InventoryService {

    /**
     * 根据SKU和店铺ID查询库存
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     * @return 库存信息
     */
    InventoryDTO getInventory(String sku, Long storeId);

    /**
     * 根据SKU查询所有店铺的库存
     *
     * @param sku SKU编码
     * @return 库存列表
     */
    List<InventoryDTO> getInventoryBySku(String sku);

    /**
     * 根据店铺ID查询所有库存
     *
     * @param storeId 店铺ID
     * @return 库存列表
     */
    List<InventoryDTO> getInventoryByStore(Long storeId);

    /**
     * 创建或更新库存
     *
     * @param inventoryDTO 库存信息
     * @return 库存信息
     */
    InventoryDTO saveOrUpdateInventory(InventoryDTO inventoryDTO);

    /**
     * 扣减库存（原子操作）
     *
     * @param operationDTO 操作信息
     * @return 是否成功
     */
    boolean deductInventory(InventoryOperationDTO operationDTO);

    /**
     * 释放库存（原子操作）
     *
     * @param operationDTO 操作信息
     * @return 是否成功
     */
    boolean releaseInventory(InventoryOperationDTO operationDTO);

    /**
     * 预留库存（原子操作）
     *
     * @param operationDTO 操作信息
     * @return 是否成功
     */
    boolean reserveInventory(InventoryOperationDTO operationDTO);

    /**
     * 释放预留库存（原子操作）
     *
     * @param operationDTO 操作信息
     * @return 是否成功
     */
    boolean releaseReservedInventory(InventoryOperationDTO operationDTO);

    /**
     * 调整库存
     *
     * @param operationDTO 操作信息
     * @return 是否成功
     */
    boolean adjustInventory(InventoryOperationDTO operationDTO);

    /**
     * 批量扣减库存
     *
     * @param operations 操作列表
     * @return 是否全部成功
     */
    boolean batchDeductInventory(List<InventoryOperationDTO> operations);

    /**
     * 批量释放库存
     *
     * @param operations 操作列表
     * @return 是否全部成功
     */
    boolean batchReleaseInventory(List<InventoryOperationDTO> operations);

    /**
     * 多店铺库存分配
     *
     * @param sku               SKU编码
     * @param storeAllocations  店铺分配映射 (店铺ID -> 分配数量)
     * @return 是否成功
     */
    boolean allocateInventory(String sku, Map<Long, Integer> storeAllocations);

    /**
     * 检查库存是否充足
     *
     * @param sku      SKU编码
     * @param storeId  店铺ID
     * @param quantity 需要数量
     * @return 是否充足
     */
    boolean checkInventoryAvailable(String sku, Long storeId, Integer quantity);

    /**
     * 获取需要预警的库存列表
     *
     * @return 需要预警的库存列表
     */
    List<InventoryDTO> getLowStockInventories();

    /**
     * 同步库存数据
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     * @return 是否成功
     */
    boolean syncInventory(String sku, Long storeId);
}