package com.erp.inventory.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.inventory.entity.InventoryAlertConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 库存预警配置Mapper接口
 *
 * @author ERP System
 */
@Mapper
public interface InventoryAlertConfigMapper extends BaseMapper<InventoryAlertConfig> {

    /**
     * 根据SKU和店铺ID查询预警配置
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     * @return 预警配置列表
     */
    @Select("SELECT * FROM inventory_alert_config " +
            "WHERE (sku = #{sku} OR sku = 'DEFAULT') " +
            "AND (store_id = #{storeId} OR store_id IS NULL) " +
            "AND is_enabled = 1 " +
            "ORDER BY sku, store_id")
    List<InventoryAlertConfig> selectBySkuAndStore(@Param("sku") String sku, @Param("storeId") Long storeId);

    /**
     * 根据预警类型查询配置
     *
     * @param alertType 预警类型
     * @return 预警配置列表
     */
    @Select("SELECT * FROM inventory_alert_config " +
            "WHERE alert_type = #{alertType} AND is_enabled = 1")
    List<InventoryAlertConfig> selectByAlertType(@Param("alertType") String alertType);

    /**
     * 查询启用的预警配置
     *
     * @return 预警配置列表
     */
    @Select("SELECT * FROM inventory_alert_config WHERE is_enabled = 1")
    List<InventoryAlertConfig> selectEnabled();
}