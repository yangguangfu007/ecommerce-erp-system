package com.erp.inventory.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.erp.inventory.entity.InventoryCheck;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 库存盘点Mapper接口
 *
 * @author ERP System
 */
@Mapper
public interface InventoryCheckMapper extends BaseMapper<InventoryCheck> {

    /**
     * 根据盘点单号查询盘点记录
     *
     * @param checkId 盘点单号
     * @return 盘点记录列表
     */
    @Select("SELECT * FROM inventory_check WHERE check_id = #{checkId} ORDER BY created_at")
    List<InventoryCheck> selectByCheckId(@Param("checkId") String checkId);

    /**
     * 根据SKU和店铺ID查询盘点记录
     *
     * @param sku     SKU编码
     * @param storeId 店铺ID
     * @return 盘点记录列表
     */
    @Select("SELECT * FROM inventory_check " +
            "WHERE sku = #{sku} AND store_id = #{storeId} " +
            "ORDER BY check_time DESC")
    List<InventoryCheck> selectBySkuAndStore(@Param("sku") String sku, @Param("storeId") Long storeId);

    /**
     * 查询待审批的盘点记录
     *
     * @return 盘点记录列表
     */
    @Select("SELECT * FROM inventory_check " +
            "WHERE check_status = 'PENDING' " +
            "ORDER BY check_time ASC")
    List<InventoryCheck> selectPending();

    /**
     * 查询有差异的盘点记录
     *
     * @return 盘点记录列表
     */
    @Select("SELECT * FROM inventory_check " +
            "WHERE difference_quantity != 0 " +
            "ORDER BY check_time DESC")
    List<InventoryCheck> selectWithDifference();

    /**
     * 根据状态查询盘点记录
     *
     * @param status 盘点状态
     * @return 盘点记录列表
     */
    @Select("SELECT * FROM inventory_check " +
            "WHERE check_status = #{status} " +
            "ORDER BY check_time DESC")
    List<InventoryCheck> selectByStatus(@Param("status") String status);
}