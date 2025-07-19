package com.erp.inventory.service;

import com.erp.inventory.dto.InventoryDTO;
import com.erp.inventory.entity.InventoryAlertConfig;

import java.util.List;

/**
 * 库存预警服务接口
 *
 * @author ERP System
 */
public interface InventoryAlertService {

    /**
     * 检查库存预警
     */
    void checkInventoryAlerts();

    /**
     * 检查单个SKU的库存预警
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     */
    void checkSingleInventoryAlert(String sku, Long storeId);

    /**
     * 创建预警配置
     *
     * @param config 预警配置
     * @return 预警配置
     */
    InventoryAlertConfig createAlertConfig(InventoryAlertConfig config);

    /**
     * 更新预警配置
     *
     * @param config 预警配置
     * @return 预警配置
     */
    InventoryAlertConfig updateAlertConfig(InventoryAlertConfig config);

    /**
     * 删除预警配置
     *
     * @param id 配置ID
     * @return 是否成功
     */
    boolean deleteAlertConfig(Long id);

    /**
     * 获取预警配置列表
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     * @return 预警配置列表
     */
    List<InventoryAlertConfig> getAlertConfigs(String sku, Long storeId);

    /**
     * 发送库存预警通知
     *
     * @param inventory   库存信息
     * @param alertConfig 预警配置
     */
    void sendAlertNotification(InventoryDTO inventory, InventoryAlertConfig alertConfig);

    /**
     * 处理库存不足的自动处理
     *
     * @param inventory 库存信息
     */
    void handleLowStockAutoProcess(InventoryDTO inventory);
}