package com.erp.inventory.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.inventory.entity.Inventory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 库存Mapper接口
 *
 * @author ERP System
 */
@Mapper
public interface InventoryMapper extends BaseMapper<Inventory> {

    /**
     * 根据SKU和店铺ID查询库存
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     * @return 库存信息
     */
    @Select("SELECT * FROM inventory WHERE sku = #{sku} AND store_id = #{storeId}")
    Inventory selectBySkuAndStore(@Param("sku") String sku, @Param("storeId") Long storeId);

    /**
     * 原子性扣减可用库存
     *
     * @param sku      SKU编码
     * @param storeId  店铺ID
     * @param quantity 扣减数量
     * @param version  版本号
     * @return 影响行数
     */
    @Update("UPDATE inventory SET available_quantity = available_quantity - #{quantity}, " +
            "version = version + 1, updated_at = NOW() " +
            "WHERE sku = #{sku} AND store_id = #{storeId} AND version = #{version} " +
            "AND available_quantity >= #{quantity}")
    int deductAvailableQuantity(@Param("sku") String sku, 
                               @Param("storeId") Long storeId, 
                               @Param("quantity") Integer quantity, 
                               @Param("version") Integer version);

    /**
     * 原子性增加可用库存
     *
     * @param sku      SKU编码
     * @param storeId  店铺ID
     * @param quantity 增加数量
     * @param version  版本号
     * @return 影响行数
     */
    @Update("UPDATE inventory SET available_quantity = available_quantity + #{quantity}, " +
            "version = version + 1, updated_at = NOW() " +
            "WHERE sku = #{sku} AND store_id = #{storeId} AND version = #{version}")
    int addAvailableQuantity(@Param("sku") String sku, 
                            @Param("storeId") Long storeId, 
                            @Param("quantity") Integer quantity, 
                            @Param("version") Integer version);

    /**
     * 原子性预留库存
     *
     * @param sku      SKU编码
     * @param storeId  店铺ID
     * @param quantity 预留数量
     * @param version  版本号
     * @return 影响行数
     */
    @Update("UPDATE inventory SET available_quantity = available_quantity - #{quantity}, " +
            "reserved_quantity = reserved_quantity + #{quantity}, " +
            "version = version + 1, updated_at = NOW() " +
            "WHERE sku = #{sku} AND store_id = #{storeId} AND version = #{version} " +
            "AND available_quantity >= #{quantity}")
    int reserveQuantity(@Param("sku") String sku, 
                       @Param("storeId") Long storeId, 
                       @Param("quantity") Integer quantity, 
                       @Param("version") Integer version);

    /**
     * 原子性释放预留库存
     *
     * @param sku      SKU编码
     * @param storeId  店铺ID
     * @param quantity 释放数量
     * @param version  版本号
     * @return 影响行数
     */
    @Update("UPDATE inventory SET available_quantity = available_quantity + #{quantity}, " +
            "reserved_quantity = reserved_quantity - #{quantity}, " +
            "version = version + 1, updated_at = NOW() " +
            "WHERE sku = #{sku} AND store_id = #{storeId} AND version = #{version} " +
            "AND reserved_quantity >= #{quantity}")
    int releaseQuantity(@Param("sku") String sku, 
                       @Param("storeId") Long storeId, 
                       @Param("quantity") Integer quantity, 
                       @Param("version") Integer version);

    /**
     * 查询需要预警的库存
     *
     * @return 需要预警的库存列表
     */
    @Select("SELECT i.* FROM inventory i " +
            "WHERE i.available_quantity <= i.safety_stock " +
            "AND i.safety_stock > 0")
    List<Inventory> selectLowStockInventories();

    /**
     * 根据SKU查询所有店铺的库存
     *
     * @param sku SKU编码
     * @return 库存列表
     */
    @Select("SELECT * FROM inventory WHERE sku = #{sku} ORDER BY store_id")
    List<Inventory> selectBySku(@Param("sku") String sku);

    /**
     * 根据店铺ID查询所有库存
     *
     * @param storeId 店铺ID
     * @return 库存列表
     */
    @Select("SELECT * FROM inventory WHERE store_id = #{storeId} ORDER BY sku")
    List<Inventory> selectByStoreId(@Param("storeId") Long storeId);
}